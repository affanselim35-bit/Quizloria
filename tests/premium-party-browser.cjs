// Local Auth + RTDB emulators and a fake ad SDK only. Never processes a payment.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');let server,browser,checks=0;const errors=[];
const stamp={'.sv':'timestamp'},fixture={title:'Premium Fixture',questions:Array.from({length:5},(_,i)=>({q:'Protected fixture question '+i,a:['First','Second','Third','Fourth'],correct:0,explanation:'Fixture explanation.'}))};
async function admin(method,key,value){const r=await fetch('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb',{method,headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:value===undefined?undefined:JSON.stringify(value)});assert.equal(r.ok,true);return r.json()}
const fakeAds=`window.__adPushes=0;window.adsbygoogle={loaded:true,push:function(){const s=document.querySelector('ins.adsbygoogle:not([data-adsbygoogle-status])');if(!s||s.getBoundingClientRect().width<=0)throw Error('Hidden ad request');window.__adPushes++;s.dataset.adsbygoogleStatus='done';s.dataset.adStatus='filled';}};`;
async function main(){
 await admin('PUT','',null);await admin('PATCH','',{premiumCatalog:{fixture:{title:fixture.title,description:'Test fixture only',count:5}},premiumTests:{fixture}});
 server=http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname.startsWith('/sdk/')){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(process.env.QUIZLORIA_SDK_DIR,path.basename(pathname))));return}
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','party.js','social.js','psychology.js','membership.js','premium.js','discovery.js','premium-stories.js','research-tests.js','persona-results.js','home-ad.js','favicon.svg'].includes(name)){res.writeHead(404);res.end();return}
  let content=fs.readFileSync(path.join(root,name),'utf8');if(name==='index.html')content=content.replaceAll('https://www.gstatic.com/firebasejs/10.14.1/','/sdk/').replace('</head>',`<script>document.addEventListener('DOMContentLoaded',()=>{const app=firebase.initializeApp({apiKey:'demo-key',projectId:'demo-quizloria',authDomain:'demo-quizloria.firebaseapp.com',databaseURL:'https://demo-quizloria-default-rtdb.firebaseio.com'});app.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});app.database().useEmulator('127.0.0.1',9000);});</script></head>`);
  res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(content);
 }catch(e){res.writeHead(500);res.end(e.message)}});
 await new Promise(r=>server.listen(8093,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.QUIZLORIA_BROWSER?{executablePath:process.env.QUIZLORIA_BROWSER}:{})});
 async function account(name,width=1280){
  const p=await browser.newPage({viewport:{width,height:900}}),stats={loads:0};p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname==='pagead2.googlesyndication.com'){stats.loads++;return route.fulfill({contentType:'application/javascript',body:fakeAds})}return route.abort()});
  await p.goto('http://127.0.0.1:8093/');const uid=await p.evaluate(async name=>{const c=await firebase.auth().createUserWithEmailAndPassword(name+Date.now()+'@example.test','LocalTest123!');await c.user.updateProfile({displayName:name});await qSocialSave();return c.user.uid},name);
  await p.waitForFunction(uid=>quizloriaMembership.ready&&quizloriaMembership.uid===uid,uid);return {p,uid,stats};
 }
 const alice=await account('Alice',390),bob=await account('Bob'),eve=await account('Eve');const a=alice.p,b=bob.p;
 await b.evaluate(()=>openV9Page('home'));assert.equal(await b.locator('#qPremiumHome').isVisible(),true);await b.evaluate(()=>openV9Page('profile'));assert.equal(await b.locator('#qPremiumProfile').isVisible(),true);await b.evaluate(()=>openV9Page('tests'));await b.locator('.q-premium-card[data-test="premium:fixture"]').waitFor();assert.equal(await b.locator('.q-premium-card[data-test="premium:fixture"] .q-premium-badge').textContent(),'👑 PREMIUM’A ÖZEL');await b.locator('.q-premium-card[data-test="premium:fixture"]').getByRole('button',{name:'🔒 Premium’u keşfet'}).click();assert.equal(await b.locator('#qPremiumBuy').isDisabled(),true);checks++;
 assert.equal(await b.evaluate(async()=>{try{await firebase.database().ref('premiumTests/fixture').once('value');return false}catch(e){return e.code==='PERMISSION_DENIED'}}),true);checks++;
 await b.evaluate(()=>localStorage.setItem('premium','true'));assert.equal(await b.evaluate(()=>quizloriaMembership.active),false);checks++;
 await b.evaluate(async()=>{quizloriaMembership.active=true;await qPremiumStart('fixture');quizloriaMembership.active=false;window.dispatchEvent(new Event('quizloria:membership'))});assert.equal(await b.evaluate(()=>activeQuiz.startsWith('premium:')),false);checks++;
 const grant=expires=>admin('PUT','memberships/'+alice.uid,{plan:'premium',expiresAt:expires,updatedAt:stamp});
 await grant(Date.now()+3600000);await a.waitForFunction(()=>quizloriaMembership.active);alice.stats.loads=0;await a.reload();await a.waitForFunction(()=>quizloriaMembership.ready&&quizloriaMembership.active);await a.evaluate(()=>openV9Page('tests'));await a.locator('.q-premium-card[data-test="premium:fixture"]').getByRole('button',{name:'Teste başla →'}).waitFor();assert.equal(alice.stats.loads,0);checks++;
 assert.equal(await a.locator('#qHomeAd').isVisible(),false);assert.equal(await a.locator('#qResultAd').isVisible(),false);checks++;
 await a.locator('.q-premium-card[data-test="premium:fixture"]').getByRole('button',{name:'Teste başla →'}).click();await a.locator('#question').getByText('Protected fixture question 0',{exact:true}).waitFor();
 for(let i=0;i<5;i++){await a.locator('#answers button').first().click();assert.equal(await a.evaluate(()=>localStorage.getItem(V11_PROGRESS)),null);await a.locator('#nextQuestion').click();await a.locator('#nextQuestion').click()}
 await a.locator('#resultTitle').getByText('Premium Fixture',{exact:true}).waitFor();assert.equal(await a.locator('#qResultAd').isVisible(),false);assert.equal(alice.stats.loads,0);checks++;
 assert.equal(await a.evaluate(()=>Object.values(localStorage).some(v=>String(v).includes('Protected fixture question'))),false);checks++;
 await a.evaluate(()=>qPremiumStart('fixture'));await a.locator('#question').getByText('Protected fixture question 0',{exact:true}).waitFor();await grant(Date.now()+1200);
 await a.waitForFunction(()=>quizloriaMembership.ready&&!quizloriaMembership.active);assert.equal(await a.evaluate(()=>activeQuestionList.length+v6WrongQuestions.length),0);assert.equal(await a.locator('#question').textContent(),'');assert.equal(await a.locator('#quiz').isVisible(),false);checks++;
 await grant(Date.now()+3600000);await a.waitForFunction(()=>quizloriaMembership.active);
 // Social invitation, decline, acceptance and rematch for two authenticated accounts.
 await admin('PATCH','',{['socialFriends/'+alice.uid+'/'+bob.uid]:{name:'Bob'},['socialFriends/'+bob.uid+'/'+alice.uid]:{name:'Alice'}});
 await a.evaluate(()=>openV9Page('social'));await b.evaluate(()=>openV9Page('social'));await a.locator('#qsFriends').getByRole('button',{name:'Düelloya davet et'}).waitFor();
 await a.evaluate(()=>document.getElementById('vPartyCapacity').value='2');await a.locator('#qsFriends').getByRole('button',{name:'Düelloya davet et'}).click();await a.locator('.v14-code').waitFor();const first=await a.locator('.v14-code').textContent();
 await b.locator('#qsDuelInvites').getByText(/Alice/).waitFor();assert.ok((await b.locator('#qsDuelNavBadge').textContent()).includes('1'));checks++;
 await b.locator('#qsDuelInvites').getByRole('button',{name:'Reddet'}).click();await b.locator('#qsDuelInvites').getByText('Bekleyen düello davetin yok.').waitFor();checks++;
 await a.evaluate(uid=>qPartyInviteFriend(uid),bob.uid);await b.locator('#qsDuelInvites').getByRole('button',{name:'Odaya katıl'}).click();await b.locator('.v14-code').waitFor();assert.equal(await b.locator('.v14-code').textContent(),first);checks++;
 assert.equal(await admin('GET','duelInvites/'+bob.uid+'/'+alice.uid),null);checks++;
 const notFriend=await a.evaluate(async uid=>{try{await qPartyInviteFriend(uid);return false}catch(e){return e.message.includes('arkadaş')}},eve.uid);assert.equal(notFriend,true);checks++;
 const old=await admin('GET','partyRooms/'+first);
 await a.getByRole('button',{name:'▶️ 2 Kişiyle Başlat'}).click();
 for(let i=0;i<10;i++){
  for(const p of [a,b]){await p.locator('#v14ArenaContent').getByText(new RegExp('Soru '+(i+1)+' / 10')).waitFor();await p.locator('.v14-answers button').first().click();await p.getByRole('button',{name:'✔️ Cevabı Onayla'}).click()}
  await a.getByRole('button',{name:i===9?'🏁 Sonuçları Göster':'Sonraki Soru →'}).click();
 }
 await a.getByRole('button',{name:'🔄 Rövanş Oluştur'}).click();await a.locator('.v14-code').waitFor();const second=await a.locator('.v14-code').textContent();assert.notEqual(second,first);checks++;
 await b.getByRole('button',{name:'🔄 Rövanşa Katıl'}).click();await b.locator('.v14-code').waitFor();assert.equal(await b.locator('.v14-code').textContent(),second);checks++;
 const next=await admin('GET','partyRooms/'+second);assert.equal(next.previousRoom,first);assert.equal(next.maxPlayers,2);assert.equal(next.status,'waiting');assert.equal(next.index,0);assert.equal(next.answers,undefined);assert.notDeepEqual(next.questions.map(q=>q.q),old.questions.map(q=>q.q));checks++;
 assert.equal(await a.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;
 await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'premium-party-mobile.png'),fullPage:true,animations:'disabled'});
 await a.evaluate(()=>v14Leave());await b.getByText('Oda kapatıldı',{exact:true}).waitFor();checks++;
 await a.evaluate(()=>{openV9Page('tests');document.getElementById('testSearch').value='Premium';filterTests()});await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'premium-mobile.png'),fullPage:true,animations:'disabled'});
 await a.evaluate(()=>openV9Page('home'));await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'premium-home-mobile.png'),fullPage:true,animations:'disabled'});await a.evaluate(()=>openV9Page('profile'));await a.screenshot({path:path.join(process.env.QUIZLORIA_SCREENSHOTS||root,'premium-profile-mobile.png'),fullPage:true,animations:'disabled'});assert.deepEqual(errors,[]);console.log(checks+' premium/invitation/rematch browser flows passed; no real payments or ads.');
}
main().catch(e=>{console.error(e);console.error(errors);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r))});



