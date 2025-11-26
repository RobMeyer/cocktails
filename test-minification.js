#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_DIR = path.join(__dirname, '_site');
const INDEX_HTML = path.join(SITE_DIR, 'index.html');
const STYLE_CSS = path.join(SITE_DIR, 'src', 'style.css');

let passed = 0;
let failed = 0;

function test(name, condition, errorMessage) {
    if (condition) {
        console.log(`✅ PASS: ${name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   ${errorMessage}`);
        failed++;
    }
}

console.log('Testing 11ty minification output...\n');

// Read index.html
const html = fs.readFileSync(INDEX_HTML, 'utf8');
const htmlSize = Buffer.byteLength(html, 'utf8');

// Test 1: HTML should be minified (no excessive whitespace)
const hasExcessiveWhitespace = />\s{2,}</g.test(html);
test(
    'HTML should not have excessive whitespace between tags',
    !hasExcessiveWhitespace,
    'Found multiple spaces/newlines between HTML tags'
);

// Test 2: HTML should not have indentation
const hasIndentation = /\n\s+</g.test(html);
test(
    'HTML should not have indentation',
    !hasIndentation,
    'Found indented HTML tags'
);

// Test 3: CSS should be inlined (not linked externally)
const hasExternalCSS = html.includes('<link rel="stylesheet"');
test(
    'CSS should be inlined, not linked externally',
    !hasExternalCSS,
    'Found external stylesheet link'
);

// Test 4: Should have inline <style> tag
const hasInlineCSS = html.includes('<style>');
test(
    'Should have inline <style> tag',
    hasInlineCSS,
    'No inline <style> tag found'
);

// Test 5: Inline CSS should be minified
if (hasInlineCSS) {
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    if (styleMatch) {
        const inlineCSS = styleMatch[1];
        const hasWhitespaceInCSS = /\n\s+/g.test(inlineCSS);
        test(
            'Inline CSS should be minified',
            !hasWhitespaceInCSS,
            'Found whitespace/newlines in inline CSS'
        );
    }
}

// Test 6: HTML size should be reasonable (≤ 25KB for single-file build)
test(
    'HTML size should be ≤ 25KB',
    htmlSize <= 25000,
    `HTML size is ${htmlSize} bytes`
);

// Test 7: External CSS file should not exist or be ignored in production
const cssExists = fs.existsSync(STYLE_CSS);
if (cssExists) {
    console.log(`⚠️  WARNING: External CSS file exists at ${STYLE_CSS}`);
    console.log('   In production, this should be inlined and not served separately.');
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
