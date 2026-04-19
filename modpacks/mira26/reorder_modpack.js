const fs = require('fs');
const crypto = require('crypto');

const data = JSON.parse(fs.readFileSync('modpack.json', 'utf8'));

const files = (data.files || []).sort((a, b) => `${a.path}`.localeCompare(`${b.path}`));

console.log(`Checking files... (${files.length})`);

fs.writeFileSync('modpack.json', JSON.stringify({
    ...data,
    files,
}, null, 2));