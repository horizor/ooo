import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, pageTitle, pageDescription }) {
  const { t } = useTranslation('common');

  // 如果没有提供特定的页面标题或描述，则使用默认值
  const title = pageTitle || t('defaultTitle');
  const description = pageDescription || t('defaultDescription');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-blue-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
