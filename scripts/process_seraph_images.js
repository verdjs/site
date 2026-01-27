const fs = require('fs');
const path = require('path');

const seraphJsonPath = path.join(__dirname, '..', 'assets', 'json', 'seraph.json');
const directoriesJsonPath = path.join(__dirname, '..', 'scripts', 'seraph_directories.json');
const imgDestDir = path.join(__dirname, '..', 'assets', 'img', 'games', 'seraph');

const seraphData = JSON.parse(fs.readFileSync(seraphJsonPath, 'utf8'));
const directoriesData = JSON.parse(fs.readFileSync(directoriesJsonPath, 'utf8'));

const downloadCommands = [];
const updatedSeraphData = [];

seraphData.forEach(game => {
    // Extract the relative path from the full URL to match directories.json key
    // URL: https://verdjs.github.io/seraph/games/slope/index.html
    // Key: slope/index.html
    const match = game.url.match(/\/seraph\/games\/(.+)$/);
    if (!match) {
        updatedSeraphData.push(game);
        return;
    }

    const key = match[1];
    const entry = directoriesData[key];

    if (entry && entry.thumbnail) {
        const thumbPath = entry.thumbnail; // e.g. /images/thumbnails/slope.jpg
        const filename = thumbPath.split('/').pop();
        const fullUrl = `https://verdjs.github.io/seraph${thumbPath}`;

        // Update the game object with the correct local image path and extension
        game.img = `/assets/img/games/seraph/${filename}`;

        // Add curl command to download list
        downloadCommands.push(`curl -L -s -o "assets/img/games/seraph/${filename}" "${fullUrl}"`);
    }

    updatedSeraphData.push(game);
});

// Write the updated JSON back
fs.writeFileSync(seraphJsonPath, JSON.stringify(updatedSeraphData, null, 2));

// Write a batch file for downloads
fs.writeFileSync(path.join(__dirname, '..', 'scripts', 'download_images.ps1'), downloadCommands.join('\n'));

console.log(`Processed ${updatedSeraphData.length} games.`);
console.log(`Generated ${downloadCommands.length} download commands in scripts/download_images.ps1.`);
