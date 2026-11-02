// Local Auth + RTDB emulators and a fake ad SDK only. Never processes a payment.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,checks=0;const errors=[];
const stamp={'.sv':'timestamp'},fixture={title:'Premium Fixture',questions:Array.from({length:5},(_,i)=>({q:'Protected fixture question '+i,a:['First','Second','Third','Fourth'],correct:0,explanation:'Fixture explanation.'}))};
async function admin(method,key,value){const r=await fetch('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb',{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});assert.equal(r.ok,true);return r.json()}
const fakeAds=`window.__adPushes=0;window.adsbygoogle={loaded:true,push:function(){const s=document.querySelector('ins.adsbygoogle:not([data-adsbygoogle-status])');if(!s||s.getBoundingClientRect().width<=0)throw Error('Hidden ad request');window.__adPushes++;s.dataset.adsbygoogleStatus='done';s.dataset.adStatus='filled';}};`;
async function main(){
 const seed=JSON.parse(fs.readFileSync(process.env.QUIZLORIA_RELEASE_SEED,'utf8'));await admin('PUT','',null);await admin('PATCH','',{...seed,siteAccess:{freeTests:true}});
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,path.basename(pathname))));return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','psychology.js','membership.js','premium.js','daily-mystery.js','daily-mystery-core.js','result-card.js','would-you-rather.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','home-ad.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8099,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 async function account(name,width=1280){
  const p=await browser.newPage({viewport:{width,height:900}}),stats={loads:0};p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='pagead2.googlesyndication.com'){stats.loads++;return route.fulfill({contentType:'application/javascript',body:fakeAds})}return route.abort()});
  await p.goto('http://127.0.0.1:8099/');await p.waitForFunction(()=>quizloriaMembership.ready&&quizloriaMembership.accessReady);const uid=null;return {p,uid,stats};
 }
 for(const width of [390,1280]){
  const {p}=await account('Guest',width);await p.evaluate(()=>openV9Page('tests'));await p.waitForFunction(()=>document.querySelectorAll('.q-catalog-card').length===83);
  const total=await p.locator('#testGrid .card').count();assert.equal(await p.locator('[data-test-kind]').count(),4);const counts=await p.evaluate(()=>{const all=[...document.querySelectorAll('#testGrid .card')];return Object.fromEntries(['knowledge','character','personality','research'].map(k=>[k,all.filter(c=>c.dataset.kind===k).length]))});assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),total);assert.equal(counts.character,30);assert.equal(counts.research,20);checks++;
  assert.equal(await p.locator('#qNewTests').count(),0);checks++;
  for(const kind of ['knowledge','character','personality','research']){
   await p.locator('[data-test-kind='+kind+']').click();const values=await p.locator('#testGrid .card:not(.hidden)').evaluateAll(cards=>cards.map(c=>c.dataset.kind));assert.equal(values.length,counts[kind]);assert.ok(values.every(v=>v===kind));assert.equal(await p.locator('[data-test-kind='+kind+']').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#qNewTests').count(),0);checks++;
  }
  await p.locator('#testGrid .card:not(.hidden)').first().getByRole('button',{name:'Teste başla →',exact:true}).click();await p.getByRole('button',{name:'Anladım, başlayalım →'}).waitFor();await p.keyboard.press('Escape');checks++;
  await p.getByRole('button',{name:'Tüm testler / filtreleri temizle',exact:true}).click();assert.equal(await p.locator('#testGrid .card:not(.hidden)').count(),total);assert.equal(await p.locator('#qNewTests').count(),0);checks++;
  await p.evaluate(()=>qShowLatestTests());assert.equal(await p.locator('#testGrid .card:not(.hidden)').count(),total);checks++;
  await p.locator('#testSearch').fill('Pokémon');assert.equal(await p.locator('#testGrid .card:not(.hidden)').count(),1);checks++;
  await p.locator('#testSearch').fill('zzzzxyxy-not-a-test');assert.equal(await p.locator('#testGrid .card:not(.hidden)').count(),0);assert.equal(await p.locator('#noTests').isVisible(),true);checks++;
  await p.getByRole('button',{name:'Tüm testler / filtreleri temizle',exact:true}).click();assert.equal(await p.locator('#noTests').isVisible(),false);checks++;
  await p.locator('[data-test-kind=knowledge]').click();await p.locator('[data-filter=sports]').click();const sports=await p.locator('#testGrid .card:not(.hidden)').evaluateAll(cards=>cards.map(c=>({kind:c.dataset.kind,category:c.dataset.category})));assert.ok(sports.length>0&&sports.every(c=>c.kind==='knowledge'&&c.category==='sports'));checks++;
  await p.getByRole('button',{name:'Tüm testler / filtreleri temizle',exact:true}).click();await p.evaluate(()=>{localStorage.setItem(FAVORITES_KEY,JSON.stringify(['catalog:story-anime-yolculugu']));setTestFilter('favorites')});assert.equal(await p.locator('#testGrid .card:not(.hidden)').count(),1);checks++;
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.locator('.q-premium-badge').count(),0);checks++;
  await p.evaluate(()=>openV9Page('home'));assert.equal(await p.locator('#qNewTests').count(),0);assert.equal(await p.locator('#qTestKinds').isVisible(),false);checks++;
  await p.close();
 }
 assert.deepEqual(errors,[]);console.log(checks+' discovery browser checks passed at mobile/desktop widths (four kinds, no latest section, all stories in the common catalog, combined filters, empty state and reset).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

