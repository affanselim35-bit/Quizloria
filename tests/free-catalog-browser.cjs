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
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','psychology.js','membership.js','premium.js','premium-stories.js','research-tests.js','persona-results.js','home-ad.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8098,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 async function account(name,width=1280){
  const p=await browser.newPage({viewport:{width,height:900}}),stats={loads:0};p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='pagead2.googlesyndication.com'){stats.loads++;return route.fulfill({contentType:'application/javascript',body:fakeAds})}return route.abort()});
  await p.goto('http://127.0.0.1:8098/');await p.waitForFunction(()=>quizloriaMembership.ready&&quizloriaMembership.accessReady);const uid=null;return {p,uid,stats};
 }
 const guest=await account('Guest',390),a=guest.p;assert.equal(await a.evaluate(()=>firebase.auth().currentUser),null);checks++;
 await a.evaluate(()=>openV9Page('home'));assert.equal(await a.locator('#qPremiumHome').isVisible(),false);assert.equal(await a.locator('.v9-nav [data-view=premium]').isVisible(),false);checks++;
 await a.evaluate(()=>openV9Page('profile'));assert.equal(await a.locator('#qPremiumProfile').isVisible(),false);await a.evaluate(()=>openV9Page('premium'));assert.equal(await a.evaluate(()=>document.body.dataset.quizloriaView),'tests');assert.equal(await a.locator('#qPremium').isVisible(),false);checks++;
 await a.waitForFunction(()=>document.querySelectorAll('.q-catalog-card').length===83);assert.equal(await a.locator('.q-premium-badge').count(),0);assert.equal(await a.locator('.q-premium-card').count(),0);checks++;
 for(const [id,meta] of Object.entries(seed.premiumCatalog)){
  await a.evaluate(id=>qPremiumStart(id),id);
  if(meta.kind==='ipip-facet'){await a.getByRole('button',{name:'Anladım, başlayalım →'}).waitFor();assert.equal((await a.locator('#qResearchBody').textContent()).includes('Premium'),false);await a.keyboard.press('Escape')}
  else if(meta.kind==='story-persona'){await a.getByRole('button',{name:'Hikâyeye başla →'}).waitFor();assert.equal((await a.locator('#qStoryBody').textContent()).includes('Premium'),false);await a.keyboard.press('Escape')}
  else{await a.waitForFunction(id=>activeQuiz==='catalog:'+id,id);assert.equal(await a.locator('#answers button').count(),4);await a.evaluate(()=>openV9Page('tests'))}checks++;
 }
 await a.evaluate(()=>startQuiz('qplus_1'));await a.waitForFunction(()=>activeQuiz==='catalog:qplus_1');await a.locator('#answers button').first().click();await a.locator('#nextQuestion').click();await a.locator('#nextQuestion').click();assert.equal(await a.evaluate(()=>JSON.parse(localStorage.getItem(V11_PROGRESS)).question),1);checks++;
 await a.reload();await a.waitForFunction(()=>quizloriaMembership.accessReady&&quizloriaMembership.freeTests);await a.evaluate(()=>v11Resume());await a.waitForFunction(()=>activeQuiz==='catalog:qplus_1'&&currentQuestion===1);assert.equal(await a.locator('#quiz').isVisible(),true);checks++;
 await a.evaluate(()=>{localStorage.setItem(FAVORITES_KEY,JSON.stringify(['premium:qplus_1','qplus_2','football']));openV9Page('tests');setTestFilter('favorites')});assert.equal(await a.locator('.q-catalog-card:not(.hidden)').count(),2);assert.ok((await a.evaluate(()=>readFavorites())).includes('catalog:qplus_1'));checks++;
 await a.evaluate(()=>qPremiumStart('story-anime-yolculugu'));await a.getByRole('button',{name:'Hikâyeye başla →'}).click();for(let i=0;i<12;i++){await a.locator('.q-story-choice').first().click();await a.getByRole('button',{name:i===11?'Karakterimi keşfet →':'Sonraki senaryo →',exact:true}).click()}await a.locator('.q-story-result-title').waitFor();await a.getByRole('button',{name:'Testlere dön'}).click();checks++;
 await a.evaluate(()=>qPremiumStart('ipip-o5'));await a.getByRole('button',{name:'Anladım, başlayalım →'}).click();for(let i=0;i<10;i++){await a.locator('.q-research-choice').nth(2).click();await a.getByRole('button',{name:i===9?'Açıklamalı sonucumu gör →':'Sonraki madde →',exact:true}).click()}assert.equal(await a.locator('.q-research-score').textContent(),'3,0 / 5');await a.getByRole('button',{name:'Testlere dön'}).click();checks++;
 await a.evaluate(()=>{setTestFilter('all');document.getElementById('testSearch').value='Anime';filterTests();document.getElementById('v11Toast').hidden=true});await a.locator('.q-catalog-card:not(.hidden)').screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'free-test-card-mobile.png')});assert.equal(await a.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;
 await a.evaluate(()=>startQuiz('general'));assert.equal(await a.locator('#answers button').count(),4);checks++;
 const uid=await a.evaluate(async()=>{const c=await firebase.auth().createUserWithEmailAndPassword('free-admin-'+Date.now()+'@example.test','LocalTest123!');return c.user.uid});await admin('PUT','admins/'+uid,true);await a.waitForFunction(()=>quizloriaMembership.admin&&quizloriaMembership.freeTests);guest.stats.loads=0;await a.reload();await a.waitForFunction(()=>quizloriaMembership.ready&&quizloriaMembership.admin&&quizloriaMembership.freeTests);assert.equal(guest.stats.loads,0);assert.equal(await a.locator('#qPremiumHome').isVisible(),false);checks++;
 assert.deepEqual(errors,[]);console.log(checks+' free catalog browser checks passed (83 guest-opened tests, no Premium UI, story/research results, regular resume/favorites).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

