const fs = require('fs');
const crypto = require('crypto');


(async () => {
    const data = fs.readFileSync('modrinth.index.json', 'utf8');
    const modrinth = JSON.parse(data);

    console.log(`Checking modrinth files... (${modrinth.files.length})`);

    const files = [];
    for (const file of modrinth.files || []) {
        files.push({
            "hash": file.hashes.sha1,
            "path": file.path,
            "size": file.fileSize,
            "url": file.downloads[0],
        })
    }

    const dextra = fs.readFileSync('extra.json', 'utf8');
    const extra = JSON.parse(dextra);

    console.log(`Checking extra files... (${extra.length})`);

    fs.mkdirSync('extra', { recursive: true });
    for (const file of extra) {
        const filename = file.split('/').pop();

        if (fs.existsSync(`extra/${filename}`)) {
            console.log(`Skipping ${filename}...`);
        } else {
            console.log(`Downloading ${filename}...`);
            const download = await fetch(file);
            const blob = await download.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(`extra/${filename}`, buffer);
            console.log(`Downloaded ${filename}...`);
        }

        const hash = crypto.createHash('sha1');
        hash.update(fs.readFileSync(`extra/${filename}`));
        const sha1 = hash.digest('hex');
        console.log(`Generate hash for ${file} <${sha1}>`);

        const fileSize = fs.statSync(`extra/${filename}`).size;
        console.log(`File size for ${file} <${fileSize}>`);

        files.push({
            "hash": sha1,
            "path": `mods/${filename}`,
            "size": fileSize,
            "url": file,
        })
        console.log(`Added ${filename} to modpack...`);
    }

    const target = fs.readFileSync('modpack.json', 'utf8');
    const modpack = JSON.parse(target);

    const targetFiles = [];

    console.log(`Checking ${files.length} files in modrinth index...`);
    for (const file of files) {
        const modrinthFile = modpack.files.find(f => f.path === file.path);

        if (modrinthFile) {
            console.log(`Found ${file.path}`);
            targetFiles.push(file);
        } else {
            console.log(`Missing ${file.path}`);
            targetFiles.push(file);
        }
    }

    console.log(`Adding ${targetFiles.length} files to modpack...`);

    fs.writeFileSync('modpack.json.' + Date.now() + '.old', JSON.stringify(modpack, null, 2));
    modpack.files = targetFiles;

    fs.writeFileSync('modpack.json', JSON.stringify(modpack, null, 2));
    console.log('Done!');
    
})();