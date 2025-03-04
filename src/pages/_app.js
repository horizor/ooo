import '../styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import Script from 'next/script'; // 引入 Script 组件
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function MyApp({ Component, pageProps }) {
  const { t } = useTranslation('common');
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>{t('defaultTitle')}</title>
        <meta name="description" content={t('defaultDescription')} />
        {/* Google Analytics Script */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </Head>

      {/* 添加 Google AdSense 广告单元 */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center', marginbottom: '20px' }}
        data-ad-client="ca-pub-7"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <Script id="adsbygoogle-init" strategy="afterInteractive">
        (adsbygoogle = window.adsbygoogle || []).push({});
      </Script>

      {/* 渲染页面内容 */}
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(MyApp);