/* Device-local learning summary. No raw answers, new cloud writes or analytics events. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else {root.qResultInsights=api;api.mount()}})(typeof window==='undefined'?globalThis:window,function(){
'use strict';
const KEY='quizloria_learning_v1';
const TOPICS={
 numbers:{label:'Sayılar ve yorumlama',tests:['logic','puzzles']},history:{label:'Tarih ve kaynak okuma',tests:['history','general']},arts:{label:'Sanat ve edebiyat',tests:['music','cinema','general']},language:{label:'Dil ve kavramlar',tests:['general','world']},basicScience:{label:'Temel bilim',tests:['science','technology']},
 deduction:{label:'Mantıksal çıkarım',tests:['puzzles','logic']},patterns:{label:'Sıralama ve örüntü',tests:['puzzles','logic']},probability:{label:'Olasılık ve sayma',tests:['logic','puzzles']},quantitative:{label:'Nicel akıl yürütme',tests:['logic','puzzles']},space:{label:'Uzay',tests:['science','geography']},physics:{label:'Fizik',tests:['science','technology']},chemistry:{label:'Kimya',tests:['science','general']},experiment:{label:'Deney ve kanıt',tests:['science','logic']}
};
const RELATED={football:['footballstars','sportsworld'],footballstars:['football','sportsworld'],sportsworld:['football','footballstars'],music:['cinema','general'],cinema:['music','general'],gaming:['technology','coding'],technology:['coding','inventions'],coding:['technology','logic'],cars:['technology','science'],animals:['science','geography'],geography:['world','general'],world:['geography','history'],history:['general','mythology'],mythology:['history','world'],food:['world','general'],lego:['inventions','logic'],inventions:['technology','science'],general:['history','science'],science:['technology','geography'],logic:['puzzles','science'],puzzles:['logic','general']};
function identity(questions){return JSON.stringify(questions.map(q=>JSON.stringify([q.q,q.a,q.correct])).sort())}
function valid(q){return q&&typeof q.q==='string'&&Array.isArray(q.a)&&q.a.length===4&&q.a.every(x=>typeof x==='string')&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4}
function build({type,mode='normal',practice=false,questions,answers},history=[],names={}){
 if(typeof type!=='string'||!Array.isArray(questions)||!questions.length||!questions.every(valid)||!Array.isArray(answers)||answers.length!==questions.length||answers.some(x=>!Number.isInteger(x)||x < -1||x>3))return null;
 const groups=new Map();let correct=0;
 questions.forEach((q,i)=>{const topic=Object.hasOwn(TOPICS,q.topic)?q.topic:null;const origin=q.sourceTest||(typeof q.source==='string'&&!q.source.startsWith('https://')?q.source:null)||type;
 const id=topic||'test:'+origin;const data=topic?TOPICS[topic]:{label:names[origin]||'Genel bilgi',tests:RELATED[origin]||['general','logic','science']};
 if(!groups.has(id))groups.set(id,{id,label:data.label,tests:data.tests,total:0,correct:0});const g=groups.get(id);g.total++;if(answers[i]===q.correct){g.correct++;correct++}});
 const rows=[...groups.values()].map(g=>({...g,wrong:g.total-g.correct,rate:g.correct/g.total}));
 const signature=identity(questions),record={type,mode,signature,total:questions.length,correct,date:new Date().toISOString()};
 const previous=history.find(r=>r&&r.type===type&&r.mode===mode);
 const comparable=previous&&previous.signature===signature&&previous.total===record.total&&Number.isInteger(previous.correct)&&previous.correct>=0&&previous.correct<=previous.total;
 let comparison=practice?'Bu tekrar turu gelişim karşılaştırmasına ve geçmişine eklenmez.':!previous?'Bu soru seti ve mod için ilk kaydın. Bir sonraki tamamladığın turda karşılaştıracağız.':!comparable?'Önceki turdaki soru seti değişmiş. Bu turu yeni başlangıç olarak kaydettik.':record.correct>previous.correct?'Önceki aynı sorulu turuna göre '+(record.correct-previous.correct)+' soru daha fazla bildin!':record.correct<previous.correct?'Önceki aynı sorulu turuna göre '+(previous.correct-record.correct)+' daha az doğru yaptın. Açıklamalara göz atıp yeniden deneyebilirsin.':'Önceki aynı sorulu turunla aynı sayıda doğru yaptın.';
 const weakest=[...rows].filter(g=>g.wrong>0).sort((a,b)=>a.rate-b.rate||b.wrong-a.wrong||a.label.localeCompare(b.label,'tr'));
 const strongest=[...rows].filter(g=>g.total>=2&&g.rate>=.7).sort((a,b)=>b.rate-a.rate||b.total-a.total)[0];
 const recommendations=[];for(const g of weakest)for(const test of g.tests)if(test!==type&&!recommendations.some(r=>r.type===test))recommendations.push({type:test,reason:g.label+' alanında '+g.wrong+' soruda takıldın; ilgili konuda pratik yapabilirsin.'});
 if(!recommendations.length)for(const test of RELATED[type]||['general','logic','science'])if(test!==type)recommendations.push({type:test,reason:'Yeni bir alanda kendini denemek için.'});
 return {record,rows,comparison,strongest,practice,recommendations:recommendations.slice(0,2)};
}
let rendered=null;
function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el}
function hide(){const box=document.getElementById('qResultInsights');if(box){box.hidden=true;box.replaceChildren()}}
function reset(){rendered=null;hide()}
function ownerKey(){try{const u=window.firebase?.apps?.length?firebase.auth().currentUser:null;return KEY+':'+(u&&!u.isAnonymous?u.uid:'guest')}catch{return KEY+':guest'}}
function complete(input){
 const box=document.getElementById('qResultInsights');if(!box)return;
 if(rendered){render(rendered,box);return}
 let history=[],storage=true;const key=ownerKey();try{const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))history=value.slice(0,20)}catch{storage=false}
 const model=build(input,history,typeof quizNames==='object'?quizNames:{});if(!model){hide();return}
 if(!input.practice){try{localStorage.setItem(key,JSON.stringify([model.record,...history].slice(0,20)))}catch{storage=false}}
 if(!storage)model.comparison='Bu tarayıcıda geçmiş kaydedilemediği için önceki sonuçla karşılaştırma yapılamıyor.';
 rendered=model;render(model,box);
}
function render(model,box){
 box.replaceChildren();box.hidden=false;
 const heading=element('h3','🧭 Sonucunun yol haritası');heading.id='qInsightsTitle';box.append(heading);
 const comparison=element('p',model.comparison,'q-insights-comparison');comparison.id='qInsightsComparison';box.append(comparison);
 box.append(element('p',model.strongest?'Bu turda '+model.strongest.label+' alanında '+model.strongest.total+' sorudan '+model.strongest.correct+' tanesini doğru yanıtladın.':'Bu turu bir başlangıç olarak kullan; cevap açıklamalarıyla devam edebilirsin.','q-insights-highlight'));
 const table=element('table');table.append(element('caption','Bu turdaki konu özeti'));const head=element('thead'),tr=element('tr');for(const title of ['Konu','Doğru / Soru','Başarı']){const th=element('th',title);th.scope='col';tr.append(th)}head.append(tr);table.append(head);const body=element('tbody');for(const g of model.rows){const row=element('tr'),title=element('th',g.label+(g.total<2?' · 1 soru':''));title.scope='row';row.append(title,element('td',g.correct+' / '+g.total),element('td','%'+Math.round(g.rate*100)));body.append(row)}table.append(body);box.append(table);
 box.append(element('p','Bu özet yalnız bu turdaki sorulara dayanır; genel yeteneğini ölçmez. Karşılaştırmalar bu tarayıcıda, aynı soru seti ve aynı mod için saklanır.','q-insights-note'));
 const recommendations=element('div',undefined,'q-insights-recommendations');recommendations.append(element('h4',model.rows.some(g=>g.wrong)?'Pratik için sıradaki testlerin':'Sıradaki keşfin'));
 for(const suggestion of model.recommendations){const card=document.querySelector('#testGrid [data-test="'+suggestion.type+'"]');const start=card?.querySelector('button[onclick^="startQuiz"]');if(!start)continue;
 const item=element('div',undefined,'q-insights-recommendation');item.append(element('p',suggestion.reason));const btn=element('button',(card.querySelector('h3')?.textContent||suggestion.type)+' →');btn.type='button';btn.addEventListener('click',()=>startQuiz(suggestion.type));item.append(btn);recommendations.append(item)}
 box.append(recommendations);
}
function mount(){}
return {build,identity,complete,reset,hide,mount};
});
