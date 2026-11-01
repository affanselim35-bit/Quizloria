/* Creative character matching. These profiles are not psychological scales. */
(function(){
'use strict';
const traits=['Analiz ve planlama','Bağ kurma ve destek','Kararlılık ve harekete geçme','Merak ve yaratıcılık'];
// Trait assignment follows the meaning of each answer, not its on-screen position.
const keys=[[0,1,2,0],[3,1,1,0],[2,3,1,0],[3,0,2,1],[1,0,1,1],[0,1,3,3],[1,0,0,2],[3,0,1,2],[1,0,3,0],[0,1,0,3],[3,2,1,0],[0,0,3,1],[0,1,2,3],[2,1,0,1],[1,0,0,2],[0,0,2,1],[1,0,0,3],[0,1,3,1],[1,3,0,3],[3,1,2,0]];
// Four weights sum to ten for each fictional profile: analysis, connection, action, exploration.
const profiles={
 persona_1:[[5,1,1,3],[1,4,4,1],[1,4,2,3],[7,1,1,1],[1,4,4,1],[4,2,3,1],[5,1,1,3],[1,5,3,1],[6,1,2,1],[1,1,7,1],[1,3,3,3],[2,2,2,4]],
 persona_2:[[4,2,1,3],[7,1,1,1],[8,0,1,1],[1,3,5,1],[5,0,1,4],[6,0,3,1],[2,3,1,4],[5,3,1,1],[3,3,0,4],[4,1,4,1],[5,2,1,2],[7,0,2,1]],
 persona_3:[[1,4,4,1],[6,2,1,1],[3,2,4,1],[2,0,2,6],[1,6,2,1],[2,3,4,1],[1,2,2,5],[1,3,5,1],[1,3,2,4],[2,5,2,1],[2,2,5,1],[1,2,6,1]],
 persona_4:[[5,2,1,2],[3,1,3,3],[1,2,6,1],[1,6,2,1],[2,3,4,1],[1,6,1,2],[5,3,1,1],[1,2,1,6],[3,4,0,3],[4,1,4,1],[5,1,3,1],[1,2,4,3]],
 persona_5:[[8,0,1,1],[4,2,1,3],[7,1,0,2],[5,4,0,1],[3,2,3,2],[5,3,1,1],[6,3,0,1],[8,1,0,1],[4,1,4,1],[7,0,2,1],[5,3,0,2],[3,1,2,4]],
 persona_6:[[1,3,5,1],[2,5,1,2],[0,1,5,4],[3,1,2,4],[2,3,4,1],[6,2,0,2],[1,1,7,1],[5,1,1,3],[2,2,1,5],[0,7,1,2],[4,0,1,5],[0,5,3,2]]
};
const element=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el};
window.qPersonaExplain=function(item,answers,root){
 const mapping=new Map();QPERSONAS[0].questions.forEach((q,i)=>q.a.forEach((answer,j)=>mapping.set(answer,keys[i][j])));
 const counts=[0,0,0,0],evidence=[];item.questions.forEach((q,i)=>{const response=q.a[answers[i]],trait=mapping.get(response);if(trait===undefined)throw Error('Eksik karakter yanıt eşleştirmesi');counts[trait]++;evidence.push({q:q.q,response,trait})});
 const ranked=item.results.map((name,i)=>({name,i,distance:profiles[item.id][i].reduce((sum,target,j)=>sum+Math.abs(counts[j]/answers.length-target/10),0)})).sort((a,b)=>a.distance-b.distance||a.i-b.i);
 const winner=ranked[0],ties=ranked.filter(x=>Math.abs(x.distance-winner.distance)<1e-9),dominant=counts.map((value,i)=>({value,i})).sort((a,b)=>b.value-a.value||a.i-b.i);
 const hero=element('section',undefined,'q-persona-result');hero.append(element('p','KARAKTER EŞLEŞTİRMEN','q-research-kicker'),element('h3',winner.name,'q-persona-result-title'));
 hero.append(element('p','Yanıtlarında '+dominant.filter(t=>t.value>0).slice(0,2).map(t=>traits[t.i].toLocaleLowerCase('tr-TR')).join(' ile ')+' daha çok öne çıktı. Bu eğlence testinde '+winner.name+' için tanımladığımız tercih profili, dört alandaki yanıt dağılımına en yakın profillerden biri oldu.'));
 root.append(hero,element('h3','Neden bu karakter çıktı?'));
 window.qAddResultCardControls?.(hero,{kind:'character',test:item.title,result:winner.name,summary:'Yanıtlarımda '+dominant.filter(t=>t.value>0).slice(0,2).map(t=>traits[t.i].toLocaleLowerCase('tr-TR')).join(' ve ')+' öne çıktı.',tied:ties.length>1});
 root.append(element('p','Seçimlerin analiz ve planlama, bağ kurma ve destek, harekete geçme, merak ve yaratıcılık olmak üzere dört temada toplandı. Bu dağılım, karakterler için editoryal olarak hazırladığımız profillerle karşılaştırıldı. Karakterin bütün davranışlarıyla aynı olduğun veya aynı yeteneklere sahip olduğun söylenmiyor.'));
 const characterThemes=profiles[item.id][winner.i].map((value,i)=>({value,i})).sort((a,b)=>b.value-a.value||a.i-b.i).slice(0,2);
 root.append(element('p','Bu testteki '+winner.name+' yorumunda '+characterThemes.map(t=>traits[t.i].toLocaleLowerCase('tr-TR')).join(' ve ')+' temalarına yer verdik. Aşağıdaki seçimlerin, kendi tercih dağılımını oluşturarak bu eşleşmeye katkıda bulundu.'));
 const list=element('ul',undefined,'q-result-evidence');const selected=evidence.filter(x=>x.trait===dominant[0].i).slice(0,2);const other=evidence.find(x=>x.trait===dominant[1].i);if(other)selected.push(other);if(selected.length<3){const extra=evidence.find(x=>!selected.includes(x));if(extra)selected.push(extra)}
 selected.forEach(x=>{const li=element('li');li.append(element('strong',x.q),element('p','“'+x.response+'” seçimin, '+traits[x.trait].toLocaleLowerCase('tr-TR')+' temasına katkı verdi.'));list.append(li)});root.append(list);
 const distribution=element('p');distribution.textContent=traits.map((name,i)=>name+': '+counts[i]+' seçim').join(' · ');root.append(distribution);
 if(ties.length>1)root.append(element('p','Eşit yakınlık: '+ties.map(x=>x.name).join(', ')+'. Tek bir karakter açık biçimde öne çıkmadı; başlıkta sabit liste sırasındaki ilk eşleşme gösteriliyor.','q-research-note'));
 else root.append(element('p','Diğer yakın eşleşmen: '+ranked[1].name+'. Farklı bağlamlarda farklı tercihler yapabilirsin; tek bir karakter seni bütünüyle anlatmaz.'));
 root.append(element('p','Bu eğlence amaçlı, yaratıcı bir eşleştirmedir. Bilimsel kişilik testi, tanı veya zekâ değerlendirmesi değildir. Karakter benzerlikleri editoryal yorumdur; araştırma sonucu değildir. Yanıtların bu akışta kaydedilmez.','q-research-note'));
};
})();


