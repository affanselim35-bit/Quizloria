/* Public guide links and allowlisted deep links. Never submits answers. */
(function(){
'use strict';
const pages=window.qTestPages||[],byId=new Map(pages.map(t=>[t.id,t]));
function refresh(){
 for(const card of document.querySelectorAll('#testGrid .card')){
  let id=card.dataset.test;if(!id){const handler=card.querySelector('button[onclick]')?.getAttribute('onclick')||'';id=handler.match(/startQuiz\('([^']+)'/)?.[1]||(handler.includes('startQuiz()')?'personality':null)}
  const t=byId.get(id)||byId.get('catalog:'+id?.replace(/^premium:/,''));if(!t)continue;
  let link=card.querySelector('.q-test-guide');if(!link){link=document.createElement('a');link.className='q-test-guide';card.append(link)}link.href=t.path;link.textContent='Konusu ve açıklamaları →';link.setAttribute('aria-label',t.title+' hakkında');
  if(t.kind==='knowledge'){const p=card.querySelector('p');if(p)p.textContent=t.description+' '+t.count+' açıklamalı soru.';if(card.dataset.test?.startsWith('q100_')||card.dataset.test==='puzzles'){const h=card.querySelector('h3');if(h)h.textContent=t.title}}
 }
}
let timer,observer;
function start(){
 refresh();const grid=document.getElementById('testGrid');if(grid){observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refresh,30)});observer.observe(grid,{childList:true})}
 const id=new URL(location.href).searchParams.get('quiz');if(!id)return;
 const t=byId.get(id);if(!t){showRouteError('Bu test bağlantısı bulunamadı. Test listesinden başka bir test seçebilirsin.');return}
 openV9Page('tests');
 let attempts=0;
 async function launch(){
  const remote=id.startsWith('catalog:');if(remote&&!window.qPublicTestCatalog?.().ready){if(++attempts<100){setTimeout(launch,150);return}showRouteError('Test listesi yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.');return}
  try{
   if(remote){const key=id.slice(8);if(!window.qPublicTestCatalog().tests.some(x=>x.id===key)){showRouteError('Bu test şu anda kullanılamıyor.');return}await window.qPremiumStart(key)}
   else if(id.startsWith('reflection:'))window.qPsychologyStart(id.slice(11));
   else if(id.startsWith('persona_'))window.qPersonaStart(id);
   else if(id==='closeup')window.qCloseupGame.open();
   else if(id==='earlier')window.qEarlierQuiz.open();
   else {openV9Page('tests');startQuiz(id)}
  }catch{showRouteError('Test açılamadı. Test sayfasına dönüp yeniden deneyebilirsin.')}
 }
 launch();
}
function showRouteError(message){
 const note=document.createElement('aside');note.className='q-route-error';note.setAttribute('role','status');const p=document.createElement('p');p.textContent=message;const a=document.createElement('a');a.href='/testler/';a.textContent='Test listesini aç →';note.append(p,a);(document.querySelector('main')||document.querySelector('.container')||document.body).prepend(note);
}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
window.addEventListener('quizloria:catalog',()=>{clearTimeout(timer);timer=setTimeout(refresh,30)});
})();
