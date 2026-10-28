/* Online rooms: fixed seats make concurrent joins safe and cap the room at five. */
(function(){
'use strict';
const $=id=>document.getElementById(id),slots=['0','1','2','3','4'];
let db,auth,session=null,room=null,ref=null,listener=null,presence=null,timer=null,offset=0,choice=null,busy=false,last=-1,timedOut=false,joining=false;
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const button=(text,fn,disabled=false)=>{const b=el('button',text);b.type='button';b.onclick=fn;b.disabled=disabled;return b};
function error(e){v11Toast('⚠️ '+(e?.message||String(e)).slice(0,180));console.warn('Quizloria oda:',e)}
function members(r=room){return Object.entries(r?.players||{}).filter(([,p])=>p?.uid).map(([slot,p])=>({...p,slot}))}
function active(r=room){return members(r).filter(p=>!p.left)}
function complete(r=room){const a=r?.answers?.[r.index]||{};return members(r).every(p=>p.left||Number.isInteger(a[p.uid]))}
function setBusy(v){joining=v;$('v14CreateBtn').disabled=v;$('v14JoinBtn').disabled=v}
async function init(){
 if(!window.firebase)throw Error('Firebase yüklenemedi. Sayfayı yenile.');
 const app=firebase.apps.length?firebase.app():firebase.initializeApp(QUIZORA_FIREBASE_CONFIG);db=app.database();auth=app.auth();
 if(!auth.currentUser)await auth.signInAnonymously();
 offset=(await db.ref('.info/serverTimeOffset').once('value')).val()||0;
}
function name(id){return ($(id).value.trim()||auth.currentUser.displayName||'Oyuncu').slice(0,24)}
function code(){const a=new Uint32Array(1);crypto.getRandomValues(a);return String(100000+a[0]%900000)}
async function leaveCurrent(){
 if(!session)return;
 const oldRef=ref,oldSession=session,oldRoom=room;
 try{
  if(oldSession.role==='host'&&oldRoom&&['waiting','playing'].includes(oldRoom.status))await oldRef.child('status').set('cancelled');
  else if(oldSession.role!=='host'&&oldRoom&&['waiting','playing'].includes(oldRoom.status)){
   if(oldRoom.status==='waiting'){
    try{await oldRef.child('players/'+oldSession.slot).remove()}
    catch(e){await oldRef.child('players/'+oldSession.slot+'/left').set(true)}
   }else await oldRef.child('players/'+oldSession.slot+'/left').set(true);
  }
 }finally{detach()}
}
function detach(){
 if(timer)clearInterval(timer);timer=null;
 if(ref&&listener)ref.off('value',listener);
 if(presence){presence.cancel().catch(()=>{});presence=null}
 ref=null;listener=null;session=null;room=null;choice=null;last=-1;timedOut=false;
}
async function connect(roomRef,roomCode,role,slot){
 detach();ref=roomRef;session={code:roomCode,uid:auth.currentUser.uid,role,slot};
 presence=role==='host'?ref.child('status').onDisconnect():ref.child('players/'+slot+'/left').onDisconnect();
 try{await presence.set(role==='host'?'cancelled':true)}catch(e){detach();throw e}
 showSection('v14OnlineScreen');
 listener=ref.on('value',s=>{
  if(ref!==roomRef)return;room=s.val();
  if(room&&room.index!==last){last=room.index;choice=null;timedOut=false}
  render();tick();
 },e=>{error(e);detach();openV9Page('games')});
 timer=setInterval(tick,250);
}
window.v14CreateRoom=async function(){
 if(joining)return;setBusy(true);
 try{
  await init();await leaveCurrent();
  const uid=auth.currentUser.uid,playerName=name('v14HostName');
  const test=$('v17Test').value,mode=$('v17Mode').value,seconds=mode==='timed'?Number($('v17Time').value):0,maxPlayers=Number($('vPartyCapacity').value);
  const bank=test==='mixed'?buildMixedV8():getQuestionBank(test),list=[...bank];
  for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}
  if(list.length<10)throw Error('Bu testte en az 10 soru olmalı.');
  const questions=list.slice(0,10).map(q=>({q:q.q,a:q.a,correct:q.correct}));
  for(let attempt=0;attempt<6;attempt++){
   const roomCode=code(),roomRef=db.ref('partyRooms/'+roomCode);
   try{await roomRef.set({hostUid:uid,status:'waiting',createdAt:firebase.database.ServerValue.TIMESTAMP,index:0,maxPlayers,players:{0:{uid,name:playerName}},questions,test,mode,seconds})}
   catch(e){if(e.code==='PERMISSION_DENIED')continue;throw e}
   await connect(roomRef,roomCode,'host','0');return;
  }
  throw Error('Oda oluşturulamadı. Sayfayı yenileyip tekrar dene.');
 }catch(e){error(e)}finally{setBusy(false)}
};
window.v14JoinRoom=async function(){
 if(joining)return;setBusy(true);
 try{
  await init();const roomCode=$('v14RoomCode').value.trim();if(!/^\d{6}$/.test(roomCode))throw Error('Altı haneli oda kodunu yaz.');
  if(session?.code===roomCode){showSection('v14OnlineScreen');return}
  await leaveCurrent();const roomRef=db.ref('partyRooms/'+roomCode),uid=auth.currentUser.uid,playerName=name('v14GuestName');
  let data;
  try{data=(await roomRef.once('value')).val()}catch(e){throw Error('Oda bulunamadı, başlamış veya erişime kapalı. Kodu kontrol et.')}
  if(!data||data.status!=='waiting')throw Error('Bu oda katılıma açık değil.');
  const existing=members(data).find(p=>p.uid===uid);
  if(existing){
   if(existing.left&&uid!==data.hostUid)await roomRef.child('players/'+existing.slot).set({uid,name:playerName});
   await connect(roomRef,roomCode,uid===data.hostUid?'host':'guest',existing.slot);return;
  }
  for(let i=1;i<data.maxPlayers;i++){
   const slot=String(i);if(data.players?.[slot]&&!data.players[slot].left)continue;
   try{
    const result=await roomRef.child('players/'+slot).transaction(old=>old===null||old.left?{uid,name:playerName}:undefined,undefined,false);
    if(result.committed){await connect(roomRef,roomCode,'guest',slot);return}
   }catch(e){if(e.code!=='PERMISSION_DENIED')throw e}
  }
  throw Error('Oda dolu veya oyun başladı. En fazla '+data.maxPlayers+' kişi katılabilir.');
 }catch(e){error(e)}finally{setBusy(false)}
};
window.v14Leave=async function(){try{await leaveCurrent();openV9Page('games')}catch(e){error(e);openV9Page('games')}};
async function start(){
 if(!room||!session||session.role!=='host'||active().length<2)return;
 try{await ref.update({status:'playing',questionStartedAt:firebase.database.ServerValue.TIMESTAMP})}catch(e){error(e)}
}
async function submit(value){
 if(!room||room.status!=='playing'||!session||busy)return;
 const index=room.index,uid=session.uid;if(Number.isInteger(room.answers?.[index]?.[uid]))return;
 busy=true;render();
 try{await ref.child('answers/'+index+'/'+uid).transaction(old=>old===null?value:undefined,undefined,false)}
 catch(e){error(e)}finally{busy=false;render()}
}
function tick(){
 if(!room||room.status!=='playing'||room.mode!=='timed'||!session||members().find(p=>p.uid===session.uid)?.left)return;
 const left=Math.max(0,Math.ceil((room.questionStartedAt+room.seconds*1000-Date.now()-offset)/1000));
 const clock=$('v17Clock');if(clock){clock.textContent='⏱️ Kalan süre: '+left+' sn';clock.classList.toggle('danger',left<=5)}
 if(left===0&&!Number.isInteger(room.answers?.[room.index]?.[session.uid])){timedOut=true;if(!busy)submit(-1)}
}
async function next(){
 if(!session||session.role!=='host'||!complete())return;
 try{
  if(room.index===9)await ref.child('status').set('finished');
  else await ref.update({index:room.index+1,questionStartedAt:firebase.database.ServerValue.TIMESTAMP});
 }catch(e){error(e)}
}
function render(){
 const box=$('v14ArenaContent');box.replaceChildren();if(!session)return;
 if(!room){box.append(el('h2','Oda artık bulunamıyor.'));return}
 const people=members(),live=active(),mine=people.find(p=>p.uid===session.uid);
 if(room.status==='cancelled'){box.append(el('h2','Oda kapatıldı'),el('p','Oda sahibi ayrıldığı için oyun sona erdi.'),button('Yeni oda oluştur',()=>v14Leave()));return}
 if(mine?.left){box.append(el('h2','Bu odadan ayrıldın.'),button('Oyun modlarına dön',()=>v14Leave()));return}
 box.append(el('p','🧠 '+(room.test==='mixed'?'Rastgele karışık':(quizNames[room.test]||room.test))+' · '+(room.mode==='timed'?'⏱️ '+room.seconds+' sn':'🌿 Normal'),'v17-pill'));
 if(room.status==='waiting'){
  box.append(el('h2','🏠 Oda hazır!'),el('p','Oda kodu:'),el('div',session.code,'v14-code'));
  box.append(button('📋 Oda Kodunu Kopyala',async()=>{try{await navigator.clipboard.writeText(session.code);v11Toast('Oda kodu kopyalandı!')}catch(e){v11Toast('Oda kodunu elle paylaşabilirsin.')}}));
  box.append(el('p',live.length+' / '+room.maxPlayers+' oyuncu · En az 2 kişiyle başlayabilirsiniz.','v14-wait'));
  people.forEach(p=>box.append(el('p',(p.slot==='0'?'👑 ':'🟢 ')+p.name+(p.left?' · Ayrıldı':''))));
  if(session.role==='host')box.append(button('▶️ '+live.length+' Kişiyle Başlat',start,live.length<2));
  else box.append(el('p','Oda sahibinin başlatması bekleniyor.'));
  return;
 }
 const questions=room.questions||[],index=room.index,answers=room.answers?.[index]||{};
 const scores=people.map(p=>({...p,score:questions.reduce((n,q,i)=>n+(room.answers?.[i]?.[p.uid]===q.correct?1:0),0)})).sort((a,b)=>b.score-a.score||Number(a.slot)-Number(b.slot));
 const scoreboard=el('div',undefined,'v14-score');scores.forEach(p=>scoreboard.append(el('span',p.name+': '+p.score+(p.left?' · Ayrıldı':''))));box.append(scoreboard);
 if(room.status==='finished'){
  const eligible=scores.filter(p=>!p.left),best=eligible[0]?.score;
  const winners=eligible.filter(p=>p.score===best);
  box.append(el('h2',winners.length>1?'🤝 Berabere: '+winners.map(p=>p.name).join(', '):'🏆 Kazanan: '+(winners[0]?.name||scores[0].name)));
  scores.forEach((p,i)=>box.append(el('p',(i+1)+'. '+p.name+' · '+p.score+' / 10 doğru'+(p.left?' · Ayrıldı':''))));return;
 }
 const q=questions[index];if(!q)return;
 const own=answers[session.uid],done=Number.isInteger(own),allDone=complete(),answered=people.filter(p=>p.left||Number.isInteger(answers[p.uid])).length;
 box.append(el('p','Soru '+(index+1)+' / 10 · '+answered+' / '+people.length+' oyuncu tamamladı'),el('h2',q.q));
 if(room.mode==='timed'){const clock=el('div','','v17-clock');clock.id='v17Clock';box.append(clock)}
 const options=el('div',undefined,'v14-answers');
 q.a.forEach((label,i)=>{
  const b=button(label,()=>{choice=i;render();tick()},done||busy||timedOut);
  if((done&&own===i)||(!done&&choice===i))b.classList.add('v14-picked');
  if(allDone&&i===q.correct)b.classList.add('v14-right');
  if(allDone&&own===i&&own!==q.correct)b.classList.add('v14-wrong');options.append(b);
 });box.append(options);
 if(!done)box.append(button(timedOut?'⌛ Süre doldu':'✔️ Cevabı Onayla',()=>submit(choice),choice===null||busy||timedOut));
 if(done&&!allDone)box.append(el('p','⏳ Cevabın kaydedildi. Diğer oyuncular bekleniyor...','v14-feedback'));
 if(allDone){box.append(el('p',(own===-1?'⌛ Süren doldu.':own===q.correct?'✅ Doğru cevap!':'❌ Yanlış cevap!')+' Doğru cevap: '+q.a[q.correct],'v14-feedback'));
  box.append(session.role==='host'?button(index===9?'🏁 Sonuçları Göster':'Sonraki Soru →',next):el('p','Oda sahibinin devam etmesi bekleniyor.'));
 }
}
authChange();
function authChange(){window.addEventListener('load',()=>{if(window.firebase&&firebase.apps.length)firebase.auth().onAuthStateChanged(u=>{if(session&&u?.uid!==session.uid){detach();openV9Page('games')}})})}
})();

