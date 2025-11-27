import htmlMinifier from "html-minifier";
import CleanCSS from "clean-css";
import { minify } from "terser";
import fs from "fs";
import path from "path";

export default function (eleventyConfig) {
    const isProd = process.env.NODE_ENV === "production";

    // In development, copy CSS and JS for the dev server
    // In production, these are inlined so we don't need them
    if (!isProd) {
        eleventyConfig.addPassthroughCopy("src/style.css");
    }

    // Passthrough copy for images (always needed)
    eleventyConfig.addPassthroughCopy({ "public/images": "images" });

    // Passthrough copy for fonts (always needed)
    eleventyConfig.addPassthroughCopy({ "public/fonts": "fonts" });

    // Watch CSS for changes
    eleventyConfig.addWatchTarget("./src/style.css");

    // Watch TypeScript for changes (compilation happens via prebuild hook)
    eleventyConfig.addWatchTarget("./src/main.ts");

    // Add env global data
    eleventyConfig.addGlobalData("env", process.env.NODE_ENV || "development");

    // Add CSS minification filter
    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Add JS minification filter
    eleventyConfig.addFilter("jsmin", async function (code) {
        const result = await minify(code, {
            compress: true,
            mangle: true,
        });
        return result.code || code;
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

    // Shortcode to read JS file
    eleventyConfig.addShortcode("getUiJs", function () {
        // In production, JS is compiled to .tmp/main.js
        // In development, JS is compiled to _site/src/main.js
        const jsPath = isProd
            ? path.join(process.cwd(), ".tmp/main.js")
            : path.join(process.cwd(), "_site/src/main.js");
        return fs.readFileSync(jsPath, "utf8");
    });

    return {
        dir: {
            input: "11ty",
            output: "_site"
        }
    };
};
