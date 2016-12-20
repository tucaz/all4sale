module.exports = function (app, products, vm, sitemap, customFacets, email) {
    const Facets = require(__dirname + "/facets.js"),
        FacetTranslator = require(__dirname + "/facetTranslator.js"),
        numeral = require("numeral"),
        _ = require('lodash'),
        pug = require('pug'),
        ptBRLanguage = require("numeral/languages/pt-br.js"),
        enUSLanguage = require(__dirname + "/locales/numeral/en-us.js");

    numeral.language("pt-BR", ptBRLanguage);
    numeral.language("en-US", enUSLanguage);

    app.post("/email", (req, res, next) => {
        products.load(req.body.product, (err, product) => {
            if (err) return next(err);

            let customer = {
                name: req.body.name,
                email: req.body.email, 
                phone: req.body.phone, 
                city: req.body.city, 
                message: req.body.message
            };            
            
            if(email && typeof(email) === 'object' && typeof(email.send) === 'function') {
                email.send(customer, product, (err) => {
                    if(err) {
                        res.send(err);
                        res.end();
                        return;
                    }

                    res.send('OK');
                    res.end();
                });
            } else {
                console.log('WARN: No email provider configured');
                res.send('No email configured');
                res.end();
            }
        });
    });

    app.get("/products", (req, res, next) => {
        let options = {
            category: req.query.category,
            condition: req.query.condition,
            sold: req.query.sold
        }

        products.loadAll(options, (err, products) => {
            if (err) return next(err);

            res.send(products);
            res.end();
        });
    });

    app.get("/", (req, res, next) => {
        let options = {
            category: req.query.category,
            condition: req.query.condition,
            sold: req.query.sold
        }

        //TODO: Handle custom facets in a better way
        if (customFacets) {
            Object.keys(customFacets).forEach(facetKey => {
                if (!options[facetKey] && req.query[facetKey]) {
                    options[facetKey] = req.query[facetKey];
                }
            });
        }

        products.loadAll(options, (err, allProducts) => {
            if (err) return next(err);

            let translator = new FacetTranslator(res.p),
                facets = new Facets(translator, customFacets);

            facets.loadAllFacets(allProducts, options, (err, facets) => {
                if (err) return next(err);

                numeral.language(res.locals.currentLocale);
                allProducts = _.map(allProducts, product => {
                    product.price = numeral(product.price).format("$0,0.00");
                    return product;
                });

                let messages = {
                    sidebar: {
                        selectedFiltersText: res.p.t("sidebar.selectedFiltersText"),
                        filtersAvailableText: res.p.t("sidebar.filtersAvailableText")
                    },
                    home: {
                        productCount: res.p.t("home.productCount", { count: allProducts.length })
                    }
                },
                    head = {
                        title: res.p.t("home.title", { sitename: res.p.t("global.sitename") })
                    };

                let results = vm.indexViewModel(allProducts);
                res.render("index.pug", { links: req.links, results, facets, count: allProducts.length, messages, head });
            });
        });
    });

    app.get("/products/:slug", (req, res, next) => {
        let slug = req.params.slug;
        products.load(slug, (err, product) => {
            if (err) return next(err);

            numeral.language(res.locals.currentLocale);
            product.price = numeral(product.price).format("$0,0.00");

            let messages = {
                product: {
                    buyButton: res.p.t("product.buyButton")
                },
                contactForm: {
                    formLegend: res.p.t("contactForm.formLegend"),
                    formInstructions: res.p.t("contactForm.formInstructions"),
                    nameField: res.p.t("contactForm.nameField"),
                    nameFieldPlaceholder: res.p.t("contactForm.nameFieldPlaceholder"),
                    emailField: res.p.t("contactForm.emailField"),
                    emailFieldPlaceholder: res.p.t("contactForm.emailFieldPlaceholder"),
                    phoneField: res.p.t("contactForm.phoneField"),
                    phoneFieldPlaceholder: res.p.t("contactForm.phoneFieldPlaceholder"),
                    cityField: res.p.t("contactForm.cityField"),
                    cityFieldPlaceholder: res.p.t("contactForm.cityFieldPlaceholder"),
                    messageField: res.p.t("contactForm.messageField"),
                    sendButton: res.p.t("contactForm.sendButton"),
                    successMessage: res.p.t("contactForm.successMessage")
                }
            },
                head = {
                    title: res.p.t("product.title", { sitename: res.p.t("global.sitename"), productName: product.name })
                };

            res.render("product.pug", { links: req.links, product, messages, head });
        });
    });

    app.get("/about", (req, res, next) => {
        let messages = {
            about: {
                headerText: res.p.t("about.headerText"),
                bodyText: res.p.t("about.bodyText")
            }
        },
            head = {
                title: res.p.t("about.title", { sitename: res.p.t("global.sitename") })
            };

        res.render("about.pug", { links: req.links, messages, head });
    });

    app.get("/search", function (req, res, next) {
        let k = req.query.k,
            categories = req.query.categories,
            skip = req.query.skip,
            take = req.query.take;

        if (categories) {
            categories = categories.split(",");
        }

        products.search(k, categories, skip, take, function (err, response) {
            if (err) return next(err);

            res.json(response);
        });
    });

    app.get("/robots.txt", (req, res, next) => {
        res.header("Content-Type", "text/plain");
        res.send("User-agent: *\nDisallow:");
        res.end();
    });

    app.get("/sitemap.xml", (req, res, next) => {
        sitemap.toXML(function (err, xml) {
            if (err) next(err);

            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });

    return app;
}