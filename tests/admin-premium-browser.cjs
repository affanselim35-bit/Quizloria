// Local Auth + RTDB emulators and a fake ad SDK only. Never processes a payment.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,checks=0;const errors=[];
const stamp={'.sv':'timestamp'},fixture={title:'Premium Fixture',questions:Array.from({length:5},(_,i)=>({q:'Protected fixture question '+i,a:['First','Second','Third','Fourth'],correct:0,explanation:'Fixture explanation.'}))};
async function admin(method,key,value){const r=await fetch('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb',{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});assert.equal(r.ok,true);return r.json()}
const fakeAds=`window.__adPushes=0;window.adsbygoogle={loaded:true,push:function(){const s=document.querySelector('ins.adsbygoogle:not([data-adsbygoogle-status])');if(!s||s.getBoundingClientRect().width<=0)throw Error('Hidden ad request');window.__adPushes++;s.dataset.adsbygoogleStatus='done';s.dataset.adStatus='filled';}};`;
async function main(){
 const seed=JSON.parse(fs.readFileSync(process.env.QUIZLORIA_RELEASE_SEED,'utf8'));await admin('PUT','',null);await admin('PATCH','',seed);
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,path.basename(pathname))));return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','psychology.js','membership.js','premium.js','result-card.js','would-you-rather.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','home-ad.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8097,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 async function account(name,width=1280){
  const p=await browser.newPage({viewport:{width,height:900}}),stats={loads:0};p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='pagead2.googlesyndication.com'){stats.loads++;return route.fulfill({contentType:'application/javascript',body:fakeAds})}return route.abort()});
  await p.goto('http://127.0.0.1:8097/');const uid=await p.evaluate(async name=>{const c=await firebase.auth().createUserWithEmailAndPassword(name+Date.now()+'@example.test','LocalTest123!');await c.user.updateProfile({displayName:name});await qSocialSave();return c.user.uid},name);
  await p.waitForFunction(uid=>quizloriaMembership.ready&&quizloriaMembership.uid===uid,uid);return {p,uid,stats};
 }
 const alice=await account('AdminAlice',390),bob=await account('FreeBob');const a=alice.p,b=bob.p;
 assert.equal(await a.evaluate(()=>quizloriaMembership.active||quizloriaMembership.admin),false);checks++;
 await admin('PUT','admins/'+alice.uid,true);await a.waitForFunction(()=>quizloriaMembership.ready&&quizloriaMembership.active&&quizloriaMembership.admin);checks++;
 await admin('PUT','memberships/'+alice.uid,{plan:'premium',expiresAt:Date.now()-1,updatedAt:Date.now()});alice.stats.loads=0;await a.reload();await a.waitForFunction(()=>quizloriaMembership.ready&&quizloriaMembership.admin);assert.equal(alice.stats.loads,0);assert.equal(await a.evaluate(()=>quizloriaMembership.expiresAt),0);checks++;
 await a.evaluate(()=>openV9Page('premium'));assert.ok((await a.locator('#qPremiumStatus').textContent()).includes('Yönetici erişimi'));assert.equal(await a.locator('#qPremiumBuy').isVisible(),false);assert.equal(await a.locator('#q22AdminNav').isVisible(),true);checks++;
 await a.evaluate(()=>openV9Page('home'));assert.ok((await a.locator('#qPremiumHome').textContent()).includes('Yönetici · Reklamsız Premium erişimi'));assert.equal(await a.locator('#qHomeAd').isVisible(),false);checks++;
 await a.evaluate(()=>openV9Page('profile'));assert.ok((await a.locator('#qPremiumProfile').textContent()).includes('Yönetici · Reklamsız Premium erişimi'));checks++;
 await a.evaluate(()=>qPremiumStart('qplus_1'));await a.waitForFunction(()=>activeQuiz==='premium:qplus_1');assert.equal(await a.locator('#answers button').count(),4);checks++;
 await a.evaluate(()=>qPremiumStart('ipip-o5'));await a.locator('#qResearchOverlay').waitFor();await a.keyboard.press('Escape');checks++;
 await a.evaluate(()=>qPremiumStart('story-anime-yolculugu'));await a.getByRole('button',{name:'Hikâyeye başla →'}).click();for(let i=0;i<12;i++){await a.locator('.q-story-choice').first().click();await a.getByRole('button',{name:i===11?'Karakterimi keşfet →':'Sonraki senaryo →',exact:true}).click()}await a.locator('.q-story-result-title').waitFor();assert.equal(alice.stats.loads,0);checks++;
 // A trusted role is watched in real time; stale open content must close on revocation.
 await admin('DELETE','admins/'+alice.uid);await a.waitForFunction(()=>quizloriaMembership.ready&&!quizloriaMembership.admin&&!quizloriaMembership.active);assert.equal(await a.locator('#qStoryOverlay').count(),0);assert.equal(await a.evaluate(()=>activeQuestionList.length),0);checks++;
 assert.equal(await a.evaluate(async()=>{try{await firebase.database().ref('premiumTests/qplus_1').once('value');return false}catch(e){return e.code==='PERMISSION_DENIED'}}),true);checks++;
 // A console/local-storage flag cannot grant backend access.
 assert.equal(await b.evaluate(async()=>{localStorage.setItem('admin','true');localStorage.setItem('premium','true');try{await firebase.database().ref('admins/'+firebase.auth().currentUser.uid).set(true);return false}catch(e){return e.code==='PERMISSION_DENIED'}}),true);assert.equal(await b.evaluate(()=>quizloriaMembership.active),false);checks++;
 await admin('PUT','admins/'+alice.uid,true);await a.waitForFunction(()=>quizloriaMembership.active&&quizloriaMembership.admin);await a.evaluate(()=>firebase.auth().signOut());await a.waitForFunction(()=>quizloriaMembership.ready&&quizloriaMembership.uid===null);assert.equal(await a.evaluate(()=>quizloriaMembership.admin||quizloriaMembership.active),false);checks++;
 assert.deepEqual(errors,[]);console.log(checks+' admin Premium browser flows passed (initial reload requests no ad SDK, all test types, server role, revocation and logout).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

