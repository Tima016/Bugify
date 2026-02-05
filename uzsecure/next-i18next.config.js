module.exports = {
    i18n: {
        defaultLocale: 'uz',
        locales: ['uz', 'en', 'ru'],
        localeDetection: true,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};
