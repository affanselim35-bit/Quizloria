// Local Auth + RTDB emulators and a fake ad SDK only. Never processes a payment.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,checks=0;const errors=[];
const stamp={'.sv':'timestamp'},fixture={title:'Premium Fixture',questions:Array.from({length:5},(_,i)=>({q:'Protected fixture question '+i,a:['First','Second','Third','Fourth'],correct:0,explanation:'Fixture explanation.'}))};
async function admin(method,key,value){const r=await fetch('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb',{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});assert.equal(r.ok,true);return r.json()}
const fakeAds=`window.__adPushes=0;window.adsbygoogle={loaded:true,push:function(){const s=document.querySelector('ins.adsbygoogle:not([data-adsbygoogle-status])');if(!s||s.getBoundingClientRect().width<=0)throw Error('Hidden ad request');window.__adPushes++;s.dataset.adsbygoogleStatus='done';s.dataset.adStatus='filled';}};`;
async function main(){
 const seed=JSON.parse(fs.readFileSync(process.env.QUIZLORIA_STORIES_SEED,'utf8'));await admin('PUT','',null);await admin('PATCH','',seed);
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,path.basename(pathname))));return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','psychology.js','membership.js','premium.js','premium-stories.js','research-tests.js','persona-results.js','home-ad.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8096,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 async function account(name,width=1280){
  const p=await browser.newPage({viewport:{width,height:900}}),stats={loads:0};p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='pagead2.googlesyndication.com'){stats.loads++;return route.fulfill({contentType:'application/javascript',body:fakeAds})}return route.abort()});
  await p.goto('http://127.0.0.1:8096/');const uid=await p.evaluate(async name=>{const c=await firebase.auth().createUserWithEmailAndPassword(name+Date.now()+'@example.test','LocalTest123!');await c.user.updateProfile({displayName:name});await qSocialSave();return c.user.uid},name);
  await p.waitForFunction(uid=>quizloriaMembership.ready&&quizloriaMembership.uid===uid,uid);return {p,uid,stats};
 }
 const all=Object.entries(seed.premiumStories);assert.equal(all.length,24);assert.equal(new Set(all.flatMap(([,t])=>t.questions.map(q=>q.q))).size,288);checks++;
 const alice=await account('StoryAlice',390),bob=await account('StoryBob');const a=alice.p,b=bob.p;
 await b.evaluate(()=>openV9Page('tests'));await b.locator('#v9Difficulty').selectOption('story');await b.waitForFunction(()=>document.querySelectorAll('.q-premium-card:not(.hidden)').length===24);checks++;
 await b.locator('.q-premium-card:not(.hidden)').first().getByRole('button',{name:'🔒 Premium’u keşfet'}).click();assert.equal(await b.locator('#qStoryOverlay').count(),0);checks++;
 assert.equal(await b.evaluate(async()=>{try{await firebase.database().ref('premiumStories/story-anime-yolculugu').once('value');return false}catch(e){return e.code==='PERMISSION_DENIED'}}),true);checks++;
 assert.equal(await b.evaluate(story=>{try{qStoryOpen(story,'spoofed');return false}catch(e){return true}},all[0][1]),true);checks++;
 await admin('PUT','memberships/'+alice.uid,{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:stamp});await a.waitForFunction(()=>quizloriaMembership.active);alice.stats.loads=0;await a.reload();await a.waitForFunction(()=>quizloriaMembership.active);assert.equal(alice.stats.loads,0);checks++;
 const signatures=[[9,1,1,1],[1,9,1,1],[1,1,9,1],[1,1,1,9],[1,5,5,1],[5,1,1,5],[4,4,3,1],[1,4,1,6]];
 for(const [testIndex,[id,story]] of all.entries()){
  await a.evaluate(id=>qPremiumStart(id),id);await a.locator('#qStoryBody').getByText('👑 Premium · 12 senaryo · 8 farklı sonuç',{exact:true}).waitFor();assert.ok((await a.locator('#qStoryBody').textContent()).includes('bilimsel kişilik ölçümü'));checks++;
  await a.getByRole('button',{name:'Hikâyeye başla →'}).click();assert.equal(await a.getByRole('button',{name:'Sonraki senaryo →',exact:true}).isDisabled(),true);checks++;
  const expected=testIndex%8,targets=signatures[expected].flatMap((n,i)=>Array(n).fill(i)),selected=[];
  for(let i=0;i<12;i++){
   assert.equal(await a.locator('.q-story-question').textContent(),story.questions[i].q);assert.equal(await a.locator('.q-story-choice').count(),4);assert.equal(new Set(await a.locator('.q-story-choice').allTextContents()).size,4);checks++;
   const index=story.questions[i].traits.indexOf(targets[i]);selected.push(story.questions[i].a[index]);await a.locator('.q-story-choice').nth(index).click();await a.getByRole('button',{name:i===11?'Karakterimi keşfet →':'Sonraki senaryo →',exact:true}).click();
  }
  assert.equal(await a.locator('.q-story-result-title').textContent(),story.results[expected].name);await a.locator('#qStoryBody').getByText('Neden bu karakter çıktı?',{exact:true}).waitFor();assert.equal(await a.locator('#qStoryBody .q-result-evidence li').count(),3);checks++;
  for(const text of await a.locator('#qStoryBody .q-result-evidence p').allTextContents())assert.ok(selected.some(answer=>text.includes('“'+answer+'”')));checks++;
  assert.equal(await a.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(alice.stats.loads,0);assert.equal(await a.evaluate(()=>localStorage.getItem(V11_PROGRESS)),null);checks++;
  if(testIndex===0)await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'story-result-mobile.png'),animations:'disabled'});
  await a.getByRole('button',{name:'Testlere dön',exact:true}).click();assert.equal(await a.locator('#qStoryOverlay').count(),0);checks++;
 }
 // Review retains the selected answer; replay clears it; Escape closes private content.
 const [id,story]=all[0];await a.evaluate(id=>qPremiumStart(id),id);await a.getByRole('button',{name:'Hikâyeye başla →'}).click();
 for(let i=0;i<12;i++){await a.locator('.q-story-choice').first().click();await a.getByRole('button',{name:i===11?'Karakterimi keşfet →':'Sonraki senaryo →',exact:true}).click()}
 await a.getByRole('button',{name:'← Cevaplarımı gözden geçir'}).click();assert.equal(await a.locator('.q-story-choice[aria-pressed=true]').textContent(),'A) '+story.questions[0].a[0]);checks++;
 await a.keyboard.press('Escape');assert.equal(await a.locator('#qStoryOverlay').count(),0);checks++;
 // The same quiz produces a different character under a different preference pattern.
 const names=[];for(const trait of [0,2]){await a.evaluate(id=>qPremiumStart(id),id);await a.getByRole('button',{name:'Hikâyeye başla →'}).click();for(let i=0;i<12;i++){await a.locator('.q-story-choice').nth(story.questions[i].traits.indexOf(trait)).click();await a.getByRole('button',{name:i===11?'Karakterimi keşfet →':'Sonraki senaryo →',exact:true}).click()}names.push(await a.locator('.q-story-result-title').textContent());await a.getByRole('button',{name:'🔄 Yeniden başla'}).click();await a.getByRole('button',{name:'Hikâyeye başla →'}).click();assert.equal(await a.locator('.q-story-choice[aria-pressed=true]').count(),0);await a.keyboard.press('Escape')};assert.notEqual(names[0],names[1]);checks++;
 await a.evaluate(()=>{openV9Page('tests');document.getElementById('testSearch').value='Anime';document.getElementById('v9Difficulty').value='story';filterTests()});assert.equal(await a.locator('.q-premium-card:not(.hidden)').count(),1);await a.locator('.q-premium-card:not(.hidden)').screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'story-card-mobile.png'),animations:'disabled'});checks++;
 await a.evaluate(id=>qPremiumStart(id),id);await a.getByRole('button',{name:'Hikâyeye başla →'}).click();await admin('PUT','memberships/'+alice.uid,{plan:'premium',expiresAt:Date.now()+1000,updatedAt:stamp});await a.waitForFunction(()=>!quizloriaMembership.active);assert.equal(await a.locator('#qStoryOverlay').count(),0);checks++;
 assert.equal(await a.evaluate(q=>Object.values(localStorage).some(v=>String(v).includes(q)),story.questions[0].q),false);checks++;
 // Six existing entertainment tests remain free.
 await b.evaluate(()=>qPersonaStart('persona_1'));assert.equal(await b.locator('#qPersonaBody .answer').count(),4);checks++;
 assert.deepEqual(errors,[]);console.log(checks+' story browser checks passed (24 quizzes, 288 question screens, eight outcome styles, free/paid access, editing and expiry).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

