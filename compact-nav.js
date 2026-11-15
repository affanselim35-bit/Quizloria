/* Reuse the existing links and access controls; no duplicate destinations. */
(function(){
'use strict';
const nav=document.querySelector('.v9-nav');if(!nav)return;
const links=[...nav.querySelectorAll('a')],extras=links.filter(a=>!['home','tests'].includes(a.dataset.view));
const button=document.createElement('button');button.type='button';button.className='q-nav-toggle';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','qNavMore');button.textContent='☰ Menü';
const panel=document.createElement('div');panel.id='qNavMore';panel.className='q-nav-panel';panel.hidden=true;panel.setAttribute('aria-label','Diğer site bölümleri');nav.append(button,panel);nav.classList.add('q-nav-ready');
const badge=document.createElement('span');badge.className='q-nav-badge';badge.hidden=true;badge.setAttribute('aria-hidden','true');button.append(badge);
const duelBadge=document.getElementById('qsDuelNavBadge');
const small=matchMedia('(max-width:760px)');
function close(restore=false){panel.hidden=true;button.setAttribute('aria-expanded','false');if(restore)button.focus({preventScroll:true})}
function current(){const selected=panel.querySelector('[aria-current="page"]');button.classList.toggle('q-nav-current',!!selected);const pending=!!duelBadge?.textContent.trim();badge.hidden=!pending;button.setAttribute('aria-label',(selected?'Menü, geçerli bölüm: '+selected.textContent.trim():'Diğer site bölümleri menüsü')+(pending?', yeni düello daveti var':''))}
function layout(){const focused=document.activeElement;close(false);for(const link of extras)panel.append(link);if(!small.matches)for(const view of ['games','profile']){const link=links.find(a=>a.dataset.view===view);if(link)nav.insertBefore(link,button)}if(panel.contains(focused))button.focus({preventScroll:true});current()}
button.addEventListener('click',()=>{const opening=panel.hidden;panel.hidden=!opening;button.setAttribute('aria-expanded',String(opening))});
nav.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close(true)}});
panel.addEventListener('click',event=>{if(event.target.closest('a')){const restore=panel.contains(document.activeElement);close(restore)}});
document.addEventListener('click',event=>{if(!panel.hidden&&!nav.contains(event.target))close(false)});
document.addEventListener('focusin',event=>{if(!panel.hidden&&!nav.contains(event.target))close(false)});
new MutationObserver(current).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current']});
if(duelBadge)new MutationObserver(current).observe(duelBadge,{childList:true,characterData:true,subtree:true});
small.addEventListener('change',layout);layout();
})();
