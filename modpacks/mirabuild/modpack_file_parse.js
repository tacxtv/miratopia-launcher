const fs = require('fs');
const crypto = require('crypto');

const baseUrl = 'https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/modpacks/mirasurvie/modpack/';

function listFilesRecursive(directory) {
    const files = fs.readdirSync(directory);
    let fileList = [];

    files.forEach((file) => {
        const filePath = `${directory}/${file}`;
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            const subdirectoryFiles = listFilesRecursive(filePath);
            fileList = fileList.concat(subdirectoryFiles);
        } else {
            const fileData = fs.readFileSync(filePath);
            const hash = crypto.createHash('sha1').update(fileData).digest('hex');
            fileList.push({
                path: filePath,
                size: stats.size,
                hash,
                url: `${baseUrl}${filePath.replace(`${modpackDirectory}/`, '')}`,
            });
        }
    });

    return fileList;
}

const modpackDirectory = './modpack';
const files = listFilesRecursive(modpackDirectory).map((file) => {
    file.path = file.path.replace(`${modpackDirectory}/`, '');
    return file;
});

fs.writeFileSync('files.json', JSON.stringify(files, null, 2));