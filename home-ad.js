/* Manual units are initialized once, only on a visible view after the SDK loads. */
(function(){
'use strict';
function init(){
 const units=['qHomeAd','qResultAd'].map(id=>{
  const container=document.getElementById(id),slot=container?.querySelector('ins.adsbygoogle');
  if(!slot)return null;slot.remove();return {container,slot,requested:false,unfilled:false};
 }).filter(Boolean);
 const loader=document.querySelector('script[src*="pagead/js/adsbygoogle.js"]');
 let sdkLoaded=!!(window.adsbygoogle&&(window.adsbygoogle.loaded===true||!Array.isArray(window.adsbygoogle)));
 function visibleResult(){return !!document.getElementById('result')?.getClientRects().length||!!document.querySelector('#psyContent .psy-result')?.getClientRects().length}
 function request(unit){
  const {container,slot}=unit,rect=container.getBoundingClientRect();
  if(unit.requested||unit.unfilled||!sdkLoaded||container.hidden||!container.getClientRects().length||rect.width<=0||rect.bottom< -100||rect.top>innerHeight+100)return;
  container.append(slot);
  if(slot.getBoundingClientRect().width<=0){slot.remove();return}
  unit.requested=true;
  try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}
  catch(e){console.warn('Quizloria reklam alanı yüklenemedi.',e);unit.unfilled=true;container.hidden=true}
 }
 function sync(){
  for(const unit of units){
   const hidden=unit.unfilled||(unit.container.id==='qResultAd'&&!visibleResult());
   if(unit.container.hidden!==hidden)unit.container.hidden=hidden;
   request(unit);
  }
 }
 for(const unit of units)new MutationObserver(()=>{if(unit.slot.getAttribute('data-ad-status')==='unfilled'){unit.unfilled=true;unit.container.hidden=true}}).observe(unit.slot,{attributes:true,attributeFilter:['data-ad-status']});
 const viewObserver=new MutationObserver(sync);
 for(const id of ['home','result','psyHub','qHomeAd']){const target=document.getElementById(id);if(target)viewObserver.observe(target,{attributes:true,attributeFilter:['class','style']})}
 const psy=document.getElementById('psyContent');if(psy)viewObserver.observe(psy,{childList:true});
 if('IntersectionObserver' in window){const io=new IntersectionObserver(sync,{rootMargin:'100px 0px'});units.forEach(unit=>io.observe(unit.container))}
 else window.addEventListener('scroll',sync,{passive:true});
 loader?.addEventListener('load',()=>{sdkLoaded=true;sync()},{once:true});
 window.addEventListener('resize',sync,{passive:true});sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


