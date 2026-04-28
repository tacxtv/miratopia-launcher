const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function normalizePath(p) {
    return String(p).replace(/\\/g, '/');
}

function makeFileEntry(file, pathValue, optional, isDefault, additionalInfosMap) {
    const outPath = normalizePath(pathValue);
    const entry = {
        "hash": file.hashes.sha1,
        "path": outPath,
        "size": file.fileSize,
        "url": file.downloads[0],
    };

    if (optional) {
        entry.optional = true;
        entry.default = Boolean(isDefault);
    }

    const additionalInfo = additionalInfosMap.get(outPath);
    if (additionalInfo) {
        if (typeof additionalInfo.name === 'string' && additionalInfo.name.trim()) {
            entry.name = additionalInfo.name;
        }
        if (typeof additionalInfo.description === 'string' && additionalInfo.description.trim()) {
            entry.description = additionalInfo.description;
        }
    }

    return entry;
}

function listInternalFilesRecursive(directory, directoryRoot) {
    const entries = fs.readdirSync(directory);
    let fileList = [];

    for (const entry of entries) {
        const filePath = path.join(directory, entry);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            fileList = fileList.concat(listInternalFilesRecursive(filePath, directoryRoot));
            continue;
        }

        const fileData = fs.readFileSync(filePath);
        const hash = crypto.createHash('sha1').update(fileData).digest('hex');
        const relativePath = normalizePath(path.relative(directoryRoot, filePath));
        fileList.push({
            "hash": hash,
            "path": `mods/${relativePath}`,
            "size": stats.size,
            "url": `https://raw.githubusercontent.com/tacxtv/miratopia-launcher/config/modpacks/mira26/internal/${relativePath}`,
        });
    }

    return fileList;
}

(async () => {
    let infos = { opt: [], optdef: [], additionalInfos: [] };
    if (fs.existsSync('infos.json')) {
        const parsed = JSON.parse(fs.readFileSync('infos.json', 'utf8'));
        infos.opt = Array.isArray(parsed.opt) ? parsed.opt : [];
        infos.optdef = Array.isArray(parsed.optdef) ? parsed.optdef : [];
        infos.additionalInfos = Array.isArray(parsed.additionalInfos) ? parsed.additionalInfos : [];
        console.log(`Loaded infos.json (opt: ${infos.opt.length}, optdef: ${infos.optdef.length}, additionalInfos: ${infos.additionalInfos.length})`);
    } else {
        console.log('No infos.json (optional); only .opt / .optdef suffixes apply.');
    }

    const optSet = new Set(infos.opt.map(normalizePath));
    const optdefSet = new Set(infos.optdef.map(normalizePath));
    const additionalInfosMap = new Map();
    for (const info of infos.additionalInfos) {
        if (!info || typeof info.path !== 'string') continue;
        additionalInfosMap.set(normalizePath(info.path), info);
    }

    const data = fs.readFileSync('modrinth.index.json', 'utf8');
    const modrinth = JSON.parse(data);

    console.log(`Checking modrinth files... (${modrinth.files.length})`);
    const modrinthFiles = (modrinth.files || []).sort((a, b) => `${a.path}`.localeCompare(`${b.path}`));

    let files = [];
    for (const file of modrinthFiles) {
        const filename = file.path.split('/').pop();
        const normPath = normalizePath(file.path);
        const pathNoOpt = normPath.replace(/\.opt$/, '');
        const pathNoOptdef = normPath.replace(/\.optdef$/, '');

        if (/.disabled$/.test(filename)) {
            console.log(`Skipping ${filename}...`);
            continue;
        }

        const endsOpt = /\.opt$/.test(normPath);
        const endsOptdef = /\.optdef$/.test(normPath);
        const fromInfosOptdef =
            optdefSet.has(normPath) ||
            optdefSet.has(pathNoOptdef) ||
            (endsOpt && !endsOptdef && optdefSet.has(pathNoOpt));
        const fromInfosOpt =
            !fromInfosOptdef &&
            (optSet.has(normPath) || optSet.has(pathNoOpt));

        if (fromInfosOptdef) {
            let outPath = normPath;
            if (endsOptdef) outPath = pathNoOptdef;
            else if (endsOpt) outPath = pathNoOpt;
            console.log(`Make as optional (default on) [infos] ${outPath}...`);
            files.push(makeFileEntry(file, outPath, true, true, additionalInfosMap));
            continue;
        }

        if (fromInfosOpt) {
            const outPath = endsOpt ? pathNoOpt : normPath;
            console.log(`Make as optional [infos] ${outPath}...`);
            files.push(makeFileEntry(file, outPath, true, false, additionalInfosMap));
            continue;
        }

        if (/.opt$/.test(filename)) {
            console.log(`Make as optional ${filename}...`);
            
            files.push(makeFileEntry(file, file.path.replace('.opt', ''), true, false, additionalInfosMap))
            continue;
        }

        if (/.optdef$/.test(filename)) {
            console.log(`Make as optional ${filename}...`);
            
            files.push(makeFileEntry(file, file.path.replace('.optdef', ''), true, true, additionalInfosMap))
            continue;
        }

        files.push(makeFileEntry(file, file.path, false, false, additionalInfosMap))
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

    const internalDirectory = './internal';
    if (fs.existsSync(internalDirectory)) {
        const internalRoot = path.resolve(internalDirectory);
        const internalFiles = listInternalFilesRecursive(internalDirectory, internalRoot);
        console.log(`Checking internal files... (${internalFiles.length})`);
        files = files.concat(internalFiles);
    }

    const target = fs.readFileSync('modpack.json', 'utf8');
    const modpack = JSON.parse(target);

    const targetFiles = [];

    console.log(`Checking ${files.length} files in modrinth index...`);
    files = files.sort((a, b) => `${a.path}`.localeCompare(`${b.path}`));
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