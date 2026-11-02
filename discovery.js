/* Types are separate from topics. Every test stays in the common catalog. */
(function(){
'use strict';
const $=id=>document.getElementById(id),cards=()=>[...document.querySelectorAll('#testGrid .card')];
const kinds={knowledge:'Bilgi yarışmaları',character:'Karakter ve eğlence',personality:'Kendini tanı',research:'Araştırma temelli'};
function resetFields(){selectedTestFilter='all';$('v9Difficulty').value='all';$('testSearch').value='';document.querySelectorAll('.filter-pill').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'))}
function scrollToGrid(){const nav=document.querySelector('.v9-nav'),top=window.scrollY+$('testGrid').getBoundingClientRect().top-(nav?.getBoundingClientRect().height||0)-16;window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
window.qChooseTestKind=function(kind){selectedTestKind=Object.hasOwn(kinds,kind)?kind:'all';selectedTestCollection='all';resetFields();filterTests();scrollToGrid()};
window.qShowLatestTests=function(){window.qResetTestDiscovery();openV9Page('tests');scrollToGrid()};
window.qResetTestDiscovery=function(){selectedTestKind='all';selectedTestCollection='all';resetFields();filterTests()};
window.qDiscoverySync=function(){
 document.querySelectorAll('[data-test-kind]').forEach(b=>{const active=b.dataset.testKind===selectedTestKind;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});
 const note=$('qDiscoverySelection');if(note)note.textContent=selectedTestKind==='all'?'Tüm test türlerini görüyorsun.':kinds[selectedTestKind]+' türünü görüyorsun.';
 document.querySelectorAll('.filter-pill').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===selectedTestFilter)));
};
window.qDiscoveryRefresh=function(){
 const all=cards();for(const card of all)if(!card.dataset.kind)card.dataset.kind=card.querySelector('button[onclick^="qPersonaStart"]')?'character':card.dataset.category==='personality'?'personality':'knowledge';
 document.querySelectorAll('[data-kind-count]').forEach(el=>{el.textContent=all.filter(c=>c.dataset.kind===el.dataset.kindCount).length+' test'});window.qDiscoverySync();
};
function start(){window.qDiscoveryRefresh();filterTests()}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();

