// Local page fixture only: no real accounts, Firebase writes or production requests.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'..');let browser,server;const errors=[];let checks=0;
async function main(){
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){const name=path.basename(pathname);res.setHeader('Content-Type','application/javascript');res.end(process.env.QUIZLORIA_SDK_DIR?fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,name)):await(await fetch('https://www.gstatic.com/firebasejs/10.14.1/'+name)).text());return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','daily-challenge.js','result-insights.js','result-insights.css','psychology.js','social.js','party.js','home-ad.js','membership.js','premium.js','result-card.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','favicon.svg','site-info.js','site-info.css'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8090,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:950}});page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await page.goto('http://127.0.0.1:8090/');await page.waitForFunction(()=>window.qResultInsights&&typeof startQuiz==='function');await page.evaluate(()=>new Promise(resolve=>{const off=firebase.auth().onAuthStateChanged(()=>{off();resolve()})}));
 async function finish(correct,mode='normal',changed=false,practice=false){await page.evaluate(({correct,mode,changed,practice})=>{document.getElementById('quizMode').value=mode;startQuiz('general');if(changed)activeQuestionList[0]={...activeQuestionList[0],q:activeQuestionList[0].q+' (farklı)'};v6Practice=practice;const list=getActiveQuestions();for(let i=0;i<list.length;i++){selectAnswer(i<correct?list[i].correct:(list[i].correct+1)%4);confirmAnswer();advanceQuizQuestion()}},{correct,mode,changed,practice})}
 await finish(5);assert.ok(await page.locator('#qResultInsights').isVisible());assert.ok((await page.locator('#qInsightsComparison').textContent()).includes('ilk kaydın'));assert.equal(await page.locator('#qResultInsights tbody tr').count(),5);checks+=3;
 const sums=await page.locator('#qResultInsights tbody tr td:nth-child(2)').allTextContents();assert.equal(sums.reduce((sum,t)=>sum+Number(t.split('/')[0]),0),5);assert.equal(sums.reduce((sum,t)=>sum+Number(t.split('/')[1]),0),15);checks+=2;
 const reason=await page.locator('.q-insights-recommendation p').first().textContent();assert.ok(reason.includes('takıldın'));assert.equal(await page.locator('.q-insights-recommendation button').count(),2);checks+=2;
 await page.locator('.q-insights-recommendation button').first().click();assert.ok(await page.locator('#quiz').isVisible());assert.equal(await page.locator('#qResultInsights').isVisible(),false);checks+=2;
 await finish(8);assert.ok((await page.locator('#qInsightsComparison').textContent()).includes('3 soru daha fazla'));checks++;
 await page.reload();await page.waitForFunction(()=>window.qResultInsights&&typeof startQuiz==='function');await page.evaluate(()=>new Promise(resolve=>{const off=firebase.auth().onAuthStateChanged(()=>{off();resolve()})}));await finish(8);assert.ok((await page.locator('#qInsightsComparison').textContent()).includes('aynı sayıda'));checks++;
 await finish(4,'speed');assert.ok((await page.locator('#qInsightsComparison').textContent()).includes('ilk kaydın'));checks++;
 await finish(4,'normal',true);assert.ok((await page.locator('#qInsightsComparison').textContent()).includes('değişmiş'));checks++;
 const count=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('quizloria_learning_v1:guest')).length);const before=await count();await finish(10,'normal',false,true);assert.ok((await page.locator('#qInsightsComparison').textContent()).includes('eklenmez'));assert.equal(await count(),before);checks+=2;
 await finish(15);assert.ok((await page.locator('.q-insights-recommendations h4').textContent()).includes('keşfin'));assert.ok((await page.locator('.q-insights-highlight').textContent()).includes('doğru'));checks+=2;
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;
 if(width===390)await page.locator('#qResultInsights').screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'result-insights-mobile.png')});
 await page.evaluate(()=>{startQuiz('personality');for(let i=0;i<getActiveQuestions().length;i++){selectAnswer(0);confirmAnswer()}});
 assert.equal(await page.locator('#qResultInsights').isVisible(),false);checks++;
 await page.evaluate(()=>{window.qResultInsights.reset();const set=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('disabled')};window.qResultInsights.complete({type:'science',mode:'normal',questions:[{q:'A',a:['a','b','c','d'],correct:0,topic:'space'}],answers:[0]});Storage.prototype.setItem=set});assert.ok((await page.locator('#qInsightsComparison').textContent()).includes('kaydedilemediği'));checks++;
 await page.close();
 }
 assert.deepEqual(errors,[]);console.log(checks+' learning-summary browser checks passed on mobile/desktop (topics, suggested quiz navigation, improvement, same/worse modes, changed banks, reload, practice, full score, storage unavailable).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});
