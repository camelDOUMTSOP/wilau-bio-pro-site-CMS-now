// Serveur local de prévisualisation, qui imite Cloudflare : /produits/x sert
// produits/x.html. Usage : `node scripts/serve.mjs` puis http://localhost:8791
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8791;
const TYPES = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml',
    '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf',
    '.md': 'text/markdown; charset=utf-8', '.yml': 'text/yaml; charset=utf-8',
};

function resolve(urlPath) {
    const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
    const base = path.join(ROOT, clean);
    if (!base.startsWith(ROOT)) return null;
    const candidates = [base, `${base}.html`, path.join(base, 'index.html')];
    return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

http.createServer((req, res) => {
    const urlPath = new URL(req.url, 'http://localhost').pathname;
    const file = resolve(urlPath);
    if (!file) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404');
        return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Prévisualisation : http://localhost:${PORT}`));
