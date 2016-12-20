module.exports = function () {
    this.siteAddress = 'https://github.com/tucaz/all4sale';
    this.email = 'me@tucaz.net';
    this.products = __dirname + '/products.yml';
    this.productImagesFolder = __dirname + '/public/images/';
    this.productImagesUrl = '/public/images/products/';
    this.resizeProductImages = false;
    this.localesPath =  __dirname + '/locales/*.json';
    this.defaultLocale = 'en-US';
    this.availableLocales = ['en-US', 'pt-BR'];
    this.pages = {
        about: 'This is the about page'
    };
}