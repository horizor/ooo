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

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('footer.link')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.ocr.com/" className="text-gray-600 hover:text-primary flex items-center justify-center md:justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  OCR
                </a>
              </li>
              <li>
                <a href="https://www.ocr.com/blog" className="text-gray-600 hover:text-primary flex items-center justify-center md:justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M17 5a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10zm-5 12a5 5 0 100-10 5 5 0 000 10zm0-2a3 3 0 110-6 3 3 0 010 6zm-1-4a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z"
                    />
                  </svg>
                  BLOG
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('footer.link')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy">
                  <a className="text-gray-600 hover:text-primary flex items-center justify-center md:justify-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t('footer.privacy')}
                  </a>
                </Link>
              </li>
              <li>
              <Link href="/terms-of-service">
              <a className="text-gray-600 hover:text-primary flex items-center justify-center md:justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('footer.terms')}
                </a>
                </Link>
              </li>
            </ul>
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