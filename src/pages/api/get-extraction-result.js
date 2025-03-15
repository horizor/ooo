// 引用相同的任务存储
import { taskStore } from './create-extraction-task';

export default async function handler(req, res) {
  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({ message: '缺少任务ID' });
  }

  const task = taskStore.get(taskId);
  
  if (!task) {
    return res.status(404).json({ message: '任务不存在' });
  }

  // 返回任务状态和结果
  res.status(200).json({
    taskId,
    status: task.status,
    result: task.result,
    error: task.error,
    fileInfo: {
      name: task.fileName,
      size: task.fileSize,
      type: task.fileType
    }
  });
}