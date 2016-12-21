const express = require('express'),
    pug = require('pug'),
    bodyParser = require('body-parser'),
    _ = require("lodash"),
    sm = require("sitemap"),
    errorhandler = require('errorhandler'),
    
    helpers = require(__dirname + '/helpers.js'),
    Config = require(__dirname + '/config.js'),
    Products = require(__dirname + '/products.js'),
    locale = require(__dirname + '/locale.js'),
    routes = require(__dirname + '/routes.js'),
    activeUrlMiddleware = require(__dirname + '/middleware/activeUrl.js'),
    localeMiddleware = require(__dirname + '/middleware/locale.js'),
    configMiddleware = require(__dirname + '/middleware/config.js'),
    viewHelperMiddleware = require(__dirname + '/middleware/viewHelper.js'),
    vm = require(__dirname + "/viewmodels.js");

    self = this,
    app = express();

app.set("view engine", "pug")
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.use("/bower_components", express.static(__dirname + "/bower_components"));
app.use(bodyParser.json());
app.use(errorhandler());
app.locals.pretty = true;

module.exports = function (options) {
    let config = new Config();
    _.extend(config, options);

    let products = new Products(config.products, config.productImagesFolder);
    let defaultLocales = locale.loadDefaults(config.localesPath, config.l18n);
    let locales = locale.filterAvailable(defaultLocales, config.availableLocales);

    app.use(localeMiddleware(locales, config.defaultLocale));
    app.use(activeUrlMiddleware());
    app.use(configMiddleware(config));
    app.use(viewHelperMiddleware(config.productImagesUrl, config.resizeProductImages));

    let productUrls = _.map(products.loadProductUrlsSync(), url => { return { url, changefreq: 'weekly' } });

    let sitemap = sm.createSitemap({
        hostname: config.siteAddress,
        cacheTime: 60 * 60 * 1000, 
        urls: productUrls
    });
    
    routes(app, products, vm, sitemap, config.facets, config.email);

    return app;
};