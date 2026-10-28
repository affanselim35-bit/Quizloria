(function(){
'use strict';
const $=id=>document.getElementById(id);let current=null,watchers=[],requestWatches=[],data={},search=null,searchVersion=0,loading=false;
const db=()=>firebase.database(),user=()=>{const u=firebase.auth().currentUser;return u&&!u.isAnonymous?u:null};
function status(text){$('qsStatus').textContent=text}
const safeName=s=>String(s||'').trim().replace(/\s+/g,' ').slice(0,24);
const keyName=s=>safeName(s).toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü_-]/g,'');
function watch(path,callback,bucket=watchers){const r=db().ref(path),fn=s=>{if(user()?.uid===current)callback(s.val())};r.on('value',fn,e=>status('⚠️ Veriler okunamadı: '+e.message));bucket.push([r,fn])}
function clear(bucket){bucket.splice(0).forEach(([r,fn])=>r.off('value',fn))}
function row(root,text,actions=[]){const line=document.createElement('div');line.className='qs-row';const label=document.createElement('span');label.textContent=text;line.append(label);actions.forEach(([title,action,disabled])=>{const b=document.createElement('button');b.type='button';b.textContent=title;b.disabled=!!disabled||loading;b.onclick=()=>act(action);line.append(b)});root.append(line)}
async function act(action){if(loading)return;loading=true;draw();try{await action()}catch(e){status('⚠️ '+(e.message||e))}finally{loading=false;draw()}}
async function profile(uid){return (await db().ref('socialProfiles/'+uid).once('value')).val()}
async function ensure(u){
 const name=safeName(u.displayName),key=keyName(name);if(name.length<3||key.length<3)throw Error('Hesap kullanıcı adın en az 3 harf olmalı.');
 const old=await profile(u.uid);if(old?.name===name&&old?.key===key)return old;
 const owner=(await db().ref('socialNames/'+key).once('value')).val();if(owner&&owner!==u.uid)throw Error('Bu kullanıcı adı başka bir hesapta kullanılıyor.');
 const updates={['socialNames/'+key]:u.uid,['socialProfiles/'+u.uid]:{name,key}};if(old?.key&&old.key!==key)updates['socialNames/'+old.key]=null;
 await db().ref().update(updates);return {name,key};
}
function redrawSearch(){
 const root=$('qsSearchResult');root.replaceChildren();if(!search)return;const u=user();if(!u)return;
 const {uid,name}=search;if(uid===u.uid){row(root,'Bu senin profilin.');return}
 if(data.friends?.[uid]){row(root,name+' · Arkadaşsınız',[['Arkadaşlıktan çıkar',()=>removeFriend(uid,name)]]);return}
 const outgoing=data.outgoing?.[uid],request=data.sentRequests?.[uid],incoming=data.requests?.[uid];
 if(incoming?.status==='pending'||incoming?.status==='accepted'){row(root,name+' · '+(incoming.status==='pending'?'Sana istek gönderdi':'Kabul tamamlanıyor'),[['Kabul et',()=>accept(uid)],['Reddet',()=>decline(uid)]]);return}
 if(request?.status==='accepted'){row(root,name+' · İsteğin kabul edildi',[['Listeyi yenile',()=>refresh()]]);return}
 if(request?.status==='pending'||outgoing){row(root,name+' · İstek bekliyor',[['İsteği iptal et',()=>cancel(uid)]]);return}
 row(root,name,[['İstek Gönder',()=>send(uid,name)]]);
}
function draw(){
 if(!user())return;
 const requests=$('qsRequests'),sent=$('qsSent'),friends=$('qsFriends'),board=$('qsLeaderboard');[requests,sent,friends,board].forEach(e=>e.replaceChildren());
 const incoming=Object.entries(data.requests||{}).filter(([uid,r])=>r&&!data.friends?.[uid]);
 $('qsBadge').textContent=incoming.length?'('+incoming.length+')':'';
 if(!incoming.length)requests.textContent='Yeni istek yok.';
 incoming.forEach(([uid,r])=>row(requests,r.name+' · '+(r.status==='accepted'?'Kabulü tamamla':'Gelen istek'),[['Kabul et',()=>accept(uid)],['Reddet',()=>decline(uid)]]));
 const outgoing=Object.entries(data.outgoing||{}).filter(([uid])=>!data.friends?.[uid]);
 if(!outgoing.length)sent.textContent='Bekleyen gönderilmiş isteğin yok.';
 outgoing.forEach(([uid,p])=>{const r=data.sentRequests?.[uid];row(sent,p.name+' · '+(r?.status==='accepted'?'Kabul edildi':'Bekliyor'),[['İsteği iptal et',()=>cancel(uid),r?.status==='accepted']])});
 const list=Object.entries(data.friends||{}).filter(([,p])=>p);
 if(!list.length){friends.textContent='Henüz arkadaşın yok.';board.textContent='Önce arkadaş ekle.'}
 list.forEach(([uid,p],i)=>{row(friends,p.name,[['Arkadaşlıktan çıkar',()=>removeFriend(uid,p.name)]]);row(board,(i+1)+'. '+p.name)});
 redrawSearch();
}
function watchOutgoing(outgoing){
 clear(requestWatches);data.outgoing=outgoing||{};data.sentRequests={};draw();
 const uid=current;
 Object.keys(data.outgoing).forEach(recipient=>watch('socialRequests/'+recipient+'/'+uid,r=>{
  data.sentRequests[recipient]=r;draw();
  if(r===null)db().ref('socialSent/'+uid+'/'+recipient).remove().catch(e=>{if(current===uid)status('⚠️ İstek listesi güncellenemedi: '+e.message)});
 },requestWatches));
}
async function send(uid,name){
 const u=user();if(!u)throw Error('İstek göndermek için giriş yap.');
 const mine=await ensure(u),existing=(await db().ref('socialRequests/'+uid+'/'+u.uid).once('value')).val();
 if(existing?.status==='accepted'){status('İsteğin kabul edilmiş. Arkadaş listesinin tamamlanmasını bekle.');return}
 if(data.friends?.[uid]){status('Zaten arkadaşsınız.');return}
 const recipient=await profile(uid);if(!recipient)throw Error('Alıcının profili bulunamadı.');
 await db().ref().update({['socialRequests/'+uid+'/'+u.uid]:{name:mine.name,status:'pending'},['socialSent/'+u.uid+'/'+uid]:{name:recipient.name}});
 status(existing?'Bu kullanıcıya gönderdiğin istek zaten bekliyor.':'✅ '+name+' kullanıcısına arkadaşlık isteği gönderildi.');
}
async function accept(uid){
 const u=user();if(!u)return;
 const mine=await ensure(u),other=await profile(uid);if(!other)throw Error('Bu profil artık bulunamıyor.');
 const request=db().ref('socialRequests/'+u.uid+'/'+uid),value=(await request.once('value')).val();
 if(!value)throw Error('Bu istek iptal edilmiş veya artık bulunmuyor.');
 if(value.status==='pending')await request.child('status').set('accepted');
 await db().ref().update({['socialFriends/'+u.uid+'/'+uid]:{name:other.name},['socialFriends/'+uid+'/'+u.uid]:{name:mine.name},['socialSent/'+uid+'/'+u.uid]:null});
 status('✅ Arkadaşlık isteği kabul edildi.');
}
async function decline(uid){
 const u=user();if(!u)return;
 await db().ref().update({['socialRequests/'+u.uid+'/'+uid]:null,['socialSent/'+uid+'/'+u.uid]:null});status('İstek reddedildi.');
}
async function cancel(uid){
 const u=user();if(!u)return;
 await db().ref().update({['socialRequests/'+uid+'/'+u.uid]:null,['socialSent/'+u.uid+'/'+uid]:null});status('Gönderdiğin istek iptal edildi.');
}
async function removeFriend(uid,name){
 const u=user();if(!u||!confirm(name+' arkadaş listenden çıkarılsın mı?'))return;
 const updates={['socialFriends/'+u.uid+'/'+uid]:null,['socialFriends/'+uid+'/'+u.uid]:null,
  ['socialRequests/'+uid+'/'+u.uid]:null,['socialRequests/'+u.uid+'/'+uid]:null,
  ['socialSent/'+u.uid+'/'+uid]:null,['socialSent/'+uid+'/'+u.uid]:null};
 await db().ref().update(updates);status(name+' arkadaş listenden çıkarıldı.');
}
async function find(){
 const u=user();if(!u){status('Önce giriş yap.');return}
 const version=++searchVersion,key=keyName($('qsSearch').value);search=null;$('qsSearchResult').replaceChildren();if(key.length<3){status('Tam kullanıcı adını yaz.');return}
 try{
  const uid=(await db().ref('socialNames/'+key).once('value')).val(),p=uid?await profile(uid):null;
  if(version!==searchVersion||user()?.uid!==u.uid)return;
  if(!p){$('qsSearchResult').textContent='Kullanıcı bulunamadı.';return}
  if(uid!==u.uid){
   const r=(await db().ref('socialRequests/'+uid+'/'+u.uid).once('value')).val();
   if(version!==searchVersion||user()?.uid!==u.uid)return;
   if(r?.status==='pending'&&!data.outgoing?.[uid])await db().ref('socialSent/'+u.uid+'/'+uid).set({name:p.name});
  }
  search={uid,name:p.name};redrawSearch();status('');
 }catch(e){if(version===searchVersion)status('⚠️ Arama yapılamadı: '+e.message)}
}
async function refresh(){if(!user()){status('Sosyal özellikler için giriş yap.');return}draw();status('Arkadaşlarını kullanıcı adıyla bulabilirsin.')}
window.qSocialFind=find;window.qSocialRefresh=refresh;
window.qSocialSave=()=>act(async()=>{const u=user();if(!u)return;const p=await ensure(u);$('qsMe').textContent='👤 '+p.name;status('Hesap kullanıcı adın eşitlendi.')});
function start(u){
 clear(watchers);clear(requestWatches);current=u&&!u.isAnonymous?u.uid:null;data={};search=null;searchVersion++;
 const logged=!!current;$('qsLoginGate').hidden=logged;document.querySelectorAll('#qSocial .qs-card').forEach((card,i)=>{if(i>0)card.hidden=!logged});
 $('qsNickname').hidden=true;$('qsNickname').nextElementSibling.hidden=!logged;
 if(!logged){$('qsMe').textContent='🔒 Giriş yapmadın';['qsRequests','qsSent','qsFriends','qsLeaderboard','qsSearchResult'].forEach(id=>$(id).replaceChildren());$('qsBadge').textContent='';status('');return}
 ensure(u).then(p=>{if(current===u.uid)$('qsMe').textContent='👤 '+p.name}).catch(e=>{if(current===u.uid)status('⚠️ '+e.message)});
 watch('socialRequests/'+u.uid,r=>{data.requests=r||{};draw()});watch('socialFriends/'+u.uid,r=>{data.friends=r||{};draw()});watch('socialSent/'+u.uid,watchOutgoing);
}
window.addEventListener('load',()=>{if(window.firebase){const app=firebase.apps.length?firebase.app():firebase.initializeApp(QUIZORA_FIREBASE_CONFIG);app.auth().onAuthStateChanged(start)}});
})();

