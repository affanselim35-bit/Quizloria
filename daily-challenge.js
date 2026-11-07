/* All-public-test daily rotation. Only day + opaque test id are retained for non-scored completions. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.qDailyChallenge=api;api.init()}})(typeof window==='undefined'?globalThis:window,function(){
'use strict';
const PIN='quizloria_daily_selection_v1',DONE='quizloria_daily_completions_v1';
function day(value=Date.now()){const date=new Date(value);if(!Number.isFinite(date.getTime()))return null;const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const get=type=>parts.find(p=>p.type===type).value;return get('year')+'-'+get('month')+'-'+get('day')}
function canonical(id){return typeof id==='string'&&id.startsWith('premium:')?'catalog:'+id.slice(8):id}
function unique(rows){return [...new Map(rows.filter(r=>r&&typeof r.id==='string'&&r.id.trim()&&typeof r.title==='string'&&r.title.trim()).map(r=>[canonical(r.id),{...r,id:canonical(r.id)}])).values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)}
function choose(rows,today,pin){const pool=unique(rows);if(!pool.length||!/^\d{4}-\d{2}-\d{2}$/.test(today||''))return null;const saved=pin?.day===today&&pool.find(t=>t.id===canonical(pin.id));if(saved)return saved;const ordinal=Math.floor(Date.parse(today+'T00:00:00Z')/86400000);return Number.isFinite(ordinal)?pool[((ordinal%pool.length)+pool.length)%pool.length]:null}
function completed(id,today,marks,history=[]){const key=canonical(id);return !!key&&(marks.some(r=>r?.day===today&&canonical(r.id)===key)||history.some(r=>canonical(r?.type)===key&&(typeof r.date==='string'||typeof r.date==='number')&&day(r.date)===today))}
let selection=null,pin=null,marks=[],writing=true,busy=false,registered=false,latest=null,loaded=false;
const $=id=>document.getElementById(id);
function history(){try{return typeof readTestHistory==='function'?readTestHistory():[]}catch{return []}}
function read(){try{const p=JSON.parse(localStorage.getItem(PIN)||'null');pin=p&&typeof p==='object'?p:null;const m=JSON.parse(localStorage.getItem(DONE)||'[]');marks=Array.isArray(m)?m.filter(r=>r&&typeof r.day==='string'&&typeof r.id==='string').slice(-32):[]}catch{writing=false}}
function legacy(today,rows){let hash=0;for(const ch of today)hash=(hash*31+ch.charCodeAt(0))>>>0;const id=TEST_IDS[hash%TEST_IDS.length];return completed(id,today,[],history())&&rows.some(r=>r.id===id)?{day:today,id}:null}
function pool(){
 if(typeof TEST_IDS==='undefined'||typeof QPERSONAS==='undefined'||!window.qPsychologyTests||!window.qPublicTestCatalog||!window.qCloseupGame?.open)return {ready:false,tests:[]};
 const remote=window.qPublicTestCatalog();if(!remote.ready)return remote;
 const native=TEST_IDS.map(id=>({id,title:quizNames[id]||id,kind:isPersonalityQuiz(id)?'reflection':'knowledge',open:()=>startQuiz(id)}));
 const personas=QPERSONAS.map(t=>({id:t.id,title:t.title,kind:'character',open:()=>{openV9Page('tests');qPersonaStart(t.id)}}));
 const reflection=window.qPsychologyTests.map(t=>({id:'reflection:'+t.id,title:t.title,kind:'reflection',open:()=>window.qPsychologyStart(t.id)}));
 return {ready:true,tests:unique([...native,...personas,...reflection,{id:'closeup',title:'Yakından Bak: Görseli Tahmin Et',kind:'knowledge',open:()=>window.qCloseupGame.open()},...remote.tests.map(t=>({...t,id:'catalog:'+t.id,open:()=>window.qPremiumStart(t.id)}))])};
}
function current(){if(!loaded){loaded=true;read()}latest=pool();if(!latest.ready){selection=null;return null}const today=day();if(!pin||pin.day!==today)pin=legacy(today,latest.tests)||pin;selection=choose(latest.tests,today,pin);if(selection&&(pin?.id!==selection.id||pin?.day!==today)){pin={day:today,id:selection.id};try{localStorage.setItem(PIN,JSON.stringify(pin))}catch{writing=false}}return selection}
function type(){return current()?.id||''}
function isDone(){const item=current();return !!item&&completed(item.id,day(),marks,history())}
function render(){const name=$('dailyName'),status=$('dailyStatus'),button=document.querySelector('#dailyStart');if(!name||!status||!button)return;const item=current();button.disabled=busy||!item;
 if(!item){name.textContent='Günün testi hazırlanıyor…';status.textContent=latest?.error?'Test listesi yüklenemedi. Bağlantını kontrol edip sayfayı yenileyebilirsin.':'Herkese açık test listesi yükleniyor…';return}
 const label={knowledge:'Bilgi yarışması',character:'Karakter ve eğlence',reflection:'Kendini tanı',research:'Araştırma temelli'}[item.kind]||'Test';name.textContent=item.title+' • '+label+' • Bugünün seçimi';status.textContent=isDone()?'✅ Bugünkü meydan okumayı tamamladın!'+(!writing?' Bu oturumda tamamlandı; tarayıcı kaydı kullanılamıyor.':' Yeniden de çözebilirsin.'):'✨ '+latest.tests.length+' herkese açık testten bugünün seçimi. Sonuç ekranına ulaşarak tamamla.';
}
async function start(){if(busy)return;const item=current();if(!item){render();return}busy=true;render();try{await item.open()}catch{if(typeof v11Toast==='function')v11Toast('Test şu anda açılamadı. Lütfen yeniden dene.')}finally{busy=false;render()}}
function complete(id,date=Date.now()){
 const item=current(),today=day();if(!item||canonical(id)!==item.id||day(date)!==today)return false;if(completed(item.id,today,marks,history())){render();return false}
 marks=[...marks.filter(r=>r.day!==today),{day:today,id:item.id}].slice(-32);try{localStorage.setItem(DONE,JSON.stringify(marks))}catch{writing=false}
 render();if(typeof renderV9Missions==='function')renderV9Missions();if(typeof renderV8XP==='function')renderV8XP();return true;
}
function clearCompletions(){marks=[];try{localStorage.removeItem(DONE)}catch{}render()}
function init(){if(typeof document==='undefined'||registered)return;registered=true;function ready(){if(!loaded){loaded=true;read()}render();window.addEventListener('quizloria:catalog',render);window.addEventListener('quizloria:membership',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});window.addEventListener('focus',render);setInterval(render,60000)}if(document.readyState==='complete')ready();else window.addEventListener('load',ready,{once:true})}
return {day,canonical,unique,choose,completed,type,isDone,render,start,complete,clearCompletions,pool,init};
});
