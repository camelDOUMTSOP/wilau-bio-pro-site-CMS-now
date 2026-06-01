const sharp = require('sharp'); // Une bibliothèque ultra-rapide
const fs = require('fs');
const path = require('path');

const dir = './assets/images'; // Ton dossier d'images

if (!fs.existsSync(dir)) {
    console.error("Le dossier n'existe pas :", dir);
    process.exit(1);
}

fs.readdirSync(dir).forEach(file => {
    if (/\.(jpe?g|png)$/i.test(file)) {
        const input = path.join(dir, file);
        const output = path.join(dir, file.replace(/\.(jpe?g|png)$/i, '.webp'));

        sharp(input)
            .webp({ quality: 80 }) // Bonne qualité pour WhatsApp
            .toFile(output)
            .then(() => console.log(`✅ Converti : ${file} -> .webp`))
            .catch(err => console.error(`❌ Erreur sur ${file}:`, err));
    }
});