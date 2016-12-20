module.exports = function(availableLocales, defaultLocale) {
    return (req, res, next) => {
        const locale = getClientLocaleFromAcceptLanguage(req) || 'en-US';
        res.p = availableLocales[locale] || availableLocales[defaultLocale];
        res.locals.currentLocale = res.p.locale();
        
        next();  
    }; 
}

function getClientLocaleFromAcceptLanguage(req) {
    if(req.headers['accept-language']) {
        let accept = req.headers['accept-language'].split(',');
        if(accept) return accept[0];
    }

    return null;
}