(function(){
'use strict';
const $=id=>document.getElementById(id),core=window.quizloriaMysteryCore;
let db,auth,user=null,offset=0,connected=false,version=0,date='',month='',caseData=null,attempt=null,key=null,selected=null,busy=false,entitlement=null,awards={},watches=[],myName='Dedektif',bonusData=null;
const now=()=>Date.now()+offset,eligible=()=>user&&entitlement&&now()>=entitlement.activeFrom&&now()<entitlement.expiresAt;
function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e}
function button(text,action){const b=node('button',text);b.type='button';b.onclick=action;return b}
function status(text){$('qmStatus').textContent=text}
function watch(path,fn,v){const r=db.ref(path),cb=s=>{if(v===version)fn(s.val())};r.on('value',cb,()=>{if(v===version)status('Bağlantı kurulamadı. Yenile düğmesiyle tekrar deneyebilirsin.')});watches.push([r,cb])}
function detach(){watches.splice(0).forEach(([r,cb])=>r.off('value',cb))}
function controls(){const submit=$('qmSubmit');submit.disabled=busy||!connected||!user||selected===null||!!attempt||!caseData||now()>=caseData.closesAt;$('qmRefresh').disabled=busy;document.querySelectorAll('#qmChoices input').forEach(e=>e.disabled=busy||!!attempt||!user)}
function showResult(){
 if(!key||!attempt)return;const box=$('qmResult');box.replaceChildren();box.hidden=false;
 const correct=attempt.choice===key.correct;box.append(node('h4',correct?'🔎 Dosya çözüldü! +100 puan':'📂 Dosyanın çözümü · 0 puan'),node('p','Senin seçimin: '+caseData.options[attempt.choice]),node('p','Doğru cevap: '+caseData.options[key.correct]),node('p',key.explanation));
 controls();
}
async function claim(v){
 if(!user||!attempt||!key)return;const payload={points:attempt.choice===key.correct?100:0,at:attempt.at,name:myName};
 try{await db.ref('mysteryScores/'+month+'/'+user.uid+'/'+date).transaction(old=>old===null?payload:undefined);if(v===version)status('Cevabın ve puanın kaydedildi. Yeni dosya İstanbul saatiyle 00.00’da açılır.')}
 catch(e){if(v===version)status('Cevabın kaydedildi. Puan eşitlemesi için Yenile’ye bas; ikinci bir cevap vermen gerekmez.')}
}
async function recover(v){
 if(!user)return;const saved=(await db.ref('mysteryAttempts/'+date+'/'+user.uid).once('value')).val();if(v!==version)return;attempt=saved;
 if(attempt){selected=attempt.choice;document.querySelectorAll('#qmChoices input').forEach(e=>e.checked=Number(e.value)===selected);const solution=(await db.ref('mysteryKeys/'+date).once('value')).val();if(v!==version)return;key=solution;showResult();await claim(v)}
}
async function submit(){
 if(busy||!user||selected===null||attempt||!caseData)return;
 const v=version,choice=selected,uid=user.uid;busy=true;controls();status('Cevabın kilitleniyor…');
 try{await db.ref('mysteryAttempts/'+date+'/'+uid).transaction(old=>old===null?{choice,at:firebase.database.ServerValue.TIMESTAMP}:undefined);if(v!==version)return;await recover(v)}
 catch(e){if(v===version)status('Cevap gönderilemedi veya gün kapandı. Yenile’ye basarak kayıt durumunu kontrol et.')}
 finally{if(v===version){busy=false;controls()}}
}
function drawCase(){
 const root=$('qmCase');root.replaceChildren();$('qmResult').hidden=true;$('qmChoices').replaceChildren();
 if(!caseData){root.append(node('p','Bugünün dosyası hazırlanıyor. Bir sonraki dosyayı daha sonra kontrol edebilirsin.'));controls();return}
 root.append(node('h4',caseData.title),node('p',caseData.story));const clues=node('ol');caseData.clues.forEach(c=>clues.append(node('li',c)));root.append(clues);
 caseData.options.forEach((option,i)=>{const label=node('label'),input=document.createElement('input');input.type='radio';input.name='qm-answer';input.value=i;input.onchange=()=>{selected=i;controls()};label.append(input,node('span',option));$('qmChoices').append(label)});
 controls();
}
function drawBoard(scores){
 const root=$('qmBoard');root.replaceChildren();const ranked=core.rank(scores),own=ranked.findIndex(x=>x.uid===user?.uid);
 if(!ranked.length){root.append(node('p','Bu ay henüz kayıtlı bir çözüm yok. İlk dosyayı sen çöz!'));return}
 const list=node('ol');ranked.slice(0,20).forEach((row,i)=>{const li=node('li'),name=node('span',(i+1)+'. '+row.name+(row.uid===user?.uid?' · Sen':''));if(Object.values(awards).some(a=>a.uid===row.uid&&now()>=a.activeFrom&&now()<a.expiresAt))name.prepend(node('span','👑 '));li.append(name,node('strong',row.points+' puan'));list.append(li)});root.append(list);
 if(own>=20)root.append(node('p','Senin sıran: '+(own+1)+' · '+ranked[own].points+' puan'));
}
function drawAwards(){
 const root=$('qmHall');root.replaceChildren();const values=Object.entries(awards||{}).sort(([a],[b])=>b.localeCompare(a));
 if(!values.length)root.append(node('p','İlk şampiyon ay sonunda belli olacak.'));
 values.forEach(([season,a])=>root.append(node('p',season+' · '+(a.uid?'👑 '+a.name+' · '+a.points+' puan':'Bu ay kazanan çıkmadı.'))));
 const active=!!eligible();$('qmRoom').hidden=!active;$('qmProfile').classList.toggle('qm-gold',active);$('qmProfileTitle').textContent=active?'👑 Ayın Baş Dedektifi':'🕵️ Dedektif Kulübün';
 $('qmProfileText').textContent=active?'Gizli Dedektif Odası ve 3 özel dosya '+new Date(entitlement.expiresAt).toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul'})+' tarihine kadar senin.':'Günün Gizemi’ni çöz, aylık sıralamada yarış. Ay birincisi özel dosyalar ve bir aylık unvan kazanır.';
 if(!active){bonusData=null;$('qmBonusList').replaceChildren();$('qmBonusBody').replaceChildren()}
}
async function openBonus(){
 if(!eligible())return;const v=version;
 try{bonusData=(await db.ref('mysteryBonus').once('value')).val();if(v!==version||!eligible())return;
 const list=$('qmBonusList');list.replaceChildren();Object.values(bonusData||{}).forEach(b=>list.append(button('🗝️ '+b.title,()=>playBonus(b))));
 }catch(e){if(v===version)status('Özel dosyalar şu an açılamadı. Ödül süreni veya bağlantını kontrol et.')}
}
function playBonus(b){
 if(!eligible())return;const root=$('qmBonusBody');root.replaceChildren();root.append(node('h4',b.title),node('p',b.story));const clues=node('ol');b.clues.forEach(c=>clues.append(node('li',c)));root.append(clues);const actions=node('div',undefined,'qm-bonus-actions');
 b.options.forEach((choice,i)=>actions.append(button(choice,()=>{if(!eligible())return;actions.replaceChildren(node('p',(i===b.correct?'Doğru! ':'Bu dosyanın cevabı: '+b.options[b.correct]+'. ')+b.explanation))})));root.append(actions,node('small','Özel dosya · Sıralama puanı vermez.'));
}
async function load(){
 const v=++version;detach();date=core.day(now());month=date.slice(0,7);caseData=null;attempt=null;key=null;selected=null;entitlement=null;bonusData=null;busy=true;myName='Dedektif';$('qmChoices').replaceChildren();$('qmCase').replaceChildren();$('qmResult').hidden=true;$('qmLogin').hidden=!!user;drawAwards();controls();status('Dosya ve sıralama yükleniyor…');$('qmDate').textContent=new Date(date+'T12:00:00+03:00').toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul',dateStyle:'long'});$('qmMonth').textContent=month+' · Canlı aylık sıralama';
 watch('mysteryScores/'+month,drawBoard,v);watch('mysteryAwards',value=>{awards=value||{};drawAwards()},v);
 if(user)watch('mysteryEntitlements/'+user.uid,value=>{entitlement=value;drawAwards()},v);
 try{
  const s=await db.ref('mysteryCases/'+date).once('value');if(v!==version)return;caseData=s.val();drawCase();
  status(user?'İpuçlarını incele. Cevabını kilitlediğinde günlük hakkın kullanılır.':'İpuçlarını okuyabilirsin. Sıralamaya katılmak ve cevap vermek için giriş yap.');
  if(user){const name=(await db.ref('socialProfiles/'+user.uid+'/name').once('value')).val()||'Dedektif';if(v!==version)return;myName=name;await recover(v)}
 }catch(e){if(v===version)status('Dosya yüklenemedi. Bağlantını kontrol edip Yenile’ye bas.')}
 finally{if(v===version){busy=false;controls()}}
}
function go(){openV9Page('games');const e=$('qMystery'),nav=document.querySelector('.v9-nav');window.scrollTo({top:scrollY+e.getBoundingClientRect().top-(nav?.offsetHeight||0)-18,behavior:'smooth'})}
function init(){
 const host=node('section');host.id='qMystery';host.setAttribute('aria-labelledby','qmTitle');host.innerHTML=`<style>
 #qMystery,#qmProfile{border:1px solid #8669a9;border-radius:24px;background:linear-gradient(140deg,#211b38,#101522);padding:clamp(18px,4vw,30px);margin:24px 0;color:#f5f0ff;text-align:left}#qMystery h3{font-size:clamp(24px,5vw,32px);margin:8px 0}#qMystery h4{font-size:21px;margin:18px 0 12px}#qMystery p,#qMystery li{line-height:1.7}#qMystery button,#qmProfile button{padding:12px 17px;border:1px solid #ae8bd7;border-radius:12px;color:white;background:#59378b;font:inherit;cursor:pointer}#qMystery button:disabled{opacity:.5;cursor:default}#qMystery [hidden]{display:none!important}#qMystery :focus-visible{outline:3px solid #ffe392;outline-offset:3px}
 #qMystery .qm-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:24px}#qMystery .qm-panel{min-width:0;background:#ffffff06;border:1px solid #ffffff1a;border-radius:18px;padding:18px}#qmChoices{border:0;padding:0;display:grid;gap:10px;margin:20px 0}#qmChoices label{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #80619f;border-radius:12px;cursor:pointer}#qmChoices label:has(input:checked){background:#583575;border-color:#ffe392}#qmChoices input{width:20px;height:20px;accent-color:#c99aff;flex-shrink:0}#qmBoard ol{list-style:none;padding:0;max-height:470px;overflow:auto}#qmBoard li{display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid #ffffff20;padding:10px 0;overflow-wrap:anywhere}#qmBoard strong{white-space:nowrap;color:#f3d888}#qmStatus{min-height:3em}#qmResult{padding:16px;background:#a883ff12;border:1px solid #af88d0;border-radius:14px;margin-top:18px}#qMystery .qm-actions,.qm-bonus-actions,#qmBonusList{display:flex;flex-wrap:wrap;gap:10px}#qMystery .qm-note{font-size:13px;color:#cebfde}#qmRoom{margin-top:24px;padding:18px;border:1px solid #d9b35b;border-radius:18px}#qmProfile.qm-gold{border:2px solid #e1b954;box-shadow:0 0 18px #d9b35b30}#qmRoom small{display:block;margin-top:15px}#qmProfile h3{margin-top:0}@media(max-width:760px){#qMystery .qm-layout{grid-template-columns:1fr}}
 </style><span>🔎 HER GÜN YENİ BİR DOSYA</span><h3 id="qmTitle">Günün Gizemi</h3><p id="qmDate"></p><p>İpuçlarını birleştir, cevabını kilitle, ayın baş dedektifi olmak için yarış.</p>
 <div class="qm-layout"><div class="qm-panel"><div id="qmCase"></div><fieldset id="qmChoices" aria-label="Cevabını seç"></fieldset><div class="qm-actions"><button id="qmSubmit" type="button">Cevabımı kilitle</button><button id="qmLogin" type="button">Giriş yap / kayıt ol</button><button id="qmRefresh" type="button">Yenile</button></div><p id="qmStatus" role="status" aria-live="polite"></p><div id="qmResult" hidden></div></div>
 <aside class="qm-panel"><h4 id="qmMonth">Canlı aylık sıralama</h4><div id="qmBoard" aria-label="Aylık sıralama"></div><p class="qm-note">Doğru çözüm: 100 puan · Yanlış: 0 · Günde 1 cevap hakkı. İstanbul saatiyle 00.00’da yeni gün, ayın 1’inde yeni sezon başlar. Eşit puanda o puana önce ulaşan öndedir; tam eşitlikte sabit sıralama kullanılır.</p></aside></div>
 <details><summary>🏆 Ayın ödülü ve yarışma kuralları</summary><p>Ay birincisi, sonraki ay boyunca 👑 Ayın Baş Dedektifi unvanı, altın profil çerçevesi ve 3 özel dosyalı Gizli Dedektif Odası kazanır. Adı Şampiyonlar Panosu’nda kalır. Özel dosyalar puan vermez. En az bir doğru çözüm gerekir; ödül devredilemez ve parasal değeri yoktur.</p><p class="qm-note">Katıldığında oyun adın ve puanın sıralamada görünür. Cevabın hesap başına tek seferliktir; yanlış cevap da hakkını kullanır. Bu hikâyeler kurgudur. Dosya havuzu 31 hikâyeden oluşur ve sonraki aylarda dönebilir. Ay kapanışında sonuçlar doğrulanır; ödül, kapanış kontrolü tamamlanınca açılır.</p></details>
 <div id="qmRoom" hidden><h4>🗝️ Gizli Dedektif Odası</h4><p>Bu ayın şampiyonuna özel, sıralama dışında üç dosya.</p><button id="qmOpenRoom" type="button">Özel dosyalarımı aç</button><div id="qmBonusList"></div><div id="qmBonusBody"></div></div><h4>🏛️ Şampiyonlar Panosu</h4><div id="qmHall"></div>`;
 const games=$('v9Games');games.insertBefore(host,games.children[2]);
 const profile=node('section');profile.id='qmProfile';profile.innerHTML='<h3 id="qmProfileTitle">🕵️ Dedektif Kulübün</h3><p id="qmProfileText"></p>';$('v9Profile').append(profile);profile.append(button('Günün Gizemi’ne git →',go));
 document.querySelector('.daily-panel')?.append(button('🔎 Günün Gizemi’ni çöz →',go));
 $('qmSubmit').onclick=submit;$('qmRefresh').onclick=()=>{if(!busy)load()};$('qmLogin').onclick=()=>q19Open('login');$('qmOpenRoom').onclick=openBonus;
 try{const app=firebase.apps.length?firebase.app():firebase.initializeApp(QUIZORA_FIREBASE_CONFIG);db=app.database();auth=app.auth();db.ref('.info/connected').on('value',s=>{connected=s.val()===true;controls();if(!connected&&busy)status('Bağlantı bekleniyor. Cevabın gönderildiyse yeniden cevap verme; bağlantı gelince kayıt kontrol edilecek.')});db.ref('.info/serverTimeOffset').on('value',s=>{offset=s.val()||0});auth.onAuthStateChanged(u=>{user=u&&!u.isAnonymous?u:null;load()});setInterval(()=>{if(date!==core.day(now())&&!busy)load();else drawAwards()},60000)}catch(e){status('Gizem sistemi şu anda açılamadı. Sayfayı yenileyebilirsin.')}
}
if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();

