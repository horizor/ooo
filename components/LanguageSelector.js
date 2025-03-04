import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function LanguageSelector() {
  const router = useRouter();
  const [language, setLanguage] = useState(router.locale);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLanguage(router.locale);
  }, [router.locale]);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    setIsOpen(false);
    router.push(router.pathname, router.asPath, { locale: newLang });
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getLanguageDisplay = (lang) => {
    switch (lang) {
      case 'en': return 'English';      // 英语
      case 'zh': return '中文';         // 中文
      default: return 'English';       // 默认返回英语
    }
  };


  return (
    <div className="relative inline-block text-left z-50">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center w-35 rounded-lg bg-white border border-gray-200 shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
          onClick={toggleDropdown}
        >
          <span className="mr-2">{getLanguageDisplay(language)}</span>
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-35 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 overflow-hidden">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {['en', 'zh'].map((lang) => (
              <button
                key={lang}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out"
                role="menuitem"
                onClick={() => changeLanguage(lang)}
              >
                {getLanguageDisplay(lang)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
