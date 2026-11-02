// Local Auth + RTDB emulators and a fake ad SDK only. Never processes a payment.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,checks=0;const errors=[];
const stamp={'.sv':'timestamp'},fixture={title:'Premium Fixture',questions:Array.from({length:5},(_,i)=>({q:'Protected fixture question '+i,a:['First','Second','Third','Fourth'],correct:0,explanation:'Fixture explanation.'}))};
async function admin(method,key,value){const r=await fetch('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb',{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});assert.equal(r.ok,true);return r.json()}
const fakeAds=`window.__adPushes=0;window.adsbygoogle={loaded:true,push:function(){const s=document.querySelector('ins.adsbygoogle:not([data-adsbygoogle-status])');if(!s||s.getBoundingClientRect().width<=0)throw Error('Hidden ad request');window.__adPushes++;s.dataset.adsbygoogleStatus='done';s.dataset.adStatus='filled';}};`;
async function main(){
 const seed=JSON.parse(fs.readFileSync(process.env.QUIZLORIA_RESEARCH_SEED,'utf8'));assert.equal(Object.keys(seed.premiumAssessments).length,20);await admin('PUT','',null);await admin('PATCH','',seed);
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,path.basename(pathname))));return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','psychology.js','membership.js','premium.js','result-card.js','would-you-rather.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','home-ad.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8094,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 async function account(name,width=1280){
  const p=await browser.newPage({viewport:{width,height:900}}),stats={loads:0};p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='pagead2.googlesyndication.com'){stats.loads++;return route.fulfill({contentType:'application/javascript',body:fakeAds})}return route.abort()});
  await p.goto('http://127.0.0.1:8094/');const uid=await p.evaluate(async name=>{const c=await firebase.auth().createUserWithEmailAndPassword(name+Date.now()+'@example.test','LocalTest123!');await c.user.updateProfile({displayName:name});await qSocialSave();return c.user.uid},name);
  await p.waitForFunction(uid=>quizloriaMembership.ready&&quizloriaMembership.uid===uid,uid);return {p,uid,stats};
 }
 const alice=await account('ResearchAlice',390),bob=await account('ResearchBob');const a=alice.p,b=bob.p;
 await b.evaluate(()=>openV9Page('tests'));await b.locator('.q-premium-card').first().waitFor();assert.equal(await b.locator('.q-premium-card').count(),56);checks++;
 assert.equal(await b.evaluate(async()=>{try{await firebase.database().ref('premiumAssessments/ipip-e1').once('value');return false}catch(e){return e.code==='PERMISSION_DENIED'}}),true);checks++;
 await b.locator('.q-premium-card').first().getByRole('button',{name:'🔒 Premium’u keşfet'}).click();assert.equal(await b.locator('#qResearchOverlay').count(),0);checks++;
 await admin('PUT','memberships/'+alice.uid,{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:stamp});await a.waitForFunction(()=>quizloriaMembership.active);alice.stats.loads=0;await a.reload();await a.waitForFunction(()=>quizloriaMembership.active);await a.evaluate(()=>openV9Page('tests'));assert.equal(alice.stats.loads,0);checks++;
 await a.locator('#v9Difficulty').selectOption('reflection');assert.equal(await a.locator('.q-premium-card:not(.hidden)').count(),20);checks++;
 for(const [id,test] of Object.entries(seed.premiumAssessments)){
  await a.evaluate(id=>qPremiumStart(id),id);await a.getByRole('button',{name:'Anladım, başlayalım →'}).click();
  assert.equal(await a.getByRole('button',{name:'Sonraki madde →',exact:true}).isDisabled(),true);checks++;
  for(let i=0;i<10;i++){
   assert.equal(await a.locator('.q-research-question').textContent(),test.items[i].q);assert.equal(await a.locator('.q-research-choice').count(),5);checks++;
   await a.locator('.q-research-choice').nth(test.items[i].reverse?0:4).click();await a.getByRole('button',{name:i===9?'Açıklamalı sonucumu gör →':'Sonraki madde →',exact:true}).click();
  }
  assert.equal(await a.locator('.q-research-score').textContent(),'5,0 / 5');await a.getByText('Bu sonuç neden çıktı?',{exact:true}).waitFor();assert.equal(await a.locator('.q-result-evidence li').count(),3);assert.ok((await a.locator('.q-research-result').textContent()).includes(test.higher));checks++;
  await a.locator('.q-research-sources summary').click();
  assert.ok((await a.locator('.q-research-sources').textContent()).includes('geçerlik, güvenirlik veya Türkiye norm çalışması yapılmamıştır'));checks++;
  assert.equal(await a.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;
  if(id==='ipip-o5'){await a.evaluate(()=>document.getElementById('qResearchOverlay').scrollTop=0);await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'research-result-mobile.png'),animations:'disabled'})}
  await a.getByRole('button',{name:'Testlere dön',exact:true}).click();assert.equal(await a.locator('#qResearchOverlay').count(),0);checks++;
 }
 // Opposite scoring direction, backwards navigation and neutral result.
 const id='ipip-c6',test=seed.premiumAssessments[id];await a.evaluate(id=>qPremiumStart(id),id);await a.getByRole('button',{name:'Anladım, başlayalım →'}).click();
 for(let i=0;i<10;i++){await a.locator('.q-research-choice').nth(test.items[i].reverse?4:0).click();await a.getByRole('button',{name:i===9?'Açıklamalı sonucumu gör →':'Sonraki madde →',exact:true}).click()}
 assert.equal(await a.locator('.q-research-score').textContent(),'1,0 / 5');assert.ok((await a.locator('.q-research-result').textContent()).includes(test.lower));checks++;
 await a.getByRole('button',{name:'← Yanıtlarımı gözden geçir'}).click();assert.equal(await a.locator('.q-research-choice[aria-pressed=true]').count(),1);checks++;
 for(let i=0;i<10;i++){await a.locator('.q-research-choice').nth(2).click();await a.getByRole('button',{name:i===9?'Açıklamalı sonucumu gör →':'Sonraki madde →',exact:true}).click()}
 assert.equal(await a.locator('.q-research-score').textContent(),'3,0 / 5');assert.ok((await a.locator('.q-research-result').textContent()).includes('orta noktası'));checks++;
 // No answer uploads or local persistence; revoke with a result still open.
 assert.equal(await a.evaluate(()=>Object.values(localStorage).some(v=>String(v).includes('Sözcüklerimi özenle seçerim'))),false);checks++;
 await admin('DELETE','memberships/'+alice.uid);await a.waitForFunction(()=>!quizloriaMembership.active);assert.equal(await a.locator('#qResearchOverlay').count(),0);checks++;
 // All six entertainment quizzes explain actual choices, on mobile and desktop.
 const mapping=[[0,1,2,0],[3,1,1,0],[2,3,1,0],[3,0,2,1],[1,0,1,1],[0,1,3,3],[1,0,0,2],[3,0,1,2],[1,0,3,0],[0,1,0,3],[3,2,1,0],[0,0,3,1],[0,1,2,3],[2,1,0,1],[1,0,0,2],[0,0,2,1],[1,0,0,3],[0,1,3,1],[1,3,0,3],[3,1,2,0]];
 for(const page of [a,b]){
  for(let i=1;i<=6;i++){
   const selected=await page.evaluate(({id,mapping})=>{const lookup=new Map();QPERSONAS[0].questions.forEach((q,i)=>q.a.forEach((a,j)=>lookup.set(a,mapping[i][j])));const test=QPERSONAS.find(t=>t.id===id);const answers=test.questions.map(q=>{const index=q.a.findIndex(a=>lookup.get(a)===0);return index<0?0:index});qPersonaStart(id);return answers}, {id:'persona_'+i,mapping});
   const labels=[];for(let q=0;q<20;q++){const choice=page.locator('#qPersonaBody .answer').nth(selected[q]);labels.push((await choice.textContent()).slice(3));await choice.click()}
   await page.locator('.q-persona-result-title').waitFor();await page.locator('#qPersonaBody').getByText('Neden bu karakter çıktı?',{exact:true}).waitFor();assert.ok((await page.locator('#qPersonaBody').textContent()).includes('Bilimsel kişilik testi'));assert.ok((await page.locator('#qPersonaBody .q-result-evidence').textContent()).includes(labels[0]));assert.equal(await page.locator('#qPersonaBody .q-result-evidence li').count(),3);checks++;
   if(page===a&&i===1)await page.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'character-result-mobile.png'),animations:'disabled'});
   await page.evaluate(()=>qPersonaClose());assert.equal(await page.locator('#qPersonaBody').textContent(),'');checks++;
  }
 }
 assert.deepEqual(errors,[]);console.log(checks+' research scoring/access and character explanation browser checks passed (20 real forms, all reverse keys, six character quizzes).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

