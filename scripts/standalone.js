import fs from 'node:fs';
const root='dist';let html=fs.readFileSync(`${root}/index.html`,'utf8');
html=html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/,(_,path)=>`<script type="module">${fs.readFileSync(root+path,'utf8')}</script>`).replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/,(_,path)=>`<style>${fs.readFileSync(root+path,'utf8')}</style>`);
const types={svg:'image/svg+xml',webp:'image/webp',woff:'font/woff'};
const assets={};for(const name of fs.readdirSync('public/assets')){const ext=name.split('.').pop();assets[name]=`data:${types[ext]};base64,${fs.readFileSync('public/assets/'+name).toString('base64')}`;}
// Dynamic ball selection needs embedded URLs too.
html=html.replace(/"\/assets\/ball-"\+\(([^)]+)\)\+"\.svg"/g,(_,condition)=>`({gray:${JSON.stringify(assets['ball-gray.svg'])},green:${JSON.stringify(assets['ball-green.svg'])},pink:${JSON.stringify(assets['ball-pink.svg'])}})[${condition}]`);
for(const [name,data] of Object.entries(assets))html=html.split('/assets/'+name).join(data);
fs.writeFileSync('/workspace/Nice-Shot.html',html);console.log('Saved /workspace/Nice-Shot.html');
