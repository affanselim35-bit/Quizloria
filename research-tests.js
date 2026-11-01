/* Public renderer only. Protected IPIP items are fetched after membership checks. */
(function(){
'use strict';
const choices=['Beni hiç tanımlamıyor','Beni pek tanımlamıyor','Ne tanımlıyor ne tanımlamıyor','Beni oldukça tanımlıyor','Beni çok iyi tanımlıyor'];
let session=null,previousFocus=null;
const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el};
const button=(label,fn)=>{const el=node('button',label);el.type='button';el.onclick=fn;return el};
function allowed(){const m=window.quizloriaMembership,u=window.firebase?.auth().currentUser;return !!(m?.ready&&m.active&&u&&m.uid===u.uid&&session?.uid===u.uid)}
function close(){session=null;document.getElementById('qResearchOverlay')?.remove();previousFocus?.focus();previousFocus=null}
function sources(parent){
 const details=node('details',undefined,'q-research-sources');details.append(node('summary','Araştırma, puanlama ve kullanım sınırları'));
 details.append(node('p','Bu form, Goldberg’in (1999) IPIP kişilik boyutlarından birinin on maddeli Türkçe uyarlamasıdır. Yirmi form yirmi ayrı boyutu ele alır; tam IPIP-NEO envanterini oluşturmaz. Bu Türkçe çevirinin ve boyutların ayrı uygulanmasının geçerlik, güvenirlik veya Türkiye norm çalışması yapılmamıştır.'));
 details.append(node('p','Olumlu maddelerde yanıt 1–5; ters maddelerde 6 − yanıt olarak puanlanır. On madde toplanır (10–50) ve ortalama için ona bölünür. Buradaki 3, yanıt ölçeğinin orta noktasıdır; klinik eşik veya toplum ortalaması değildir. Puan bir yüzdelik dilim, doğru cevap sayısı, tanı veya kesin kişilik hükmü değildir.'));
 details.append(node('p','IPIP maddeleri kamu malıdır ve ücretsiz kaynaklardan da edinilebilir. Premium; reklamsız deneyim, Türkçe sunum ve açıklamalı sonuç hizmeti içindir. Yanıtlar bu akışta sunucuya veya tarayıcı depolamasına kaydedilmez; ekranı kapatınca silinir.'));
 for(const [title,url] of [
  ['Goldberg (1999), özgün çalışma','https://www.ipip.ori.org/A%20broad-bandwidth%20inventory.pdf'],
  ['Resmî IPIP maddeleri ve puan anahtarları','https://ipip.ori.org/newNEOKey.htm'],
  ['Özgün İngilizce ölçeklerin karşılaştırma verileri','https://ipip.ori.org/newNEO_FacetsTable.htm'],
  ['IPIP puanlama yöntemi','https://ipip.ori.org/newScoringInstructions.htm'],
  ['Kullanım izni','https://ipip.ori.org/newPermission.htm']]){const a=node('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';details.append(a,node('br'))}
 parent.append(details);
}
function show(){
 if(!allowed()){close();return}const s=session,root=document.getElementById('qResearchBody');root.replaceChildren();
 const heading=node('h2','👑 '+s.test.title);heading.tabIndex=-1;root.append(heading);
 if(s.stage==='intro'){
  root.append(node('p','Araştırma temelli öz değerlendirme · IPIP '+s.test.facet+' · 10 madde · Yaklaşık 3–5 dakika','q-research-kicker'));
  root.append(node('p','Her ifadenin seni genel olarak ne kadar tanımladığını seç. İdealindeki kişiyi değil, genellikle nasıl davrandığını düşün. Doğru veya yanlış cevap yoktur. Sana uymayan bir madde varsa devam etmek yerine formu kapatabilirsin.'));
  root.append(node('p','Özgün İngilizce ölçek araştırmalarda incelenmiştir; bu Türkçe uyarlama ayrıca doğrulanmamıştır. Kendini tanıma amaçlıdır; tanı koymaz ve uzman değerlendirmesinin yerini tutmaz.','q-research-note'));
  sources(root);root.append(button('Anladım, başlayalım →',()=>{s.stage='questions';show()}));
 }else if(s.stage==='questions'){
  root.append(node('p','Madde '+(s.index+1)+' / 10','q-research-kicker'));const item=s.test.items[s.index];root.append(node('h3',item.q,'q-research-question'));
  const group=node('div',undefined,'q-research-choices');group.setAttribute('role','group');group.setAttribute('aria-label',item.q);
  choices.forEach((label,i)=>{const b=button((i+1)+') '+label,()=>{if(!allowed()){close();return}s.answers[s.index]=i+1;show()});b.className='q-research-choice';b.setAttribute('aria-pressed',String(s.answers[s.index]===i+1));group.append(b)});root.append(group);
  const actions=node('div',undefined,'q-research-actions');if(s.index>0)actions.append(button('← Önceki madde',()=>{s.index--;show()}));
  const next=button(s.index===9?'Açıklamalı sonucumu gör →':'Sonraki madde →',()=>{if(!Number.isInteger(s.answers[s.index]))return;if(s.index===9)s.stage='result';else s.index++;show()});next.disabled=!Number.isInteger(s.answers[s.index]);actions.append(next);root.append(actions);
 }else{
  if(s.answers.length!==10||s.answers.some(v=>!Number.isInteger(v)||v<1||v>5)){close();return}
  const scored=s.test.items.map((item,i)=>({...item,response:s.answers[i],score:item.reverse?6-s.answers[i]:s.answers[i]}));
  const total=scored.reduce((sum,item)=>sum+item.score,0),mean=total/10;
  const hero=node('section',undefined,'q-research-result');hero.append(node('p','YANITLARININ ÖZETİ','q-research-kicker'),node('h3',mean.toLocaleString('tr-TR',{minimumFractionDigits:1})+' / 5','q-research-score'),node('p','Toplam puan: '+total+' / 50 · IPIP '+s.test.facet));
  hero.append(node('p',mean>3?s.test.higher:mean<3?s.test.lower:'Yanıtlarının puan ortalaması ölçeğin orta noktası olan 3’e denk geldi. Bazı ifadeler sana uyarken bazıları uymamış olabilir; tek başına bu ortalama bütün yanıtlarının nötr olduğu anlamına gelmez.'));
  root.append(hero,node('h3','Bu sonuç neden çıktı?'));
  root.append(node('p','On cevabın, resmî IPIP anahtarındaki yönleri korunarak puanlandı. '+scored.filter(x=>x.reverse).length+' ters maddede katılmamak puanı yükseltir. Toplam '+total+' puanın 10’a bölünmesiyle '+mean.toLocaleString('tr-TR')+' ortalaması elde edildi. Bu sayı diğer insanlarla karşılaştırma değildir.'));
  const evidence=node('ul',undefined,'q-result-evidence');[...scored].sort((a,b)=>Math.abs(b.score-3)-Math.abs(a.score-3)).slice(0,3).forEach(item=>{const li=node('li');li.append(node('strong',item.q),node('p','Yanıtın: '+choices[item.response-1]+'. '+(item.reverse?'Ters puanlandı: 6 − '+item.response+' = '+item.score: 'Puanı: '+item.score)+' / 5.'));evidence.append(li)});root.append(evidence);
  const detail=node('details');detail.append(node('summary','10 maddenin puan dökümünü gör'));scored.forEach((item,i)=>detail.append(node('p',(i+1)+'. '+item.q+' · Yanıt '+item.response+' → '+item.score+' puan'+(item.reverse?' (ters)':''))));root.append(detail);
  root.append(node('h3','Üzerine düşünmek için'),node('p',s.test.reflection),node('p','Aynı puan farklı cevap örüntülerinden doğabilir. Yaşadığın ortam, o günkü durumun ve kendini değerlendirme biçimin sonucu etkiler. Bu sonucu kendine kesin bir etiket koymak için kullanma.','q-research-note'));
  sources(root);const actions=node('div',undefined,'q-research-actions');actions.append(button('← Yanıtlarımı gözden geçir',()=>{s.stage='questions';s.index=0;show()}),button('Testlere dön',()=>{close();openV9Page('tests')}));root.append(actions);
 }
 heading.focus();document.getElementById('qResearchOverlay').scrollTop=0;
}
window.qResearchOpen=function(test,id){
 const member=window.quizloriaMembership,u=firebase.auth().currentUser;
 if(!member?.active||!u||member.uid!==u.uid)throw Error('Aktif Premium üyeliği gerekiyor.');
 if(!test||!/^([EOAC][1-6])$/.test(test.facet)||!Array.isArray(test.items)||test.items.length!==10||test.items.some(i=>typeof i.q!=='string'||!i.q||typeof i.reverse!=='boolean')||['title','higher','lower','reflection'].some(key=>typeof test[key]!=='string'))throw Error('Araştırma formu şu anda açılamıyor.');
 if(session)close();previousFocus=document.activeElement;stopV6Timer();openV9Page('tests');
 session={test,id,uid:u.uid,stage:'intro',index:0,answers:[]};
 const overlay=node('div');overlay.id='qResearchOverlay';const panel=node('div');panel.className='q-research-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',test.title);
 const exit=button('✕ Kapat',close);exit.className='q-research-close';const body=node('div');body.id='qResearchBody';panel.append(exit,body);overlay.append(panel);document.body.append(overlay);show();
};
window.addEventListener('quizloria:membership',()=>{if(session&&!allowed()){close();v11Toast('Premium erişimin sona erdi veya hesabın değişti.')}});
document.addEventListener('keydown',event=>{if(!session)return;if(event.key==='Escape'){event.preventDefault();close()}else if(event.key==='Tab'){const focusable=[...document.querySelectorAll('#qResearchOverlay button:not(:disabled),#qResearchOverlay a,#qResearchOverlay summary')].filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement.tagName==='H2')){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}});
})();

