import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';

export default function Blog() {
  const { t } = useTranslation('blog');
  const [isLoading, setIsLoading] = useState(true);

  // 监听 iframe 加载完成
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Layout pageTitle={t('ocr-pdf-Title')}>
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mt-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient py-4">
          {t('ocr-pdf-Title')}
        </h1>
        
        {/* iframe 框架容器 */}
        <div className="flex justify-center mt-8 relative">
          <iframe
            src="https://pieree369-olmocr.hf.space"
            frameBorder="0"
            className="w-full max-w-4xl"
            style={{ height: '800px' }}
            onLoad={handleIframeLoad}
          />
          
          {/* Loading 效果 - 调整为靠上显示 */}
          {isLoading && (
            <div className="absolute inset-0 flex justify-center bg-gray-100 bg-opacity-75 pt-20">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-800 animate-pulse">
                  Loading
                  <span className="inline-block animate-bounce">.</span>
                  <span className="inline-block animate-bounce delay-100">.</span>
                  <span className="inline-block animate-bounce delay-200">.</span>
                </div>
                <p className="text-gray-600 mt-2">Please wait while content loads</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'blog'])),
    },
  };
}
