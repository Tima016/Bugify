"use client";

import { useRouter } from 'next/router';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function LanguageSwitcher() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

    const changeLanguage = (locale: string) => {
        router.push(router.pathname, router.asPath, { locale });
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Change language"
            >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 ${router.locale === lang.code ? 'bg-gray-50 dark:bg-gray-800' : ''
                                }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <div>
                                <div className="font-medium">{lang.name}</div>
                                <div className="text-xs text-gray-500">{lang.code.toUpperCase()}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
