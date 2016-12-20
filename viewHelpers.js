module.exports = function (p, productImagesUrl, resizeProductImage) {
    this.condition = (condition) => {
        return p.t(`global.productCondition.${condition}`);
    }

    this.conditionFormat = (condition) => {
        switch (condition) {
            case "New":
                return "label-success";
            case "AlmostNew":
                return "label-danger";
            default:
            case "Used":
                return "label-info";
        }
    }

    this.image = (url, options) => {
        // if (!options)
        //     options = {};

        // url += "?v=1";

        // options.type = "fetch";
        // options.fetch_format = "auto";

        // return cloudinary.image(url, options)
        let imageUrl = getImageUrl(url, options);
        let props = '';

        if(options) {
            Object.keys(options).forEach(key => {
                props += `${key}="${options[key]}" `;
            });
        }

        return `<img src="${imageUrl}" ${props}/>`;
    }

    this.imageUrl = (url, options) => {
        // if (!options)
        //     options = {};

        // url += "?v=1";

        // options.type = "fetch";
        // options.fetch_format = "auto";

        // return cloudinary.url(url, options)

        let imageUrl = getImageUrl(url, options);
        return imageUrl;
    }

    function getImageUrl(url, options) {
        let imageUrl = productImagesUrl + url;

        if (resizeProductImage && options.width) {
            imageUrl += `?w=${options.width}`;
        }

        return imageUrl;
    }
}