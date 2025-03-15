// 使用 OpenAI 客户端替代智普AI
import OpenAI from 'openai';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// 存储任务状态的内存映射
const taskStore = new Map();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // 处理状态查询请求
  if (req.method === 'GET') {
    const taskId = req.query.taskId;
    if (!taskId) {
      return res.status(400).json({ message: '缺少任务ID' });
    }

    const taskInfo = taskStore.get(taskId);
    if (!taskInfo) {
      return res.status(404).json({ message: '任务不存在或已过期' });
    }

    return res.status(200).json(taskInfo);
  }

  // 处理文件上传请求
  if (req.method === 'POST') {
    try {
      console.log('开始处理文件上传请求...');

      // 检查方舟API密钥是否配置
      if (!process.env.ARK_API_KEY) {
        console.error('未配置 ARK_API_KEY');
        return res.status(500).json({ message: '服务器配置错误：未设置 API Key' });
      }

      // 更新 formidable 配置，将文件大小限制提高到10MB
      const form = formidable({
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
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
      const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp'];
      const fileExt = path.extname(file.originalFilename).toLowerCase();
      
      if (!supportedFormats.includes(fileExt)) {
        console.error('不支持的文件格式:', fileExt);
        return res.status(400).json({ 
          message: '不支持的文件格式，方舟多模态模型仅支持: ' + supportedFormats.join(', ') 
        });
      }

      // 生成唯一任务ID
      const taskId = crypto.randomUUID();
      
      // 创建任务状态
      taskStore.set(taskId, {
        status: 'processing',
        fileInfo: {
          name: file.originalFilename,
          size: file.size,
          type: file.mimetype
        },
        createdAt: new Date().toISOString()
      });

      // 立即返回任务ID，不等待处理完成
      res.status(202).json({ 
        taskId,
        status: 'processing',
        message: '文件已接收，正在处理中'
      });

      // 异步处理文件
      processFile(taskId, file).catch(error => {
        console.error('处理文件时出错:', error);
        taskStore.set(taskId, {
          status: 'error',
          error: error.message,
          fileInfo: {
            name: file.originalFilename,
            size: file.size,
            type: file.mimetype
          }
        });
        
        // 设置任务过期时间（30分钟后自动清理）
        setTimeout(() => {
          taskStore.delete(taskId);
        }, 30 * 60 * 1000);
      });

    } catch (error) {
      console.error('服务器处理错误:', error);
      res.status(500).json({
        message: '服务器处理错误',
        error: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// 异步处理文件的函数
async function processFile(taskId, file) {
  try {
    // 读取文件内容
    const fileData = await fs.promises.readFile(file.filepath);
    const base64Data = fileData.toString('base64');
    
    // 根据文件类型设置正确的MIME类型前缀
    const fileExt = path.extname(file.originalFilename).toLowerCase();
    let mimeType;
    switch(fileExt) {
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
    const openai = new OpenAI({
      apiKey: process.env.ARK_API_KEY,
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
      timeout: 60000, // 设置60秒超时
      maxRetries: 3, // 增加重试次数
    });

    // 调用方舟pro-32k-250115模型
    console.log('开始调用方舟pro-32k-250115模型...');
    const response = await openai.chat.completions.create({
      model: 'doubao-1-5-vision-pro-32k-250115', // 使用方舟多模态模型
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
    await fs.promises.unlink(file.filepath);

    console.log('文本提取完成');

    // 更新任务状态为完成
    const extractedText = response.choices[0].message.content;
    taskStore.set(taskId, {
      status: 'completed',
      content: extractedText,
      fileInfo: {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype
      },
      completedAt: new Date().toISOString()
    });
    
    // 设置任务过期时间（30分钟后自动清理）
    setTimeout(() => {
      taskStore.delete(taskId);
    }, 30 * 60 * 1000);
    
  } catch (error) {
    console.error('处理文件时出错:', error);
    taskStore.set(taskId, {
      status: 'error',
      error: error.message,
      fileInfo: {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype
      }
    });
    
    // 设置任务过期时间（30分钟后自动清理）
    setTimeout(() => {
      taskStore.delete(taskId);
    }, 30 * 60 * 1000);
    
    throw error;
  }
}
