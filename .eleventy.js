import htmlMinifier from "html-minifier";
import CleanCSS from "clean-css";
import fs from "fs";
import path from "path";

export default function (eleventyConfig) {
    // Passthrough copy for styles
    // Copy src/style.css to _site/src/style.css
    eleventyConfig.addPassthroughCopy("src");

    // Passthrough copy for images
    // Copy public/images to _site/images
    eleventyConfig.addPassthroughCopy({ "public/images": "images" });

    // Watch CSS for changes
    eleventyConfig.addWatchTarget("./src/style.css");

    // Add env global data
    eleventyConfig.addGlobalData("env", process.env.NODE_ENV || "development");

    // Add CSS minification filter
    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Add HTML minification transform
    eleventyConfig.addTransform("htmlmin", function (content) {
        if (process.env.NODE_ENV === "production" && (this.page.outputPath || "").endsWith(".html")) {
            let minified = htmlMinifier.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
            });
            return minified;
        }
        return content;
    });

    // Shortcode to read CSS file
    eleventyConfig.addShortcode("getUiCss", function () {
        const cssPath = path.join(process.cwd(), "src/style.css");
        return fs.readFileSync(cssPath, "utf8");
    });

    return {
        dir: {
            input: "11ty",
            output: "_site"
        }
    };
};
