import { useTranslation } from 'next-i18next';
import Link from 'next/link';

export default function Footer() {
  const { t } = useTranslation('common');

  // 定义支持的语言列表
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
  ];

  // 将语言列表分成两部分
  const firstHalfLanguages = languages.slice(0, Math.ceil(languages.length / 2));
  const secondHalfLanguages = languages.slice(Math.ceil(languages.length / 2));

  return (
    <footer className="bg-gradient-to-r from-blue-50 to-purple-50 mt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">LLMOCR</h3>
            <p className="text-gray-600 flex items-center justify-center md:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href="mailto:support@ocr.com" className="hover:text-primary">support@ocr.com</a>
            </p>
          </div>

      

          {/* Language Links */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('footer.language')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-2">
                {firstHalfLanguages.map((lang) => (
                  <li key={lang.code}>
                    <Link href={`/${lang.code}`} locale={lang.code}>
                      <a className="text-gray-600 hover:text-primary flex items-center justify-center md:justify-start">
                        {lang.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {secondHalfLanguages.map((lang) => (
                  <li key={lang.code}>
                    <Link href={`/${lang.code}`} locale={lang.code}>
                      <a className="text-gray-600 hover:text-primary flex items-center justify-center md:justify-start">
                        {lang.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          &copy; {new Date().getFullYear()} OCR
        </div>
      </div>
    </footer>
  );
}
