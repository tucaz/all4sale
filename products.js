module.exports = function (productsFile, productImagesFolder) {
    let helpers = require(__dirname + "/helpers.js"),
        fs = require("fs"),
        async = require("async"),
        path = require("path"),
        _ = require("lodash"),
        self = this,
        imagesFolder = productImagesFolder;

    this.load = (slug, callback) => {
        self.loadAll(null, (err, products) => {
            if (err) return callback(err);

            let product = _.find(products, { slug: slug });

            callback(null, product);
        });
    };

    this.loadAll = (options, callback) => {
        loadAllFromFile((err, rawProducts) => {
            if (err) return callback(err);

            parseAllProducts(rawProducts, (err, allProducts) => {
                if (err) return callback(err);

                if (options && options.category) {
                    allProducts = _.filter(allProducts, product => { return isInCategory(product, options.category); });
                }

                if (options && options.condition) {
                    allProducts = _.filter(allProducts, product => { return product.condition === options.condition });
                }

                if (options && options.sold) {
                    let sold = options.sold === "sold" ? true : false;
                    allProducts = _.filter(allProducts, product => { return product.sold === sold });
                }

                //TODO: Handle default facets in a different way to be able to leverage a for loop instead of these IFs above
                //TODO: Receive a List of actual facets to filter and put logic in there instead of these IFs above 
                if(options) {
                    Object.keys(options).forEach(option => {
                        if(["category", "condition", "sold"].indexOf(option) == -1) {
                            allProducts = _.filter(allProducts, product => { return product[option] === options[option] });
                        }
                    });
                }

                callback(null, allProducts);
            });
        });
    };

    function parseAllProducts(rawProducts, callback) {
        async.map(rawProducts, (product, callback) => {
            fs.readdir(path.join(imagesFolder, product.imagesFolder), (err, files) => {
                if (err) {
                    if (err.code === "ENOENT") {
                        console.log(`Didn't find images for ${product.name} at folder ${imagesFolder}`)
                    } else {
                        return callback(err);
                    }
                }

                product = parseProduct(product, files);

                callback(null, product);
            });
        }, callback);
    }

    function loadAllFromFile(callback) {
        helpers.readYAML(productsFile, callback);
    };

    function parseProduct(product, files) {
        if (files) {
            product.images = _.map(files, (file) => {
                return product.imagesFolder + "/" + file;
            });
        } else {
            product.images = [];
        }

        if (product.images && product.images.length > 0)
            product.mainImage = product.images[0];

        product.slug = helpers.slugfy(product.name);
        product.condition = product.condition;
        product.sold = product.sold || false;

        product.categories = loadCategories(product.categories);
        product.mainCategory = product.categories ? product.categories[0].category : null;
        return product;
    }

    function loadCategories(productCategories) {
        if (!productCategories) return null;

        let results = [],
            categories = _.cloneDeep(productCategories);

        if(Array.isArray(categories)) {
            results = _.map(categories, key => { return { category: key, children: [] } })
        } else {
            results = _.map(
                Object.keys(categories),
                key => {
                    let children = [];

                    if (Array.isArray(categories[key])) {
                        children = categories[key];
                    }

                    return { category: key, children };
                }
            )
        }

        return results;
    }

    function isInCategory(product, category) {
        let r = true;

        if (Array.isArray(category)) {
            category.forEach(cat => {
                r = r && _.filter(product.categories, c => {
                    return c.category === cat || c.children.indexOf(cat) > -1;
                }).length > 0;
            })
        } else {
            r = _.filter(product.categories, c => {
                return c.category === category || c.children.indexOf(category) > -1;
            }).length > 0;
        }
        return r;
    }

    /*********** Sync IO methods ****************/
    
    this.loadProductUrlsSync = () => {
        let rawProducts = helpers.readYAMLSync(productsFile);
        let allProducts = _.map(rawProducts, parseProduct);
        let urls = _.map(allProducts, product => { return "/products/" + product.slug });
        return urls;
    };
}