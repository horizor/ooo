import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';

import UploadSection from '../components/UploadSection';


export default function Home() {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <UploadSection />
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
 
