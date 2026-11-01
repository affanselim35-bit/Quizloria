/* Test discovery: kinds are separate from topics; recency follows the published release manifest. */
(function(){
'use strict';
const recentIds=["story-anime-yolculugu","story-buyuculuk-okulu","story-orta-dunya-yolu","story-element-yolculugu","story-galaksi-gorevi","story-animasyon-kahramani","story-animasyon-dostu","story-pokemon-yoldasi","story-mistik-akademi","story-dizi-basrolu","story-gizemli-ada","story-zombi-hikayesi","story-uzay-murettebati","story-korsan-tayfasi","story-ejderha-kralligi","story-gizli-ajan","story-dedektif-romani","story-oyun-sinifi","story-siberpunk-sehir","story-muzik-grubu","story-komedi-dizisi","story-super-guc","story-efsanevi-yaratik","story-masal-kahramani"],recentOrder=new Map(recentIds.map((id,i)=>[id,i]));
const $=id=>document.getElementById(id),cards=()=>[...document.querySelectorAll('#testGrid .card')],bare=id=>id.replace(/^(catalog|premium):/,'');
const kinds={knowledge:'Bilgi yarışmaları',character:'Karakter ve eğlence',personality:'Kendini tanı',research:'Araştırma temelli'};
function resetFields(){selectedTestFilter='all';$('v9Difficulty').value='all';$('testSearch').value='';document.querySelectorAll('.filter-pill').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'))}
function scrollToGrid(){const nav=document.querySelector('.v9-nav'),top=window.scrollY+$('testGrid').getBoundingClientRect().top-(nav?.getBoundingClientRect().height||0)-16;window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
window.qChooseTestKind=function(kind){selectedTestKind=Object.hasOwn(kinds,kind)?kind:'all';selectedTestCollection='all';resetFields();filterTests();scrollToGrid()};
window.qShowLatestTests=function(){selectedTestKind='all';selectedTestCollection='latest';resetFields();openV9Page('tests');filterTests();scrollToGrid()};
window.qResetTestDiscovery=function(){selectedTestKind='all';selectedTestCollection='all';resetFields();filterTests()};
window.qDiscoverySync=function(){
 document.querySelectorAll('[data-test-kind]').forEach(b=>{const active=b.dataset.testKind===selectedTestKind;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});
 const note=$('qDiscoverySelection');if(note)note.textContent=selectedTestCollection==='latest'?'Yeni eklenen testleri görüyorsun.':selectedTestKind==='all'?'Tüm test türlerini görüyorsun.':kinds[selectedTestKind]+' türünü görüyorsun.';
 document.querySelectorAll('.filter-pill').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===selectedTestFilter)));
 const section=$('qNewTests');if(section)section.hidden=section.dataset.available!=='true'||selectedTestKind!=='all'||selectedTestCollection!=='all'||selectedTestFilter!=='all'||$('testSearch').value.trim()!==''||$('v9Difficulty').value!=='all';
};
window.qDiscoveryRefresh=function(){
 const all=cards();for(const card of all){if(!card.dataset.kind)card.dataset.kind=card.querySelector('button[onclick^="qPersonaStart"]')?'character':card.dataset.category==='personality'?'personality':'knowledge';card.dataset.recent=String(recentOrder.has(bare(card.dataset.test||'')))}
 document.querySelectorAll('[data-kind-count]').forEach(el=>{el.textContent=all.filter(c=>c.dataset.kind===el.dataset.kindCount).length+' test'});
 const latest=all.filter(c=>c.dataset.recent==='true').sort((a,b)=>recentOrder.get(bare(a.dataset.test))-recentOrder.get(bare(b.dataset.test)));
 const section=$('qNewTests'),list=$('qNewTestList');if(!section||!list)return;section.dataset.available=String(latest.length>0);section.hidden=latest.length===0;list.replaceChildren();
 latest.slice(0,6).forEach(card=>{const article=document.createElement('article');article.className='q-new-test';const label=document.createElement('span');label.className='q-new-label';label.textContent='✨ YENİ';const title=document.createElement('h3');title.textContent=card.querySelector('h3')?.textContent||'Yeni test';const count=document.createElement('p');count.textContent='12 senaryo · Açıklamalı karakter sonucu';const play=document.createElement('button');play.type='button';play.textContent='Teste başla →';play.setAttribute('aria-label',title.textContent+' testine başla');const id=card.dataset.test;play.disabled=!!card.querySelector('button:not(.favorite-btn)')?.disabled;play.onclick=()=>{const source=cards().find(c=>c.dataset.test===id);source?.querySelector('button:not(.favorite-btn)')?.click()};article.append(label,title,count,play);list.append(article)});
 $('qNewTestsAll').textContent='Tümünü gör ('+latest.length+')';window.qDiscoverySync();
};
function start(){window.qDiscoveryRefresh();filterTests()}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();

