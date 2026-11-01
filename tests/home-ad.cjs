// Uses a fake ad SDK: no real ad requests, clicks or impressions.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),errors=[];let browser,server,checks=0;
const fakeAds=`(function(){window.__adRequests=0;const old=window.adsbygoogle||[];window.adsbygoogle={push:function(){const slot=document.querySelector('#qHomeAd ins');if(!slot||slot.getBoundingClientRect().width<=0)throw Error('Hidden ad request');window.__adRequests++;slot.setAttribute('data-adsbygoogle-status','done');slot.setAttribute('data-ad-status','filled');slot.textContent='Reklam alanı · Yerleşim önizlemesi';slot.style.background='#27202f';slot.style.color='#cbbfda';slot.style.lineHeight=slot.getBoundingClientRect().height+'px';}};old.forEach(()=>window.adsbygoogle.push({}));})();`;
async function main(){
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){const name=path.basename(pathname);res.setHeader('Content-Type','application/javascript');res.end(process.env.QUIZLORIA_SDK_DIR?fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,name)):await(await fetch('https://www.gstatic.com/firebasejs/10.14.1/'+name)).text());return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','psychology.js','social.js','party.js','home-ad.js','membership.js','premium.js','premium-stories.js','research-tests.js','persona-results.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8091,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 for(const width of [360,390,768,1280]){
  const p=await browser.newPage({viewport:{width,height:700}});p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1')return route.continue();if(url.hostname==='pagead2.googlesyndication.com')return route.fulfill({contentType:'application/javascript',body:fakeAds});return route.abort()});
  await p.goto('http://127.0.0.1:8091/');await p.evaluate(()=>new Promise(resolve=>{const off=firebase.auth().onAuthStateChanged(()=>{off();resolve()})}));await p.evaluate(()=>openV9Page('home'));
  const box=p.locator('#qHomeAd');assert.equal(await p.locator('#qResultAd ins').count(),0);checks++;
  assert.equal(await p.locator('script[src*="pagead/js/adsbygoogle.js"]').count(),1);checks++;
  const correctPlace=await p.evaluate(()=>{const a=document.getElementById('qHomeAd');return a.previousElementSibling.classList.contains('daily-panel')&&!a.closest('.daily-panel,.hero,#q19Entry,#quiz,#psyHub')});assert.equal(correctPlace,true);checks++;
  await box.scrollIntoViewIfNeeded();await p.waitForFunction(()=>window.__adRequests===1);checks++;
  const slot=await p.locator('#qHomeAd ins').boundingBox();assert.equal(slot.height,width<500?100:width<800?60:90);assert.ok(slot.width<=width);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;
  if(width===390){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'home-ad-mobile.png'),fullPage:true,animations:'disabled'})}
  for(const view of ['tests','psychology','social','games','profile','custom','settings']){await p.evaluate(view=>openV9Page(view),view);assert.equal(await box.isVisible(),false);checks++}
  await p.evaluate(()=>startQuiz('general'));assert.equal(await box.isVisible(),false);assert.equal(await p.locator('#answers .answer').count(),4);checks++;
  await p.evaluate(()=>openV9Page('home'));await box.scrollIntoViewIfNeeded();assert.equal(await box.isVisible(),true);assert.equal(await p.evaluate(()=>window.__adRequests),1);checks++;
  await p.evaluate(()=>document.querySelector('#qHomeAd ins').setAttribute('data-ad-status','unfilled'));await p.waitForFunction(()=>document.getElementById('qHomeAd').hidden);assert.equal(await box.isVisible(),false);checks++;
  await p.close();
 }
 // Ad blocker / SDK failure must not break quiz navigation.
 const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());await p.goto('http://127.0.0.1:8091/');await p.evaluate(()=>new Promise(resolve=>{const off=firebase.auth().onAuthStateChanged(()=>{off();resolve()})}));await p.evaluate(()=>openV9Page('home'));await p.locator('#qHomeAd').scrollIntoViewIfNeeded();await p.evaluate(()=>startQuiz('general'));assert.equal(await p.locator('#answers .answer').count(),4);assert.equal(await p.locator('#qHomeAd').isVisible(),false);checks++;await p.close();
 assert.deepEqual(errors,[]);console.log(checks+' manual ad layout checks passed; fake SDK only, four screen widths, no duplicate requests, no ads in quiz or other views, unfilled/ad-blocker handling.');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});



