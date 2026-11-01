/* Memberships are read from protected server data, never from local preferences. */
(function(){
'use strict';
let record=null,uid=null,ref=null,expiry=null,offset=0,generation=0;
const state={ready:false,active:false,error:false,uid:null,expiresAt:0,adsAllowed:false,now:()=>Date.now()+offset};
window.quizloriaMembership=state;
function emit(){
 if(expiry)clearTimeout(expiry);expiry=null;
 state.uid=uid;state.expiresAt=record?.expiresAt||0;
 state.active=!!(uid&&record?.plan==='premium'&&Number.isFinite(record.expiresAt)&&record.expiresAt>state.now());
 state.adsAllowed=state.ready&&!state.active&&!state.error;
 if(state.active)expiry=setTimeout(emit,Math.min(2147483647,Math.max(1,state.expiresAt-state.now()+20)));
 window.dispatchEvent(new CustomEvent('quizloria:membership',{detail:{ready:state.ready,active:state.active,error:state.error,expiresAt:state.expiresAt}}));
 if(typeof activeQuiz!=='undefined'&&activeQuiz.startsWith('premium:')&&!state.active){
  stopV6Timer();activeQuestionList=[];selectedAnswers=[];v6WrongQuestions=[];v6Practice=false;correctAnswers=0;scores=[0,0,0,0];pendingAnswer=null;answerRevealed=false;activeQuiz='general';
  for(const id of ['question','answers','questionFeedback','answerReview','resultTitle','resultText','resultSummary'])document.getElementById(id)?.replaceChildren();
  openV9Page('premium');v11Toast(state.ready?'Premium erişimin sona erdi veya kaldırıldı.':'Üyeliğin yeniden kontrol ediliyor.');
 }
}
function start(){
 if(!window.firebase){state.error=true;state.ready=true;emit();return}
 const app=firebase.apps.length?firebase.app():firebase.initializeApp(QUIZORA_FIREBASE_CONFIG),db=app.database();
 db.ref('.info/serverTimeOffset').on('value',s=>{offset=s.val()||0;emit()});
 app.auth().onAuthStateChanged(user=>{
  const version=++generation;if(ref)ref.off();ref=null;record=null;uid=user&&!user.isAnonymous?user.uid:null;state.ready=false;state.error=false;emit();
  if(!uid){state.ready=true;emit();return}
  ref=db.ref('memberships/'+uid);ref.on('value',s=>{if(generation!==version)return;record=s.val();state.ready=true;state.error=false;emit()},()=>{if(generation!==version)return;record=null;state.ready=true;state.error=true;emit()});
 });
}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();

