const fs = require('fs');
const path = require('path');
const https = require('https');

const seraphJsonPath = path.join(__dirname, '..', 'assets', 'json', 'seraph.json');
const directoriesJsonPath = path.join(__dirname, '..', 'scripts', 'seraph_directories.json');
const imgDestDir = path.join(__dirname, '..', 'assets', 'img', 'games', 'seraph');

if (!fs.existsSync(imgDestDir)) {
    fs.mkdirSync(imgDestDir, { recursive: true });
}

const seraphData = JSON.parse(fs.readFileSync(seraphJsonPath, 'utf8'));
const directoriesData = JSON.parse(fs.readFileSync(directoriesJsonPath, 'utf8'));

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { }); // Delete the file on error
            reject(err);
        });
    });
}

async function run() {
    let downloadedCount = 0;
    let failedCount = 0;

    for (const game of seraphData) {
        const match = game.url.match(/\/seraph\/games\/(.+)$/);
        if (!match) continue;

        const key = match[1];
        const entry = directoriesData[key];

        if (entry && entry.thumbnail) {
            const thumbPath = entry.thumbnail;
            const filename = thumbPath.split('/').pop();
            const fullUrl = `https://verdjs.github.io/seraph${thumbPath}`;
            const dest = path.join(imgDestDir, filename);

            try {
                process.stdout.write(`Downloading ${filename}... `);
                await download(fullUrl, dest);
                console.log('Done.');
                game.img = `/assets/img/games/seraph/${filename}`;
                downloadedCount++;
            } catch (err) {
                console.log(`Failed: ${err.message}`);
                failedCount++;
            }
        }
    }

    fs.writeFileSync(seraphJsonPath, JSON.stringify(seraphData, null, 2));
    console.log(`\nFinished. Downloaded: ${downloadedCount}, Failed: ${failedCount}`);
}

run();
