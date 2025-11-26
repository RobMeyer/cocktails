export default function (eleventyConfig) {
    // Passthrough copy for styles
    // Copy src/style.css to _site/src/style.css
    eleventyConfig.addPassthroughCopy("src");

    // Passthrough copy for images
    // Copy public/images to _site/images
    eleventyConfig.addPassthroughCopy({ "public/images": "images" });

    return {
        dir: {
            input: "11ty",
            output: "_site"
        }
    };
};
