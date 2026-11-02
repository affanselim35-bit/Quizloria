const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,checks=0;const errors=[];
async function admin(method,key,value){const r=await fetch('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb',{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});assert.ok(r.ok);return r.json()}
async function main(){
 await admin('DELETE','ratherVotes');await admin('PUT','siteAccess/freeTests',true);
 server=http.createServer((req,res)=>{try{const u=new URL(req.url,'http://localhost'),name=u.pathname==='/'?'index.html':u.pathname.slice(1);if(u.pathname.startsWith('/sdk/')){res.setHeader('Content-Type','application/javascript');return res.end(fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,path.basename(name))))}
 if(!/^[a-zA-Z0-9.-]+$/.test(name)||!fs.existsSync(path.join(root,name))){res.writeHead(404);return res.end()}
 let content=fs.readFileSync(path.join(root,name));if(name==='index.html')content=content.toString().replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
 res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});await new Promise(r=>server.listen(8097,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,executablePath:process.env.QUIZLORIA_BROWSER});
 const context=await browser.newContext({viewport:{width:390,height:900}});
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='pagead2.googlesyndication.com')return r.fulfill({contentType:'application/javascript',body:'window.adsbygoogle={push(){}}'});return r.abort()});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8097/');await p.waitForFunction(()=>window.quizloriaMembership?.ready);await p.evaluate(()=>openV9Page('rather'));
 assert.ok(await p.locator('#qRather').isVisible());checks++;
 assert.equal(await p.locator('#qRatherCategory option').count(),5);checks++;
 await p.locator('#qRatherA').click();assert.equal(await p.locator('#qRatherA').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#qRatherResults').isVisible(),false);assert.equal(await admin('GET','ratherVotes'),null);checks++;
 await p.locator('#qRatherLogin').click();assert.ok(await p.locator('#q19Backdrop').isVisible());await p.evaluate(()=>q19Close());checks++;
 await p.locator('#qRatherNext').click();assert.ok((await p.locator('#qRatherProgress').textContent()).startsWith('2 / 40'));checks++;
 const uid=await p.evaluate(async()=>{const r=await firebase.auth().createUserWithEmailAndPassword('rather-'+Date.now()+'@example.test','LocalTest123!');return r.user.uid});
 await p.waitForFunction(()=>!document.getElementById('qRatherA').disabled&&document.getElementById('qRatherLogin').hidden);await p.locator('#qRatherCategory').selectOption('Komik');
 const seen=new Set();for(let i=0;i<10;i++){await p.waitForFunction(()=>!document.getElementById('qRatherA').disabled);seen.add(await p.locator('#qRatherA').textContent());assert.ok((await p.locator('#qRatherProgress').textContent()).includes('/ 10 · Komik'));if(i<9)await p.locator('#qRatherNext').click()}assert.equal(seen.size,10);checks++;
 await p.locator('#qRatherA').click();await p.locator('#qRatherResults').waitFor();assert.equal(await p.locator('#qRatherPercentA').textContent(),'%100 · 1 oy');assert.equal(await p.locator('#qRatherPercentB').textContent(),'%0 · 0 oy');assert.ok(await p.locator('#qRatherA').isDisabled());checks++;
 let votes=await admin('GET','ratherVotes');const question=Object.keys(votes)[0];assert.equal(votes[question][uid],0);checks++;
 await admin('PUT','ratherVotes/'+question+'/fixture-other-voter',1);await p.waitForFunction(()=>document.getElementById('qRatherPercentA').textContent==='%50 · 1 oy');checks++;
 await p.locator('#qRatherRetry').click();await p.waitForFunction(()=>document.getElementById('qRatherPercentA').textContent==='%50 · 1 oy'&&!document.getElementById('qRatherResults').hidden);assert.equal(await p.locator('#qRatherA').getAttribute('aria-pressed'),'true');checks++;
 await p.locator('#qRather').screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'rather-mobile.png')});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;
 await p.evaluate(()=>firebase.auth().signOut());await p.waitForFunction(()=>!document.getElementById('qRatherLogin').hidden);assert.equal(await p.locator('#qRatherResults').isVisible(),false);await admin('PUT','ratherVotes/'+question+'/third-voter',1);assert.equal(await p.locator('#qRatherResults').isVisible(),false);checks++;
 await p.evaluate(()=>openV9Page('rather'));await p.setViewportSize({width:1280,height:1000});assert.equal(await p.locator('#qRather .qr-choices').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2);await p.locator('#qRather').screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'rather-desktop.png')});checks++;
 assert.deepEqual(errors,[]);console.log(checks+' dilemma browser checks passed (guest, 40 questions, categories, real votes, account changes, reload recovery, responsive layouts).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

