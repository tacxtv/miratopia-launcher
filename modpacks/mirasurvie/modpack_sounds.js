const fs = require('fs');


const basepath = './modpack/resources/minecraft/sounds/custom/';

const fileJsonSound = {}

for (const file of fs.readdirSync(basepath)) {
    const filePath = `${basepath}${file}`
    if (!file.endsWith('.ogg')) {
        console.error(`File ${filePath} is not an ogg file`);
        continue;
    }
    
    const basename = 'custom.' + file.replace('.ogg', '')
    fileJsonSound[basename] = {
    "category": "neutral",
    "sounds": [
      "custom/" + file.replace('.ogg', '')
    ]
  }
}


console.log(JSON.stringify(fileJsonSound, null, 2))
fs.writeFileSync('./modpack/resources/minecraft/sounds.json', JSON.stringify(fileJsonSound, null, 2), 'utf8')

console.log('Sounds.json generated successfully!')