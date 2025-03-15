import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadSection() {
  const { t } = useTranslation('common');
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const onDrop = async (acceptedFiles) => {
    setError(null);
    setExtractedText('');
    setFileInfo(null);
    
    if (acceptedFiles.length === 0) {
      setError(t('upload.noFileSelected'));
      return;
    }

    setIsLoading(true);
    const file = acceptedFiles[0];
    
    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) {
      setError(t('upload.fileTooLarge'));
      setIsLoading(false);
      return;
    }
    
    // 显示文件信息
    const fileDetails = {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2)
    };
    setFileInfo(fileDetails);
    
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      // 创建任务
      const createResponse = await fetch('/api/create-extraction-task', {
        method: 'POST',
        body: formData,
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || t('upload.processingError'));
      }
  
      const { taskId } = await createResponse.json();
      
      // 开始轮询任务状态
      await pollTaskResult(taskId);
    } catch (error) {
      console.error('处理错误:', error);
      setError(error.message || t('upload.processingError'));
      setIsLoading(false);
    }
  };

  // 轮询任务结果
  const pollTaskResult = async (taskId) => {
    try {
      const response = await fetch(`/api/get-extraction-result?taskId=${taskId}`);
      
      if (!response.ok) {
        throw new Error('获取任务结果失败');
      }
      
      const data = await response.json();
      
      if (data.status === 'completed') {
        // 任务完成
        setExtractedText(data.result);
        setIsLoading(false);
      } else if (data.status === 'failed') {
        // 任务失败
        throw new Error(data.error || t('upload.processingError'));
      } else {
        // 任务仍在处理中，继续轮询
        setTimeout(() => pollTaskResult(taskId), 2000);
      }
    } catch (error) {
      console.error('轮询错误:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
  });

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    alert(t('upload.textCopied'));
  };

  return (
    <div id="upload" className="max-w-4xl mx-auto p-2 mt-2 py-20">  {/* 添加 id="upload" */}
      <h1 className="text-4xl font-bold text-center mb-4">
        {t('upload.title')}
      </h1>


      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">{t('upload.dropAreaTitle')}</h3>
          <p className="text-gray-500">
            {isDragActive ? t('upload.dropAreaActive') : t('upload.dropAreaText')}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {t('upload.glm4vSupportedFormats')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('upload.glm4vSizeLimit')}
          </p>
        </div>
      </div>


      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2">{t('upload.processing')}</p>
        </div>
      )}

      {extractedText && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">{t('upload.extractedText')}</h2>
            <button
              onClick={handleCopyText}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition-colors text-white font-bold"
            >
              {t('upload.copyText')}
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <pre className="whitespace-pre-wrap">{extractedText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

