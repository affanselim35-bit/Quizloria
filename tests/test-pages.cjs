const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'test-page-manifest.js'),'utf8'),context);const pages=JSON.parse(JSON.stringify(context.window.qTestPages));let checks=0;
assert.equal(pages.length,149);assert.equal(new Set(pages.map(t=>t.path)).size,149);assert.equal(new Set(pages.map(t=>t.id)).size,149);checks+=3;
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const t of pages){const html=fs.readFileSync(path.join(root,t.path.slice(1),'index.html'),'utf8');assert.ok(html.startsWith('<!doctype html>'));assert.equal((html.match(/<h1>/g)||[]).length,1);assert.ok(html.includes('https://quizloria.com'+t.path));assert.ok(html.includes('/?quiz='+encodeURIComponent(t.id)));assert.ok(sitemap.includes(t.path));assert.ok(!html.includes('<script'));assert.ok(!html.includes('adsbygoogle'));assert.ok(!html.includes('mysteryKeys'));assert.ok(html.includes('/iletisim.html'));assert.ok(html.length>2500);checks+=10;
 if(t.kind==='knowledge'){assert.equal((html.match(/<details>/g)||[]).length,t.count);assert.equal((html.match(/Doğru cevap:/g)||[]).length,t.count);checks+=2}
 if(t.kind==='research'){assert.ok(html.includes('Türkçe taslak'));assert.ok(html.includes('klinik eşik değildir'));assert.ok(html.includes('ipip.ori.org'));checks+=3}
}
const index=fs.readFileSync(path.join(root,'testler/index.html'),'utf8');for(const t of pages){assert.ok(index.includes('href="'+t.path+'"'));checks++}assert.equal((sitemap.match(/<loc>/g)||[]).length,155);checks++;
for(const name of ['test-pages.js','premium.js','test-page-manifest.js'])new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
const main=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const script of main.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(script[1].trim()&&!script[0].includes('application/ld+json'))new vm.Script(script[1]);
console.log(checks+' static guide checks passed (149 pages, accessible HTML without JavaScript, unique canonical URLs, explanations, honest scope and linked catalog).');
