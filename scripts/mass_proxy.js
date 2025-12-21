const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../stores/gn-math');
const uvPrefix = '/uv/service/';

function xorEncode(str) {
    if (!str) return str;
    return encodeURIComponent(str.split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char).join(''));
}

if (!fs.existsSync(targetDir)) {
    console.error("Target directory not found:", targetDir);
    process.exit(1);
}

const files = fs.readdirSync(targetDir);
let count = 0;

console.log(`Scanning ${files.length} files in ${targetDir}...`);

files.forEach(file => {
    if (!file.endsWith('.html')) return;
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to find base href with http/https
    // We want to capture the URL inside the quotes
    const baseRegex = /<base\s+href=["'](https?:\/\/[^"']+)["']\s*\/?>/i;
    const match = content.match(baseRegex);

    if (match) {
        const originalUrl = match[1];

        // Avoid double proxying or if already relative/proxied
        if (originalUrl.includes('/uv/service/')) {
            return;
        }

        const encoded = xorEncode(originalUrl);
        const newUrl = `${uvPrefix}${encoded}`;

        // Replace the URL in the content
        const newContent = content.replace(originalUrl, newUrl);

        fs.writeFileSync(filePath, newContent);
        console.log(`Proxied: ${file}`);
        count++;
    }
});

console.log(`Total files updated: ${count}`);
