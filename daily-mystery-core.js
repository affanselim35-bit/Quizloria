/* Shared deterministic season ordering; authoritative settlement replays immutable attempts. */
(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.quizloriaMysteryCore=value})(typeof window==='object'?window:globalThis,function(){
'use strict';
function day(now){return new Date(now+10800000).toISOString().slice(0,10)}
function rank(scores){return Object.entries(scores||{}).map(([uid,days])=>{
 let points=0,reachedAt=0,played=0,name='Dedektif';
 for(const value of Object.values(days||{})){if(!value||(value.points!==0&&value.points!==100)||!Number.isFinite(value.at))continue;played++;points+=value.points;if(value.points)reachedAt=Math.max(reachedAt,value.at);if(typeof value.name==='string')name=value.name.slice(0,24)}
 return {uid,name,points,reachedAt,played};
}).filter(x=>x.played).sort((a,b)=>b.points-a.points||a.reachedAt-b.reachedAt||(a.uid<b.uid?-1:a.uid>b.uid?1:0))}
function replay(month,keys,attempts,names){const scores={};for(const [date,key] of Object.entries(keys||{})){
 if(key.month!==month)continue;
 for(const [uid,a] of Object.entries(attempts?.[date]||{})){
  if(!a||!Number.isInteger(a.choice)||a.choice<0||a.choice>3||!Number.isFinite(a.at)||a.at<key.opensAt||a.at>=key.closesAt)continue;
  (scores[uid]??={})[date]={points:a.choice===key.correct?100:0,at:a.at,name:String(names?.[uid]?.name||'Dedektif').slice(0,24)};
 }
}return scores}
return {day,rank,replay};
});

