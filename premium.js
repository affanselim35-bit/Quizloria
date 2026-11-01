(function(){
'use strict';
const $=id=>document.getElementById(id),fallback=Object.fromEntries(PREMIUM_KNOWLEDGE_CATALOG.map(({id,...item})=>[id,item]));let catalog={...fallback},busy=false,loadVersion=0;
window.qPremiumHasTest=id=>Object.prototype.hasOwnProperty.call(catalog,id);
function free(){return !!(window.quizloriaMembership?.accessReady&&window.quizloriaMembership.freeTests)}
function canUse(){const m=window.quizloriaMembership,u=window.firebase?.auth().currentUser;return free()||!!(m?.ready&&m.active&&u&&m.uid===u.uid)}
function render(){
 const member=window.quizloriaMembership,status=$('qPremiumStatus'),list=$('testGrid');if(!status||!list)return;
 const paid=!!member?.accessReady&&!free();document.body.dataset.paidCatalog=String(paid);
 for(const id of ['qPremiumHome','qPremiumProfile'])if($(id))$(id).hidden=!paid;
 document.querySelectorAll('.v9-nav [data-view="premium"]').forEach(a=>{a.hidden=!paid});
 if(free()&&document.body.dataset.quizloriaView==='premium')openV9Page('tests');
 status.textContent=!member?.ready?'Üyelik durumu kontrol ediliyor…':member.admin?'👑 Yönetici erişimi · Premium özelliklerin tamamı açık.':member.error?'Üyelik bilgisi şu anda kontrol edilemiyor. Lütfen tekrar dene.':member.active?'⭐ Premium aktif · Bitiş: '+new Date(member.expiresAt).toLocaleDateString('tr-TR'):'Premium satışa hazırlanıyor. Henüz ödeme alınmıyor.';
 $('qPremiumBuy').hidden=!!member?.active;
 document.querySelectorAll('[data-premium-status]').forEach(el=>{el.textContent=!member?.ready?'Üyelik kontrol ediliyor…':member.admin?'👑 Yönetici · Reklamsız Premium erişimi':member.error?'Üyelik şu anda kontrol edilemiyor.':member.active?'👑 Premium aktif · '+new Date(member.expiresAt).toLocaleDateString('tr-TR')+' tarihine kadar':'Reklamsız kullanım ve sana özel testler.'});
 document.querySelectorAll('[data-premium-action]').forEach(el=>{el.textContent=member?.active?'👑 Premium testlerini keşfet →':'👑 Premium’u keşfet →';el.onclick=()=>openV9Page(member?.active?'tests':'premium')});
 list.querySelectorAll('.q-extra-test').forEach(card=>card.remove());Object.entries(catalog).forEach(([id,t])=>{
  quizNames['catalog:'+id]=t.title;quizNames['premium:'+id]=t.title;
  const assessment=t.kind==='ipip-facet',story=t.kind==='story-persona';const card=document.createElement('article');card.className='card q-extra-test '+(paid?'q-premium-card':'q-catalog-card');card.dataset.test=(free()?'catalog:':'premium:')+id;card.dataset.category=assessment?'personality':(['knowledge','sports','fun'].includes(t.category)?t.category:'knowledge');card.dataset.difficulty=assessment?'reflection':story?'story':'hard';
  const badge=document.createElement('span');badge.className='q-premium-badge';badge.textContent='👑 PREMIUM’A ÖZEL';
  const title=document.createElement('h3');title.textContent=t.title;const text=document.createElement('p');text.textContent=t.description+' · '+t.count+' soru';
  const b=document.createElement('button');b.type='button';b.className='q-extra-start';b.textContent=!member?.accessReady?'Yükleniyor…':canUse()?'Teste başla →':'🔒 Premium’u keşfet';b.disabled=busy||!member?.accessReady;b.onclick=()=>canUse()?window.qPremiumStart(id):openV9Page('premium');
  const level=document.createElement('span');level.className='v9-level-tag';level.textContent=assessment?'📚 Araştırma temelli · IPIP':story?'🎭 Karakter ve eğlence':'🔴 Zor';
  const favorite=document.createElement('button');favorite.type='button';favorite.className='favorite-btn';favorite.onclick=()=>toggleFavorite((free()?'catalog:':'premium:')+id);
  if(paid)card.append(badge);card.append(title,text,b,level,favorite);list.append(card);
 });renderFavorites();filterTests();
}
window.qPremiumStart=async function(id){
 if(busy)return;const member=window.quizloriaMembership,u=firebase.auth().currentUser;
 if(!member?.accessReady){v11Toast('Testler hazırlanıyor. Lütfen birazdan tekrar dene.');return}
 if(!canUse()){openV9Page('premium');v11Toast('Bu test için aktif Premium üyeliği gerekiyor.');return}
 busy=true;render();const version=++loadVersion,uid=u?.uid||null;
 try{
  const assessment=catalog[id]?.kind==='ipip-facet',story=catalog[id]?.kind==='story-persona';const value=(await firebase.database().ref((assessment?'premiumAssessments/':story?'premiumStories/':'premiumTests/')+id).once('value')).val();
  if(version!==loadVersion||!canUse()||(!free()&&firebase.auth().currentUser?.uid!==uid))throw Error('Test erişimin yeniden doğrulanmalı.');
  if(assessment){window.qResearchOpen(value,id);return}
  if(story){window.qStoryOpen(value,id);return}
  if(!value||typeof value.title!=='string'||!Array.isArray(value.questions)||value.questions.length<5||value.questions.length>30||value.questions.some(q=>typeof q.q!=='string'||!Array.isArray(q.a)||q.a.length!==4||q.a.some(a=>typeof a!=='string')||!Number.isInteger(q.correct)||q.correct<0||q.correct>3))throw Error('Test şu anda açılamıyor.');
  stopV6Timer();v11ClearProgress();v6Practice=false;v6Mode=isLegacyPremiumTest(id)?$('quizMode').value:'normal';activeQuiz=(free()?'catalog:':'premium:')+id;quizNames[activeQuiz]=value.title;currentQuestion=0;correctAnswers=0;selectedAnswers=[];pendingAnswer=null;scores=[0,0,0,0];
  activeQuestionList=value.questions.map(q=>({...q,a:[...q.a]}));if(isLegacyPremiumTest(id)){for(let i=activeQuestionList.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[activeQuestionList[i],activeQuestionList[j]]=[activeQuestionList[j],activeQuestionList[i]]}}showSection('quiz');if(free())v11SaveProgress();showQuestion();
 }catch(e){v11Toast('⚠️ '+e.message)}finally{busy=false;render()}
};
window.addEventListener('quizloria:membership',()=>{if(!canUse())loadVersion++;render()});
function start(){render();if(!window.firebase)return;const app=firebase.apps.length?firebase.app():firebase.initializeApp(QUIZORA_FIREBASE_CONFIG);app.database().ref('premiumCatalog').on('value',s=>{catalog={...fallback,...(s.val()||{})};render()},()=>{v11Toast('Premium test listesi şu anda yüklenemiyor.')})}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();

