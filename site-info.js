/* Information-page contact links use the existing, account-gated message form. */
(function(){
'use strict';
let resume=false,previousLogged=null;
const $=id=>document.getElementById(id);
const kinds={general:'⭐ Genel değerlendirme',bug:'🐛 Hata bildirimi',idea:'💡 Yeni özellik önerisi',privacy:'🔒 Gizlilik / veri talebi'};
function signedIn(user){return !!user&&!user.isAnonymous}
function sync(user){const logged=signedIn(user);$('feedbackLogin').hidden=logged;if(logged&&resume){resume=false;openFeedback();$('feedbackMessage').focus();$('feedbackStatus').textContent='Mesajını kontrol edip gönderebilirsin.'}else if(previousLogged!==logged&&(typeof q21Sending==='undefined'||!q21Sending)){$('feedbackStatus').textContent=logged?'Mesajını yazıp gönderebilirsin.':'🔒 Mesaj göndermek için Quizloria hesabınla giriş yap.'}previousLogged=logged}
window.qInfoLogin=function(){resume=true;closeFeedback();q19Open('login')};
function init(){
 const request=new URLSearchParams(location.search).get('feedback');
 if(Object.hasOwn(kinds,request)){$('feedbackType').value=kinds[request];openFeedback()}
 if(window.firebase&&firebase.apps.length)firebase.auth().onAuthStateChanged(sync);else sync(null);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Tab'||$('feedbackBackdrop').hidden)return;
  const nodes=[...$('feedbackBackdrop').querySelectorAll('button:not(:disabled),select,textarea,a[href]')].filter(e=>e.getClientRects().length);
  const first=nodes[0],last=nodes.at(-1);if(!first)return;
  if(event.shiftKey&&(document.activeElement===first||!$('feedbackBackdrop').contains(document.activeElement))){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&(document.activeElement===last||!$('feedbackBackdrop').contains(document.activeElement))){event.preventDefault();first.focus()}
 });
}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
})();

