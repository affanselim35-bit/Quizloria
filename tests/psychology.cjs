// Browser-only checks. Uses local fixtures and does not sign in or write data.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,questions=0;const errors=[];
async function main(){
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){const name=path.basename(pathname);res.setHeader('Content-Type','application/javascript');res.end(process.env.QUIZLORIA_SDK_DIR?fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,name)):await(await fetch('https://www.gstatic.com/firebasejs/10.14.1/'+name)).text());return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','psychology.js','social.js','party.js','home-ad.js','membership.js','premium.js','result-card.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');
  if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8089,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:8089/');await page.locator('a[data-view="psychology"]').click();
  assert.equal(await page.locator('.psy-card').count(),10);
  const sets=new Set();
  for(let i=0;i<10;i++){
   await page.locator('.psy-card').nth(i).getByRole('button').click();const expected=[];
   for(let j=0;j<8;j++){
    await page.locator('.psy-progress').filter({hasText:'Soru '+(j+1)+' / 8'}).waitFor();
    const choices=page.locator('.psy-choice');assert.equal(await choices.count(),4);
    const labels=await choices.allTextContents();assert.equal(new Set(labels).size,4);
    for(let k=0;k<4;k++){assert.ok(labels[k].startsWith(String.fromCharCode(65+k)+') '));assert.ok(await choices.nth(k).isVisible());const box=await choices.nth(k).boundingBox();assert.ok(box.width>150&&box.height>=48)}
    const key=JSON.stringify(labels);assert.equal(sets.has(key),false,'question-specific options must differ');sets.add(key);
    assert.equal(await page.getByRole('button',{name:j===7?'Yanıt özetini gör →':'Sonraki soru →',exact:true}).isDisabled(),true);
    const selection=j%4;expected.push(labels[selection]);await choices.nth(selection).click();
    assert.equal(await choices.nth(selection).getAttribute('aria-pressed'),'true');
    if(width===390&&i===0&&j===0)await page.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'psychology-mobile.png'),fullPage:true});
    await page.getByRole('button',{name:j===7?'Yanıt özetini gör →':'Sonraki soru →',exact:true}).click();questions++;
    if(i===0&&j===0){await page.getByRole('button',{name:'← Önceki soru',exact:true}).click();assert.equal(await page.locator('.psy-choice').nth(selection).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Sonraki soru →',exact:true}).click()}
   }
   assert.deepEqual(await page.locator('.psy-review li p').allTextContents(),expected);
   assert.equal(await page.locator('.psy-result-hero').getAttribute('data-pattern'),'mixed');
   assert.ok((await page.locator('.psy-result-title').textContent()).length>15);
   const resultTitle=await page.locator('.psy-result-title').boundingBox(),nav=await page.locator('.v9-nav').boundingBox();assert.ok(resultTitle.y>=nav.y+nav.height,'result heading must not be hidden under navigation');assert.ok(resultTitle.y<900,'result heading should appear immediately');
   assert.equal(await page.locator('.psy-result-evidence li').count(),4);
   for(const quote of await page.locator('.psy-result-evidence li p').allTextContents())assert.ok(expected.some(answer=>'“'+answer.slice(3)+'”'===quote),'reason must quote an actual chosen answer');
   await page.getByText('Bu sonuç neden çıktı?',{exact:true}).waitFor();
   await page.getByRole('button',{name:'← Yanıtlarımı düzenle',exact:true}).click();await page.locator('.psy-choice').first().click();
   const changed=await page.locator('.psy-choice').first().textContent();await page.getByRole('button',{name:'Yanıt özetini gör →',exact:true}).click();assert.equal(await page.locator('.psy-review li p').last().textContent(),changed);
   assert.equal(await page.locator('.psy-result-hero').getAttribute('data-pattern'),'resources');
   assert.ok((await page.locator('.psy-result-why>p').first().textContent()).includes('5 tanesinde'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.getByRole('button',{name:'Anketlere dön',exact:true}).click();
   await page.locator('.psy-card').nth(i).getByRole('button').click();
   for(let j=0;j<8;j++){await page.locator('.psy-choice').nth(3).click();await page.getByRole('button',{name:j===7?'Yanıt özetini gör →':'Sonraki soru →',exact:true}).click();questions++}
   assert.equal(await page.locator('.psy-result-hero').getAttribute('data-pattern'),'difficulties');
   assert.ok((await page.locator('.psy-result-why>p').first().textContent()).includes('8 tanesinde'));
   assert.equal(await page.locator('.psy-result-evidence li').count(),3);
   const allChosen=await page.locator('.psy-review li p').allTextContents();
   for(const quote of await page.locator('.psy-result-evidence li p').allTextContents())assert.ok(allChosen.some(answer=>'“'+answer.slice(3)+'”'===quote));
   if(width===390&&i===0){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'psychology-result-mobile.png'),fullPage:true})}
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.getByRole('button',{name:'Anketlere dön',exact:true}).click();
  }
  assert.equal(sets.size,80);await page.close();
 }
 assert.deepEqual(errors,[]);console.log(questions+' question screens passed; all ten tests have verified mixed, resource and difficulty summaries with correct counts, actual answer evidence, and editable results on mobile and desktop.');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});



