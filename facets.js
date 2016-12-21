let _ = require("lodash"),
    products = require(__dirname + "/products.js");

module.exports = function (facetTranslator, customFacets) {

    this.loadAllFacets = (products, selected, callback) => {
        if (products) {
            let facets = processFacets(products, selected);

            return callback(null, facets);
        }

        return callback(null, []);
    }

    function processFacets(products, selected) {
        let facets = {
            condition: new Facet("condition", true, facetTranslator.getDescription("condition"), facetTranslator),
            category: new Facet("category", true, facetTranslator.getDescription("category"), facetTranslator),
            sold: new Facet("availability", true, facetTranslator.getDescription("availability"), facetTranslator),
        };

        if(customFacets) {
            Object.keys(customFacets).forEach(facetKey => {
                if(!facets[facetKey]) {
                    facets[facetKey] = new Facet(facetKey, false, facetTranslator.getDescription(facetKey), null);
                } else {
                    console.log(`WARN: Can't override standard facet ${facetKey}`);
                }
            });
        }

        Object.keys(facets).forEach(facetKey => {
            facets[facetKey].setSelected(selected);
        });

        products.forEach(product => {
            let categories = _.map(product.categories, category => { return category.category; });
            _.each(categories, category => facets.category.addValue(category));
            facets.condition.addValue(product.condition);
            facets.sold.addValue(product.sold ? "sold" : "available");

            if(customFacets) {
                Object.keys(customFacets).forEach(facetKey => {
                    let f = facets[facetKey];
                    if(f && f.isStandard == false) {
                        let value = product[facetKey];
                        if(value)
                            f.addValue(value);
                    }
                });
            }
        });

        return facets;
    }
}

function Facet(key, isStandard, text, facetTranslator) {
    let self = this,
        selectedFacets = {};
        
    this.values = {};
    this.selectedValues = {};
    this.text = text;
    this.key = key;
    this.isStandard = isStandard;

    this.addValue = value => {
        if (isValueSelected(value)) return;

        let v = self.values[value];

        if (v) {
            v.count++;
        } else {
            //TODO: Get rid of the ternary operator
            self.values[value] = { count: 1, text: facetTranslator ? facetTranslator.getValue(self.key, value) : value, selectPath: makeSelectPath(value) };
        }
    }

    this.setSelected = selected => {
        if (!selected) return;

        selectedFacets = selected;

        Object.keys(selectedFacets).forEach(facetKey => {
            if (facetKey !== self.key) return;

            let selectedValue = selectedFacets[facetKey];
            if (selectedValue) {
                if (Array.isArray(selectedValue)) {
                    selectedValue.forEach(value => {
                        //TODO: Get rid of the ternary operator
                        self.selectedValues[value] = { text: facetTranslator ? facetTranslator.getValue(self.key, value) : value, unselectPath: makeUnselectPath(value) };
                    });
                } else {
                    //TODO: Get rid of the ternary operator
                    self.selectedValues[selectedValue] = { text: facetTranslator ? facetTranslator.getValue(self.key, selectedValue) : selectedValue, unselectPath: makeUnselectPath(selectedValue) };
                }
            }
        });
    }

    function makeUnselectPath(value) {
        let selected = [];
        if (selectedFacets) {
            _.forEach(selectedFacets, (facet, facetKey) => {
                if (!facet) return;
                if (facet === value) return;

                if (Array.isArray(facet) && facet.indexOf(value) > -1) {
                    _.difference(facet, [value]).forEach(facetValue => {
                        facetValue = encodeURIComponent(facetValue);
                        selected.push(`${facetKey}=${facetValue}`)
                    });
                } else {
                    let facetValue = encodeURIComponent(selectedFacets[facetKey]);
                    selected.push(`${facetKey}=${facetValue}`)
                }
            });
        }

        return selected.length > 0 ? "?" + selected.join("&") : "";
    }

    function makeSelectPath(value) {
        let selected = [];

        if (selectedFacets) {
            _.forEach(selectedFacets, (facet, facetKey) => {
                if (!facet) return;

                if (Array.isArray(facet)) {
                    facet.forEach(facetValue => {
                        facetValue = encodeURIComponent(facetValue);
                        selected.push(`${facetKey}=${facetValue}`)
                    });
                } else {
                    let facetValue = encodeURIComponent(facet);
                    selected.push(`${facetKey}=${facetValue}`)
                }
            });
        }

        let facetValue = encodeURIComponent(value);
        selected.push(`${self.key}=${facetValue}`);

        return "?" + selected.join("&");
    }
    
    function isValueSelected(value) {
        let selected = false;

        _.forEach(selectedFacets, (facet) => {
            if (!selected && facet && (facet === value || facet.indexOf(value) > -1)) {
                selected = true;
                return
            }
        });

        return selected;
    }
}