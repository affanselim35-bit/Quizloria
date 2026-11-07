/* Public renderer; story content is read from a protected server path. */
(function(){
'use strict';
const themes=['Analiz ve planlama','Bağ kurma ve destek','Kararlılık ve harekete geçme','Merak ve yaratıcılık'];
let session=null,priorFocus=null;
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b};
function allowed(){const m=window.quizloriaMembership,u=window.firebase?.auth().currentUser;return !!(session&&(m?.accessReady&&m.freeTests?(session.uid===(u?.uid||null)):(m?.ready&&m.active&&u&&m.uid===u.uid&&session.uid===u.uid)))}
function close(){session=null;document.getElementById('qStoryOverlay')?.remove();priorFocus?.focus({preventScroll:true});priorFocus=null}
function rank(story,answers){
 const counts=[0,0,0,0];story.questions.forEach((q,i)=>counts[q.traits[answers[i]]]++);
 const results=story.results.map((r,i)=>({...r,index:i,distance:r.weights.reduce((sum,w,j)=>sum+(counts[j]/answers.length-w/10)**2,0)})).sort((a,b)=>a.distance-b.distance||a.index-b.index);
 return {counts,results};
}
function render(){
 if(!allowed()){close();return}const s=session,root=document.getElementById('qStoryBody');root.replaceChildren();const h=el('h2',s.story.icon+' '+s.story.title);h.tabIndex=-1;root.append(h);
 if(s.stage==='intro'){
  root.append(el('p',(window.quizloriaMembership?.freeTests?'12 senaryo · 8 farklı sonuç':'👑 Premium · 12 senaryo · 8 farklı sonuç'),'q-research-kicker'),el('p',s.story.intro),el('p','Karakter profilleri yaratıcı yorumdur. Bu test eğlence amaçlıdır; bilimsel kişilik ölçümü, tanı veya zekâ değerlendirmesi değildir. Cevapların bu akışta kaydedilmez.','q-research-note'));
  root.append(button('Hikâyeye başla →',()=>{s.stage='questions';render()}));
 }else if(s.stage==='questions'){
  const q=s.story.questions[s.index];root.append(el('p','Senaryo '+(s.index+1)+' / 12','q-research-kicker'),el('h3',q.q,'q-story-question'));
  const choices=el('div',undefined,'q-research-choices');choices.setAttribute('role','group');choices.setAttribute('aria-label',q.q);
  q.a.forEach((answer,i)=>{const b=button('ABCD'[i]+') '+answer,()=>{if(!allowed()){close();return}s.answers[s.index]=i;render()});b.className='q-research-choice q-story-choice';b.setAttribute('aria-pressed',String(s.answers[s.index]===i));choices.append(b)});root.append(choices);
  const actions=el('div',undefined,'q-research-actions');if(s.index>0)actions.append(button('← Önceki senaryo',()=>{s.index--;render()}));
  const next=button(s.index===11?'Karakterimi keşfet →':'Sonraki senaryo →',()=>{if(!Number.isInteger(s.answers[s.index]))return;if(s.index===11)s.stage='result';else s.index++;render()});next.disabled=!Number.isInteger(s.answers[s.index]);actions.append(next);root.append(actions);
 }else{
  if(s.answers.length!==12||s.answers.some(v=>!Number.isInteger(v)||v<0||v>3)){close();return}
  window.qDailyChallenge?.complete('catalog:'+s.id);
  const {counts,results}=rank(s.story,s.answers),winner=results[0],ties=results.filter(r=>Math.abs(r.distance-winner.distance)<1e-9);
  const dominant=counts.map((count,i)=>({count,i})).sort((a,b)=>b.count-a.count||a.i-b.i);
  const hero=el('section',undefined,'q-research-result');hero.append(el('p','HİKÂYENDEKİ KARAKTERİN','q-research-kicker'),el('h3',winner.name,'q-story-result-title'),el('p',winner.description));root.append(hero);
  window.qAddResultCardControls?.(hero,{kind:'character',test:s.story.title,result:winner.name,summary:'Yanıtlarımda '+dominant.filter(x=>x.count>0).slice(0,2).map(x=>themes[x.i].toLocaleLowerCase('tr-TR')).join(' ve ')+' öne çıktı.',tied:ties.length>1});
  root.append(el('h3','Neden bu karakter çıktı?'),el('p','Seçimlerinde '+dominant.filter(x=>x.count>0).slice(0,2).map(x=>themes[x.i].toLocaleLowerCase('tr-TR')).join(' ve ')+' öne çıktı. On iki senaryodaki tercih dağılımın, bu hikâye için hazırladığımız sekiz karakter profiliyle karşılaştırıldı. '+winner.name+' profili bu dağılıma en yakın eşleşmelerden biri oldu.'));
  const contributions=s.story.questions.map((q,i)=>({q:q.q,answer:q.a[s.answers[i]],trait:q.traits[s.answers[i]]}));const selected=contributions.filter(x=>x.trait===dominant[0].i).slice(0,2);const other=contributions.find(x=>x.trait===dominant[1].i);if(other)selected.push(other);while(selected.length<3){const extra=contributions.find(x=>!selected.includes(x));if(!extra)break;selected.push(extra)}
  const evidence=el('ul',undefined,'q-result-evidence');selected.forEach(c=>{const li=el('li');li.append(el('strong',c.q),el('p','“'+c.answer+'” seçimin, '+themes[c.trait].toLocaleLowerCase('tr-TR')+' temasına katkı verdi.'));evidence.append(li)});root.append(evidence);
  const detail=el('details');detail.append(el('summary','Tercih dağılımını ve eşleştirmeyi gör'));
  themes.forEach((theme,i)=>{const row=el('p',theme+': '+counts[i]+' / 12 seçim');detail.append(row)});
  detail.append(el('p','Her seçim anlamına göre bir temaya katkı verir. Seçeneklerin ekrandaki harfi sonucu belirlemez. Dört temanın dağılımı ile editoryal karakter profilleri arasındaki fark karşılaştırılır; en yakın profil seçilir. Sayılar bilimsel puan, doğru cevap sayısı veya benzerlik yüzdesi değildir.'));
  if(ties.length>1)detail.append(el('p','Eşit yakınlıktaki profiller: '+ties.map(r=>r.name).join(', ')+'. Tek bir sonuç açıkça ayrışmadığı için başlıkta sabit liste sırasındaki ilk profil gösteriliyor.'));
  else detail.append(el('p','Diğer yakın profilin: '+results[1].name+'. Bu sonuçlar kesin etiketler değildir; farklı durumlarda farklı tercihlerin olabilir.'));
  root.append(detail,el('p','Bu karakter eşleştirmesi eğlence amaçlıdır. Bir hikâyedeki rol, gerçek hayattaki bütün özelliklerini veya yeteneklerini açıklamaz.','q-research-note'));
  const actions=el('div',undefined,'q-research-actions');actions.append(button('← Cevaplarımı gözden geçir',()=>{s.index=0;s.stage='questions';render()}),button('🔄 Yeniden başla',()=>{s.answers=[];s.index=0;s.stage='intro';render()}),button('Testlere dön',()=>{close();openV9Page('tests')}));root.append(actions);
 }
 h.focus({preventScroll:true});document.getElementById('qStoryOverlay').scrollTop=0;
}
function valid(story){return story&&typeof story.title==='string'&&typeof story.intro==='string'&&typeof story.icon==='string'&&Array.isArray(story.questions)&&story.questions.length===12&&story.questions.every(q=>typeof q.q==='string'&&q.q.length>0&&Array.isArray(q.a)&&q.a.length===4&&q.a.every(a=>typeof a==='string'&&a.length>0)&&new Set(q.a).size===4&&Array.isArray(q.traits)&&q.traits.length===4&&new Set(q.traits).size===4&&q.traits.every(t=>Number.isInteger(t)&&t>=0&&t<4))&&Array.isArray(story.results)&&story.results.length===8&&new Set(story.results.map(r=>r.name)).size===8&&story.results.every(r=>typeof r.name==='string'&&typeof r.description==='string'&&Array.isArray(r.weights)&&r.weights.length===4&&r.weights.every(w=>Number.isInteger(w)&&w>=0&&w<=10)&&r.weights.reduce((a,b)=>a+b,0)===10)}
window.qStoryOpen=function(story,id){const m=window.quizloriaMembership,u=firebase.auth().currentUser;if(!(m?.accessReady&&m.freeTests)&&(!m?.ready||!m.active||!u||m.uid!==u.uid))throw Error('Test erişimi gerekiyor.');if(!valid(story))throw Error('Hikâye testi şu anda açılamıyor.');if(session)close();priorFocus=document.activeElement;stopV6Timer();openV9Page('tests');session={story,id,uid:u?.uid||null,index:0,answers:[],stage:'intro'};const overlay=el('div');overlay.id='qStoryOverlay';const panel=el('div',undefined,'q-research-panel');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',story.title);const exit=button('✕ Kapat',close);exit.className='q-research-close';const body=el('div');body.id='qStoryBody';panel.append(exit,body);overlay.append(panel);document.body.append(overlay);render()};
window.addEventListener('quizloria:membership',()=>{if(session&&!allowed()){close();v11Toast(window.quizloriaMembership?.freeTests?'Hesabın değiştiği için test kapatıldı.':'Premium erişimin sona erdi veya hesabın değişti.')}});
document.addEventListener('keydown',e=>{if(!session)return;if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab'){const items=[...document.querySelectorAll('#qStoryOverlay button:not(:disabled),#qStoryOverlay summary')].filter(x=>x.getClientRects().length);if(e.shiftKey&&(document.activeElement===items[0]||document.activeElement.tagName==='H2')){e.preventDefault();items.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus()}}});
})();
