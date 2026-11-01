/* Request the homepage unit once, only after it has a visible layout. */
(function(){
'use strict';
function init(){
 const container=document.getElementById('qHomeAd'),slot=container?.querySelector('ins.adsbygoogle');if(!slot)return;
 let requested=false,observer;
 function request(){
  if(requested||container.hidden||slot.getBoundingClientRect().width<=0||!container.getClientRects().length)return;
  requested=true;if(observer)observer.disconnect();
  try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}
  catch(e){console.warn('Quizloria reklam alanı yüklenemedi.',e);container.hidden=true}
 }
 const statusObserver=new MutationObserver(()=>{if(slot.getAttribute('data-ad-status')==='unfilled')container.hidden=true});
 statusObserver.observe(slot,{attributes:true,attributeFilter:['data-ad-status']});
 if('IntersectionObserver' in window){
  observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))request()},{rootMargin:'100px 0px'});observer.observe(container);
 }else{
  observer=new MutationObserver(request);observer.observe(document.getElementById('home'),{attributes:true,attributeFilter:['class','style']});observer.observe(container,{attributes:true,attributeFilter:['style']});request();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

