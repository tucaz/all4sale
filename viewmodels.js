module.exports = new(function () {
    let _ = require("lodash"),
        helpers = require("./helpers.js");

    this.indexViewModel = (allProducts) => {
        let groupedByCategory = _.groupBy(allProducts, "mainCategory"),
            results = [];
            categoryKeys = Object.keys(groupedByCategory).sort();

        categoryKeys.forEach(key => {
            let products = groupedByCategory[key];

            results.push({ category: key !== 'null' ? key : null, rows: helpers.groupByN(_.sortBy(products, ["sold", "name"]), 4) });
        });

        return results;
    }
});