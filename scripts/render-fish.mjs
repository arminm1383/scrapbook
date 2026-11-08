// Authoring only. Requires ffmpeg plus playwright and three in FISH_RENDER_DEPS.
// Example: npm install --prefix /tmp/fish-render playwright three
// FISH_RENDER_DEPS=/tmp/fish-render node scripts/render-fish.mjs
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
const deps=process.env.FISH_RENDER_DEPS ?? '/tmp/scrapbook-visual-qa';
const require=createRequire(path.join(deps,'package.json'));
const {chromium}=require('playwright');
const {outputFiles}=await build({entryPoints:['scripts/fish-scene.js'],bundle:true,write:false,format:'esm',define:{'process.env.NODE_ENV':'"production"'},alias:{three:path.join(path.dirname(require.resolve('three')), 'three.module.js')}});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:852,height:1576}});
page.on('pageerror', error => console.error(error.message));
page.on('console', message => { if(message.type()==='error') console.error(message.text()); });
await page.setContent('<html><body style="margin:0;background:transparent"></body></html>');
await page.evaluate(source => { window.fishSource = source; }, 'data:image/png;base64,' + fs.readFileSync('src/assets/scrapbook/p5fish.png').toString('base64'));
await page.addScriptTag({type:'module',content:outputFiles[0].text});
await page.waitForFunction(()=>window.fishReady);
const frames=fs.mkdtempSync(path.join(os.tmpdir(),'scrapbook-modeled-fish-'));
for(let frame=0;frame<96;frame++){
 const data=await page.evaluate(t=>window.renderFishFrame(t),frame/24);
 fs.writeFileSync(path.join(frames,`${String(frame).padStart(3,'0')}.png`),Buffer.from(data.split(',')[1],'base64'));
 if(frame===0)fs.copyFileSync(path.join(frames,'000.png'),'src/assets/scrapbook/fish-swimming-poster.png');
}
const end=await page.evaluate(()=>window.renderFishFrame(4));
fs.writeFileSync(path.join(frames,'loop-end.png'),Buffer.from(end.split(',')[1],'base64'));
await browser.close();
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-framerate','24','-i',path.join(frames,'%03d.png'),'-frames:v','96','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-auto-alt-ref','0','-b:v','0','-crf','26','-row-mt','1','-cpu-used','4','-an','-y','src/assets/scrapbook/fish-swimming.webm'],{stdio:'inherit'});
console.log(`Rendered 96 transparent articulated-artwork frames, 4-second 24fps WebM loop. Frames: ${frames}`);
