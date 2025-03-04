import { ZhipuAI } from 'zhipuai';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('开始处理文件上传请求...');

    if (!process.env.ZHIPU_API_KEY) {
      console.error('未配置 ZHIPU_API_KEY');
      return res.status(500).json({ message: '服务器配置错误：未设置 API Key' });
    }

    // 更新 formidable 配置
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      multiples: false,
    });

    // 使用 Promise 包装文件解析
    const formData = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ fields, files });
      });
    });

    const { files } = formData;
    
    if (!files || !files.file) {
      console.error('没有接收到文件');
      return res.status(400).json({ message: '未找到上传的文件' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    console.log('接收到文件:', file.originalFilename);

    // 检查文件格式
    const supportedFormats = ['.png', '.jpg', '.jpeg'];
    const fileExt = path.extname(file.originalFilename).toLowerCase();
    
    if (!supportedFormats.includes(fileExt)) {
      console.error('不支持的文件格式:', fileExt);
      return res.status(400).json({ 
        message: '不支持的文件格式，GLM-4V-Flash模型仅支持: ' + supportedFormats.join(', ') 
      });
    }

    // 读取文件内容
    const fileData = await fs.promises.readFile(file.filepath);
    const base64Data = fileData.toString('base64');
    const fileUrl = `data:${file.mimetype};base64,${base64Data}`;

    // 初始化智普AI客户端
    const client = new ZhipuAI({
      apiKey: process.env.ZHIPU_API_KEY,
    });

    // 调用GLM-4V-Flash模型
    console.log('开始调用GLM-4V-Flash模型...');
    const response = await client.chat.completions.create({
      model: 'glm-4v-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: fileUrl
              }
            },
            {
              type: 'text',
              text: '请提取这个图像中的所有文本内容，保持原始格式。如果是表格，请保持表格结构。如果没有文字内容，输出NO'
            }
          ]
        }
      ],
      temperature: 0.2,
      top_p: 0.5,
      do_sample: false,
    });

    // 清理临时文件
    await fs.promises.unlink(file.filepath);

    console.log('文本提取完成');

    // 返回提取的文本内容
    const extractedText = response.choices[0].message.content;
    res.status(200).json({ 
      content: extractedText,
      fileInfo: {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype
      }
    });

  } catch (error) {
    console.error('服务器处理错误:', error);
    res.status(500).json({
      message: '服务器处理错误',
      error: error.message,
    });
  }
}
