// Local Auth + RTDB emulators and a fake ad SDK only. Never processes a payment.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,checks=0;const errors=[];
const stamp={'.sv':'timestamp'},fixture={title:'Premium Fixture',questions:Array.from({length:5},(_,i)=>({q:'Protected fixture question '+i,a:['First','Second','Third','Fourth'],correct:0,explanation:'Fixture explanation.'}))};
async function admin(method,key,value){const r=await fetch('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb',{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});assert.equal(r.ok,true);return r.json()}
const fakeAds=`window.__adPushes=0;window.adsbygoogle={loaded:true,push:function(){const s=document.querySelector('ins.adsbygoogle:not([data-adsbygoogle-status])');if(!s||s.getBoundingClientRect().width<=0)throw Error('Hidden ad request');window.__adPushes++;s.dataset.adsbygoogleStatus='done';s.dataset.adStatus='filled';}};`;
async function main(){
 const seed=JSON.parse(fs.readFileSync(process.env.QUIZLORIA_ADVANCED_SEED,'utf8'));await admin('PUT','',null);await admin('PATCH','',seed);
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,path.basename(pathname))));return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','psychology.js','membership.js','premium.js','mystery-extra.js','daily-mystery.js','daily-mystery-core.js','result-card.js','would-you-rather.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','home-ad.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8095,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 async function account(name,width=1280){
  const p=await browser.newPage({viewport:{width,height:900}}),stats={loads:0};p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='pagead2.googlesyndication.com'){stats.loads++;return route.fulfill({contentType:'application/javascript',body:fakeAds})}return route.abort()});
  await p.goto('http://127.0.0.1:8095/');const uid=await p.evaluate(async name=>{const c=await firebase.auth().createUserWithEmailAndPassword(name+Date.now()+'@example.test','LocalTest123!');await c.user.updateProfile({displayName:name});await qSocialSave();return c.user.uid},name);
  await p.waitForFunction(uid=>quizloriaMembership.ready&&quizloriaMembership.uid===uid,uid);return {p,uid,stats};
 }
 const alice=await account('AdvancedAlice',390),bob=await account('AdvancedBob');const a=alice.p,b=bob.p;
 assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('const QPLUS_QUIZZES'),false);checks++;
 await b.evaluate(()=>openV9Page('tests'));assert.equal(await b.locator('.q-premium-card').count(),36);assert.equal(await b.locator('.q-premium-badge').count(),36);checks++;
 for(const id of Object.keys(seed.premiumTests)){
  await b.evaluate(id=>startQuiz(id),id);assert.equal(await b.evaluate(()=>document.body.dataset.quizloriaView),'premium');assert.equal(await b.evaluate(id=>activeQuiz===id||activeQuiz==='premium:'+id,id),false);assert.equal(await b.evaluate(id=>getQuestionBank(id).length,id),0);checks++;
 }
 await b.evaluate(()=>startQuiz('premium:qplus_1'));assert.equal(await b.locator('#quiz').isVisible(),false);checks++;
 await b.evaluate(test=>{localStorage.setItem('premium','true');localStorage.setItem(V11_PROGRESS,JSON.stringify({type:'qplus_1',mode:'normal',question:0,answers:[],list:test.questions,at:Date.now()}));localStorage.setItem(FAVORITES_KEY,JSON.stringify(['qplus_1','football']));},seed.premiumTests.qplus_1);
 await b.reload();await b.waitForFunction(()=>quizloriaMembership.ready);assert.equal(await b.evaluate(()=>localStorage.getItem(V11_PROGRESS)),null);assert.equal(await b.locator('#v11Resume').isVisible(),false);checks++;
 assert.equal(await b.evaluate(()=>readFavorites().includes('premium:qplus_1')&&readFavorites().includes('football')),true);checks++;
 assert.equal(await b.evaluate(async()=>{try{await firebase.database().ref('premiumTests/qplus_1').once('value');return false}catch(e){return e.code==='PERMISSION_DENIED'}}),true);checks++;
 assert.equal(await b.evaluate(()=>TEST_IDS.some(isLegacyPremiumTest)||V8_TYPES.some(isLegacyPremiumTest)||buildMixedV8().some(q=>isLegacyPremiumTest(q.source))),false);checks++;
 await b.evaluate(()=>startQuiz('general'));await b.locator('#question').waitFor();assert.equal(await b.locator('#answers button').count(),4);checks++;
 await admin('PUT','memberships/'+alice.uid,{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:stamp});await a.waitForFunction(()=>quizloriaMembership.active);alice.stats.loads=0;await a.reload();await a.waitForFunction(()=>quizloriaMembership.active);assert.equal(alice.stats.loads,0);checks++;
 for(const [id,test] of Object.entries(seed.premiumTests)){
  // Legacy links must now resolve through the protected backend.
  await a.evaluate(id=>startQuiz(id),id);await a.waitForFunction(id=>activeQuiz==='premium:'+id,id);
  const currentText=await a.locator('#question').textContent();assert.equal(await a.evaluate(()=>activeQuestionList.length),15);assert.ok(test.questions.some(q=>q.q===currentText));assert.equal(await a.evaluate(()=>localStorage.getItem(V11_PROGRESS)),null);checks++;
 }
 await a.evaluate(()=>qPremiumStart('qplus_1'));
 for(let i=0;i<15;i++){
  const correct=await a.evaluate(()=>activeQuestionList[currentQuestion].correct);await a.locator('#answers button').nth(correct).click();await a.locator('#nextQuestion').click();await a.locator('#nextQuestion').click();
 }
 assert.equal(await a.locator('#resultTitle').textContent(),seed.premiumTests.qplus_1.title);assert.ok((await a.locator('#resultText').textContent()).includes('100/100'));assert.equal(await a.locator('#qResultAd').isVisible(),false);assert.equal(alice.stats.loads,0);checks++;
 await a.evaluate(()=>{openV9Page('tests');document.getElementById('testSearch').value='Astronomi';filterTests()});assert.equal(await a.locator('.q-premium-card:not(.hidden)').count(),2);checks++;
 await a.evaluate(()=>document.getElementById('v11Toast').hidden=true);await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'advanced-premium-mobile.png'),fullPage:true,animations:'disabled'});
 await a.evaluate(()=>{document.getElementById('testSearch').value='';setTestFilter('sports')});assert.equal(await a.locator('.q-premium-card:not(.hidden)').count(),2);checks++;
 await a.evaluate(()=>setTestFilter('fun'));assert.equal(await a.locator('.q-premium-card:not(.hidden)').count(),6);checks++;
 await a.evaluate(()=>qPremiumStart('qplus_36'));await a.waitForFunction(()=>activeQuiz==='premium:qplus_36');await admin('DELETE','memberships/'+alice.uid);await a.waitForFunction(()=>!quizloriaMembership.active);assert.equal(await a.evaluate(()=>activeQuestionList.length+v6WrongQuestions.length),0);assert.equal(await a.locator('#quiz').isVisible(),false);assert.equal(await a.locator('#question').textContent(),'');checks++;
 assert.deepEqual(errors,[]);console.log(checks+' advanced migration browser checks passed (all 36 legacy routes, paid access, cache cleanup, favorites, free modes and revocation).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

