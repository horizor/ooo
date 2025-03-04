import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const { t } = useTranslation('common');

  return (
    <header className="fixed w-full bg-transparent backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-300">
            <div className="flex items-center space-x-2">
 
              <span className="text-2xl font-bold text-primary">LLMOCR</span>
            </div>
          </a>
        </Link>
        <nav>
          <ul className="font-bold flex space-x-5">
            <li>
              <Link href="/">
                <a className="relative font-bold text-gray-700 hover:text-primary transition-colors duration-350 group">
                  {t('nav.home')}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transform -translate-x-1/2 transition-all duration-350 group-hover:w-full"></span>
                </a>
              </Link>
            </li>

          </ul>
        </nav>
        <LanguageSelector />
      </div>
    </header>
  );
}