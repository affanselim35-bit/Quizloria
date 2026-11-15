/* Progressive browsing: all ordinary guide links remain available without JS. */
(function(){
'use strict';
const sections=[...document.querySelectorAll('.test-directory')];if(!sections.length)return;
const cards=sections.flatMap(section=>[...section.querySelectorAll('article')].map(card=>({card,section,kind:section.id,text:card.textContent.toLocaleLowerCase('tr-TR')})));
const tools=document.createElement('div');tools.className='q-guide-tools';tools.innerHTML='<label>Test ara<input id="qdSearch" type="search" placeholder="Testin adını yaz…"></label><label>Test türü<select id="qdKind"><option value="all">Tüm türler</option></select></label>';
const search=tools.querySelector('input'),select=tools.querySelector('select');for(const section of sections){const option=document.createElement('option');option.value=section.id;option.textContent=section.querySelector('h2').textContent;select.append(option)}
const status=document.createElement('p');status.className='meta q-guide-count';status.setAttribute('role','status');
const more=document.createElement('div');more.className='q-load-more';const button=document.createElement('button');button.type='button';button.className='button';more.append(button);
const empty=document.createElement('p');empty.className='q-guide-empty';empty.textContent='Uygun test bulunamadı. Başka bir kelime veya tür dene.';
const hero=document.querySelector('.hero');hero.querySelector('.contents')?.setAttribute('hidden','');hero.after(tools,status);sections.at(-1).after(empty,more);
let limit=12;
function render(){const query=search.value.toLocaleLowerCase('tr-TR').trim(),matches=cards.filter(t=>(select.value==='all'||t.kind===select.value)&&t.text.includes(query)),visible=new Set(matches.slice(0,limit).map(t=>t.card));for(const {card}of cards)card.hidden=!visible.has(card);for(const section of sections)section.hidden=![...section.querySelectorAll('article')].some(card=>!card.hidden);status.textContent=matches.length+' testten '+Math.min(limit,matches.length)+' tanesi gösteriliyor';more.hidden=matches.length<=limit;button.textContent='Daha fazla göster ('+Math.min(12,Math.max(0,matches.length-limit))+')';empty.hidden=matches.length!==0}
search.addEventListener('input',()=>{limit=12;render()});select.addEventListener('change',()=>{limit=12;render()});button.addEventListener('click',()=>{limit+=12;render()});
if(sections.some(s=>'#'+s.id===location.hash))select.value=location.hash.slice(1);
render();
})();
