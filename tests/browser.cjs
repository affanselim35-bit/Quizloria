// Requires Playwright, Edge/Chromium, and Auth + RTDB emulators on 9099/9000.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),errors=[];let browser,server,checks=0;
async function main(){
 const reset=await fetch('http://127.0.0.1:9000/.json?ns=demo-quizloria-default-rtdb',{method:'PUT',headers:{Authorization:'Bearer owner'},body:'null'});assert.equal(reset.ok,true,'reset local test database');
 const sdkDir=process.env.QUIZLORIA_SDK_DIR;
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){const name=path.basename(pathname);res.setHeader('Content-Type','application/javascript');res.end(sdkDir?fs.readFileSync(path.join(sdkDir,name)):await (await fetch('https://www.gstatic.com/firebasejs/10.14.1/'+name)).text());return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','favicon.svg'].includes(name)){res.statusCode=404;res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');
  if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.statusCode=500;res.end(e.message)}});
 await new Promise(resolve=>server.listen(8088,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 const pages=[];
 for(let i=0;i<6;i++){
  const context=await browser.newContext({viewport:{width:i===0?390:1280,height:900}}),p=await context.newPage();pages.push(p);
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8088/');await p.waitForFunction(()=>window.firebase&&window.qSocialSave);
  await p.evaluate(async i=>{const c=await firebase.auth().createUserWithEmailAndPassword('player'+i+'-'+Date.now()+'@example.test','LocalTest123!');await c.user.updateProfile({displayName:'Player'+i});await qSocialSave();openV9Page('social')},i);
  await p.waitForFunction(()=>document.getElementById('qsMe').textContent.includes('Player'));
 }
 const [a,b]=pages;
 async function search(p,name){await p.locator('#qsSearch').fill(name);await p.locator('#qsSearch').locator('..').getByRole('button',{name:'Ara',exact:true}).click()}
 await search(a,'Player1');await a.locator('#qsSearchResult').getByRole('button',{name:'İstek Gönder'}).click();
 await a.locator('#qsSent').getByText('Player1 · Bekliyor').waitFor();checks++;
 await b.locator('#qsRequests').getByText('Player0 · Gelen istek').waitFor();checks++;
 await a.locator('#qsSent').getByRole('button',{name:'İsteği iptal et'}).click();
 await b.getByText('Yeni istek yok.',{exact:true}).waitFor();checks++;
 await search(a,'Player1');await a.locator('#qsSearchResult').getByRole('button',{name:'İstek Gönder'}).click();
 await b.locator('#qsRequests').getByRole('button',{name:'Reddet'}).click();await a.getByText('Bekleyen gönderilmiş isteğin yok.',{exact:true}).waitFor();checks++;
 await search(a,'Player1');await a.locator('#qsSearchResult').getByRole('button',{name:'İstek Gönder'}).click();
 await b.locator('#qsRequests').getByRole('button',{name:'Kabul et'}).click();
 await a.locator('#qsFriends').getByText('Player1',{exact:true}).waitFor();await b.locator('#qsFriends').getByText('Player0',{exact:true}).waitFor();checks++;
 await search(a,'Player1');await a.locator('#qsSearchResult').getByText('Player1 · Arkadaşsınız').waitFor();checks++;
 a.once('dialog',d=>d.accept());await a.locator('#qsFriends').getByRole('button',{name:'Arkadaşlıktan çıkar'}).click();
 await b.locator('#qsFriends').getByText('Henüz arkadaşın yok.').waitFor();checks++;
 await search(a,'Player1');await a.locator('#qsSearchResult').getByRole('button',{name:'İstek Gönder'}).click();await b.locator('#qsRequests').getByRole('button',{name:'Kabul et'}).click();await a.locator('#qsFriends').getByText('Player1',{exact:true}).waitFor();checks++;
 await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'social-mobile.png'),fullPage:true});
 await Promise.all(pages.map(p=>p.evaluate(()=>openV9Page('games'))));
 await a.locator('#vPartyCapacity').selectOption('5');await a.locator('#v14HostName').fill('Player0');await a.locator('#v14CreateBtn').click();
 await a.locator('.v14-code').waitFor();const roomCode=await a.locator('.v14-code').textContent();
 for(let i=1;i<5;i++){
  await pages[i].locator('#v14GuestName').fill('Player'+i);await pages[i].locator('#v14RoomCode').fill(roomCode);await pages[i].locator('#v14JoinBtn').click();await pages[i].locator('.v14-code').waitFor();
 }
 await a.getByText('5 / 5 oyuncu · En az 2 kişiyle başlayabilirsiniz.').waitFor();checks++;
 await pages[5].locator('#v14RoomCode').fill(roomCode);await pages[5].locator('#v14JoinBtn').click();await pages[5].waitForFunction(()=>document.getElementById('v11Toast').textContent.includes('Oda dolu'));checks++;
 await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'party-lobby-mobile.png'),fullPage:true});
 await a.getByRole('button',{name:'▶️ 5 Kişiyle Başlat'}).click();
 for(let question=0;question<10;question++){
  for(let i=0;i<5;i++){
   const p=pages[i];await p.locator('#v14ArenaContent').getByText(new RegExp('Soru '+(question+1)+' / 10')).waitFor();
   await p.locator('.v14-answers button').first().click();await p.getByRole('button',{name:'✔️ Cevabı Onayla'}).click();
  }
  await a.getByRole('button',{name:question===9?'🏁 Sonuçları Göster':'Sonraki Soru →'}).click();
 }
 await a.locator('#v14ArenaContent h2').filter({hasText:/Kazanan|Berabere/}).waitFor();checks++;
 await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'party-results-mobile.png'),fullPage:true});
 assert.equal(await a.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile layout overflow');checks++;
 await a.evaluate(()=>v14Leave());await b.evaluate(()=>v14Leave());
 await a.locator('#vPartyCapacity').selectOption('2');await a.locator('#v17Mode').selectOption('timed');await a.locator('#v17Time').selectOption('10');await a.locator('#v14CreateBtn').click();await a.locator('.v14-code').waitFor();
 const timedCode=await a.locator('.v14-code').textContent();await b.locator('#v14RoomCode').fill(timedCode);await b.locator('#v14JoinBtn').click();await a.getByRole('button',{name:'▶️ 2 Kişiyle Başlat'}).click();
 await a.getByRole('button',{name:'Sonraki Soru →'}).waitFor({timeout:20000});await b.getByText(/Süren doldu/).waitFor();checks++;
 await b.context().close();await a.getByText('Player1: 0 · Ayrıldı').waitFor();checks++;
 await a.getByRole('button',{name:'Sonraki Soru →'}).click();await a.getByText(/Soru 2 \/ 10/).waitFor();checks++;
 await a.evaluate(()=>v14Leave());await a.locator('#v17Mode').selectOption('normal');await a.locator('#v14CreateBtn').click();await a.locator('.v14-code').waitFor();
 const finalCode=await a.locator('.v14-code').textContent(),c=pages[2];await c.evaluate(()=>v14Leave());await c.locator('#v14RoomCode').fill(finalCode);await c.locator('#v14JoinBtn').click();await c.locator('.v14-code').waitFor();
 await a.getByRole('button',{name:'▶️ 2 Kişiyle Başlat'}).click();await a.getByText(/Soru 1 \/ 10/).waitFor();await a.evaluate(()=>v14Leave());await c.getByText('Oda kapatıldı',{exact:true}).waitFor();checks++;
 assert.deepEqual(errors,[],'browser runtime errors');checks++;
 console.log(checks+' browser flows passed: five-player full match, social lifecycle, timed two-player mode, disconnect and host departure.');
}
main().catch(e=>{console.error(e);console.error('Page errors:',errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});

