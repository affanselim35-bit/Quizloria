// Local page fixture only: no real accounts, Firebase writes or production requests.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'..');let browser,server;const errors=[];let checks=0;
async function main(){
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){const name=path.basename(pathname);res.setHeader('Content-Type','application/javascript');res.end(process.env.QUIZLORIA_SDK_DIR?fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,name)):await(await fetch('https://www.gstatic.com/firebasejs/10.14.1/'+name)).text());return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','result-insights.js','result-insights.css','psychology.js','social.js','party.js','home-ad.js','membership.js','premium.js','result-card.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','favicon.svg','site-info.js','site-info.css'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8090,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:8090/');await page.waitForFunction(()=>typeof startQuiz==='function');
  const settleAuth=()=>page.evaluate(()=>new Promise(resolve=>{const off=firebase.auth().onAuthStateChanged(()=>{off();resolve()})}));await settleAuth();
  const state=()=>page.evaluate(()=>({question:currentQuestion,correct:correctAnswers,answers:[...selectedAnswers],revealed:answerRevealed,timer:v6TimerId===null}));
  const refreshed=await page.evaluate(()=>({general:generalQuestions,logic:logicQuestions,science:scienceQuestions}));
  for(const [type,bank] of Object.entries(refreshed)){
   assert.equal(bank.length,type==='science'?12:15);checks++;
   assert.equal(new Set(bank.map(q=>q.q)).size,bank.length);checks++;
   for(let index=0;index<bank.length;index++){
    const item=bank[index];assert.equal(new Set(item.a).size,4);assert.ok(Number.isInteger(item.correct)&&item.correct>=0&&item.correct<4);assert.ok(item.explanation.length>40);checks++;
    for(const correct of [false,true]){
     await page.evaluate(({type,index,correct})=>{document.getElementById('quizMode').value='normal';startQuiz(type);const item=({general:generalQuestions,logic:logicQuestions,science:scienceQuestions})[type][index];activeQuestionList=[item];showQuestion();selectAnswer(correct?item.correct:(item.correct+1)%4);confirmAnswer()},{type,index,correct});
     assert.equal(await page.locator('#questionFeedback').getAttribute('data-outcome'),correct?'correct':'wrong');assert.equal(await page.locator('.question-explanation').textContent(),item.explanation);assert.equal((await state()).correct,correct?1:0);checks++;
     if(item.source){assert.equal(await page.locator('#questionFeedback a').getAttribute('href'),item.source);assert.equal(await page.locator('#questionFeedback a').getAttribute('rel'),'noopener noreferrer');checks++}
    }
   }
  }
  assert.equal(await page.locator('[data-test="science"]').getAttribute('data-difficulty'),'medium');checks++;
  await page.evaluate(()=>{v11ClearProgress();localStorage.removeItem('quizloria_test_history')});
  await page.evaluate(()=>{startQuiz('general');activeQuestionList=[generalQuestions[5],generalQuestions[7],generalQuestions[12]];showQuestion()});
  assert.equal(await page.locator('#nextQuestion').textContent(),'Cevabı Onayla');assert.equal(await page.locator('#nextQuestion').isDisabled(),true);checks++;
  await page.locator('#answers button').nth(0).click();assert.equal(await page.locator('#questionFeedback').isVisible(),false);assert.equal((await state()).answers.length,0);checks++;
  await page.locator('#nextQuestion').click();assert.deepEqual(await state(),{question:0,correct:0,answers:[0],revealed:true,timer:true});checks++;
  assert.equal(await page.locator('#questionFeedback').getAttribute('data-outcome'),'wrong');assert.equal(await page.locator('#answers .answer-correct').count(),1);assert.equal(await page.locator('#answers .answer-wrong').count(),1);assert.equal(await page.locator('#answers button:disabled').count(),4);checks++;
  assert.ok((await page.locator('#questionFeedback').textContent()).includes('H2O'));assert.ok((await page.locator('.question-explanation').textContent()).includes('iki hidrojen'));checks++;
  await page.evaluate(()=>selectAnswer(2));assert.deepEqual((await state()).answers,[0]);checks++;
  if(width===390){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'answer-feedback-mobile.png'),fullPage:true,animations:'disabled'})}
  await page.reload();await settleAuth();await page.evaluate(()=>v11Resume());assert.deepEqual(await state(),{question:0,correct:0,answers:[0],revealed:true,timer:true});assert.equal(await page.locator('#questionFeedback').getAttribute('data-outcome'),'wrong');checks++;
  await page.locator('#nextQuestion').click();assert.equal((await state()).question,1);assert.equal(await page.locator('#questionFeedback').isVisible(),false);assert.equal(await page.locator('#nextQuestion').isDisabled(),true);checks++;
  await page.locator('#answers button').nth(1).click();await page.locator('#nextQuestion').click();assert.equal((await state()).correct,1);assert.equal((await state()).question,1);assert.equal(await page.locator('#answers .answer-wrong').count(),0);assert.equal(await page.locator('#questionFeedback').getAttribute('data-outcome'),'correct');checks++;
  await page.locator('#nextQuestion').click();await page.locator('#answers button').nth(1).click();await page.locator('#nextQuestion').click();assert.equal(await page.locator('#nextQuestion').textContent(),'Sonucu Gör →');assert.equal(await page.locator('#result').isVisible(),false);checks++;
  await page.locator('#nextQuestion').click();assert.equal(await page.locator('#result').isVisible(),true);assert.equal((await state()).correct,2);assert.equal((await state()).answers.length,3);checks++;
  const history=await page.evaluate(()=>readTestHistory().length);await page.evaluate(()=>confirmAnswer());assert.equal(await page.evaluate(()=>readTestHistory().length),history);checks++;
  await page.evaluate(()=>retryWrongAnswers());assert.equal(await page.locator('#questionFeedback').isVisible(),false);await page.locator('#answers button').nth(2).click();await page.locator('#nextQuestion').click();assert.equal(await page.locator('#questionFeedback').getAttribute('data-outcome'),'correct');await page.locator('#nextQuestion').click();assert.equal(await page.evaluate(()=>readTestHistory().length),history);checks++;
  await page.evaluate(()=>{document.getElementById('quizMode').value='normal';startQuiz('personality')});const beforePersonality=(await state()).question;await page.locator('#answers button').first().click();await page.locator('#nextQuestion').click();assert.equal((await state()).question,beforePersonality+1);assert.equal(await page.locator('#questionFeedback').isVisible(),false);checks++;
  await page.evaluate(()=>{startQuiz('mixed');activeQuestionList=activeQuestionList.slice(0,2);showQuestion()});await page.locator('#answers button').first().click();await page.locator('#nextQuestion').click();assert.equal((await state()).question,0);assert.equal(await page.locator('#answers .answer-correct').count(),1);checks++;
  await page.clock.install();await page.evaluate(()=>{document.getElementById('quizMode').value='speed';startQuiz('general');activeQuestionList=[generalQuestions[5]];showQuestion()});await page.clock.runFor(15000);assert.deepEqual(await state(),{question:0,correct:0,answers:[-1],revealed:true,timer:true});assert.equal(await page.locator('#questionFeedback').getAttribute('data-outcome'),'timeout');checks++;
  await page.clock.fastForward(30000);assert.equal((await state()).question,0);assert.equal((await state()).answers.length,1);await page.locator('#nextQuestion').click();assert.equal(await page.locator('#result').isVisible(),true);checks++;
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log(checks+' answer feedback checks passed at mobile and desktop widths (correct/wrong, lock, scoring, resume, last question, practice, personality, mixed, speed timeout).');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});
