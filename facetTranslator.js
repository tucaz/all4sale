module.exports = function(p) {
    return { 
        getValue: function(key, value) {
            switch (key) {
                case "condition":
                    return p.t(`global.productCondition.${value}`);
                case "availability":
                    return p.t(`global.productStatus.${value}`);
                default:
                    return value;
            }
        },
        getDescription: function(key) {
            return p.t(`global.facets.${key}`);
        }
    };
}