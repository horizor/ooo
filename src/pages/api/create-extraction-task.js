import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// 模拟数据库存储任务状态
const taskStore = new Map();

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
    // 解析文件上传
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
      allowEmptyFiles: false,
      multiples: false,
    });

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
      return res.status(400).json({ message: '未找到上传的文件' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    // 检查文件格式
    const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileExt = path.extname(file.originalFilename).toLowerCase();
    
    if (!supportedFormats.includes(fileExt)) {
      return res.status(400).json({ 
        message: '不支持的文件格式，方舟多模态模型仅支持: ' + supportedFormats.join(', ') 
      });
    }

    // 创建任务ID
    const taskId = uuidv4();
    
    // 存储任务信息
    taskStore.set(taskId, {
      status: 'pending',
      filePath: file.filepath,
      fileName: file.originalFilename,
      fileSize: file.size,
      fileType: file.mimetype,
      fileExt: fileExt,
      result: null,
      createdAt: new Date()
    });

    // 触发后台处理（在实际生产环境中，这里应该使用队列服务）
    processTask(taskId);

    // 返回任务ID
    res.status(200).json({ 
      taskId: taskId,
      status: 'pending'
    });

  } catch (error) {
    console.error('创建任务错误:', error);
    res.status(500).json({
      message: '服务器处理错误',
      error: error.message,
    });
  }
}

// 后台处理任务
async function processTask(taskId) {
  const task = taskStore.get(taskId);
  if (!task) return;

  try {
    // 更新任务状态
    taskStore.set(taskId, { ...task, status: 'processing' });

    // 读取文件内容
    const fileData = await fs.promises.readFile(task.filePath);
    const base64Data = fileData.toString('base64');
    
    // 根据文件类型设置正确的MIME类型前缀
    let mimeType;
    switch(task.fileExt) {
      case '.png':
        mimeType = 'image/png';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      default:
        mimeType = 'image/jpeg'; // 对于.jpg和.jpeg
    }
    
    const fileUrl = `data:${mimeType};base64,${base64Data}`;

    // 初始化OpenAI客户端并配置为使用方舟API
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.ARK_API_KEY,
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    });

    // 调用方舟模型
    const response = await openai.chat.completions.create({
      model: 'doubao-1-5-vision-pro-32k-250115',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请提取这个图像中的所有文本内容，保持原始格式。如果是表格，请保持表格结构。如果没有文字内容，输出NO Text'
            },
            {
              type: 'image_url',
              image_url: {
                url: fileUrl
              }
            }
          ]
        }
      ],
      temperature: 0.2,
    });

    // 清理临时文件
    await fs.promises.unlink(task.filePath);

    // 更新任务结果
    taskStore.set(taskId, { 
      ...task, 
      status: 'completed', 
      result: response.choices[0].message.content,
      completedAt: new Date()
    });
  } catch (error) {
    console.error('任务处理错误:', error);
    taskStore.set(taskId, { 
      ...task, 
      status: 'failed', 
      error: error.message,
      completedAt: new Date()
    });
  }
}