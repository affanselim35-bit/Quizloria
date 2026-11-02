const assert=require('assert/strict'),core=require('../daily-mystery-core.js'),{settle}=require('../tools/settle-mystery.cjs');let count=0;
function token(uid,provider='password'){const e=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),t=Math.floor(Date.now()/1000);return e({alg:'none',typ:'JWT'})+'.'+e({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:t,exp:t+3600,firebase:{sign_in_provider:provider}})+'.'}
async function req(method,path,value,uid='alice',provider='password'){const url=new URL('http://127.0.0.1:9000/'+path+'.json?ns=demo-quizloria-default-rtdb'),headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid,provider));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,body:await r.json()}}
async function test(allowed,label,...args){const r=await req(...args);assert.equal(r.ok,allowed,label+': '+JSON.stringify(r));count++;return r.body}
(async()=>{
 const n=Date.now(),day='2026-11-02',month='2026-11',key={correct:2,explanation:'Fixture solution',opensAt:n-100000,closesAt:n+3600000,month},stamp={'.sv':'timestamp'};
 for(const p of ['mysteryCases','mysteryKeys','mysteryAttempts','mysteryScores','mysteryAwards','mysteryEntitlements','mysteryBonus'])await req('DELETE',p,undefined,'owner');
 await test(true,'seed local fixtures','PATCH','',{mysteryCases:{[day]:{title:'Fixture',opensAt:n-100000},future:{title:'Future',opensAt:n+3600000}},mysteryKeys:{[day]:key,closed:{...key,opensAt:n-200000,closesAt:n-1}},mysteryBonus:{b:{title:'Private bonus'}}},'owner');
 await test(true,'guest sees current case','GET','mysteryCases/'+day,undefined,null);await test(false,'future case hidden','GET','mysteryCases/future',undefined,null);
 await test(false,'bank enumeration denied','GET','mysteryCases',undefined,null);await test(false,'key hidden before attempt','GET','mysteryKeys/'+day);
 await test(false,'anonymous attempt','PUT','mysteryAttempts/'+day+'/anon',{choice:2,at:stamp},'anon','anonymous');
 await test(false,'guest attempt','PUT','mysteryAttempts/'+day+'/guest',{choice:2,at:stamp},null);
 await test(false,'impersonation','PUT','mysteryAttempts/'+day+'/bob',{choice:2,at:stamp});
 await test(false,'unknown case','PUT','mysteryAttempts/unknown/alice',{choice:2,at:stamp});
 await test(false,'closed case','PUT','mysteryAttempts/closed/alice',{choice:2,at:stamp});
 for(const choice of [-1,4,.5,'2'])await test(false,'invalid choice','PUT','mysteryAttempts/'+day+'/alice',{choice,at:stamp});
 await test(false,'forged time','PUT','mysteryAttempts/'+day+'/alice',{choice:2,at:1});
 await test(false,'extra points property','PUT','mysteryAttempts/'+day+'/alice',{choice:2,at:stamp,points:999});
 await test(false,'score without attempt','PUT','mysteryScores/'+month+'/alice/'+day,{points:100,at:n,name:'Dedektif'});
 await test(true,'lock valid correct attempt','PUT','mysteryAttempts/'+day+'/alice',{choice:2,at:stamp});
 const attempt=await test(true,'own attempt','GET','mysteryAttempts/'+day+'/alice');
 await test(false,'cannot read others attempt','GET','mysteryAttempts/'+day+'/alice',undefined,'bob');
 await test(true,'reveal after lock','GET','mysteryKeys/'+day);await test(false,'other user cannot reveal','GET','mysteryKeys/'+day,undefined,'bob');
 await test(false,'cannot change','PUT','mysteryAttempts/'+day+'/alice',{choice:1,at:stamp});await test(false,'cannot delete','DELETE','mysteryAttempts/'+day+'/alice');
 const score={points:100,at:attempt.at,name:'Dedektif'};
 await test(false,'inflated score','PUT','mysteryScores/'+month+'/alice/'+day,{...score,points:10000});
 await test(false,'wrong month','PUT','mysteryScores/2026-12/alice/'+day,score);
 await test(false,'fake timestamp','PUT','mysteryScores/'+month+'/alice/'+day,{...score,at:0});
 await test(false,'fake name','PUT','mysteryScores/'+month+'/alice/'+day,{...score,name:'Pretend winner'});
 await test(true,'correct verified score','PUT','mysteryScores/'+month+'/alice/'+day,score);
 await test(true,'public board','GET','mysteryScores/'+month,undefined,null);await test(false,'cannot rewrite score','PUT','mysteryScores/'+month+'/alice/'+day,{...score,points:0});
 await test(true,'lock wrong attempt','PUT','mysteryAttempts/'+day+'/bob',{choice:1,at:stamp},'bob');const b=await req('GET','mysteryAttempts/'+day+'/bob',undefined,'bob');
 await test(false,'wrong answer cannot claim 100','PUT','mysteryScores/'+month+'/bob/'+day,{...score,at:b.body.at},'bob');await test(true,'wrong answer claims zero','PUT','mysteryScores/'+month+'/bob/'+day,{...score,points:0,at:b.body.at},'bob');
 await test(false,'award cannot self grant','PUT','mysteryAwards/'+month,{uid:'alice'});await test(false,'entitlement cannot self grant','PUT','mysteryEntitlements/alice',{activeFrom:0,expiresAt:n+999999});
 await test(false,'bonus denied before prize','GET','mysteryBonus');await req('PUT','mysteryEntitlements/alice',{season:month,activeFrom:n-1000,expiresAt:n+100000},'owner');await test(true,'winner bonus access','GET','mysteryBonus');await test(false,'other account no bonus','GET','mysteryBonus',undefined,'bob');
 await req('PUT','mysteryEntitlements/alice',{season:month,activeFrom:n-10000,expiresAt:n-1},'owner');await test(false,'expired prize','GET','mysteryBonus');
 await test(false,'cannot alter key','PUT','mysteryKeys/'+day+'/correct',1);await test(false,'cannot edit season','PUT','mysterySeasons/'+month,{closesAt:0});
 assert.equal(core.day(Date.parse('2026-11-30T20:59:59Z')),'2026-11-30');assert.equal(core.day(Date.parse('2026-11-30T21:00:00Z')),'2026-12-01');count+=2;
 const data={mysterySeasons:{[month]:{closesAt:n-1,rewardEndsAt:n+100000}},mysteryKeys:{[day]:key},mysteryAttempts:{[day]:{z:{choice:2,at:n-1000},a:{choice:2,at:n-2000},bad:{choice:1,at:n-5000},future:{choice:2,at:n+99999999}}},socialProfiles:{a:{name:'Earlier'},z:{name:'Later'}}};
 const result=settle(data,n);assert.equal(result.patch['mysteryAwards/'+month].uid,'a');assert.equal(result.patch['mysteryEntitlements/a'].expiresAt,n+100000);assert.equal(core.rank(core.replay(month,data.mysteryKeys,data.mysteryAttempts,data.socialProfiles)).length,3);count+=3;
 assert.deepEqual(settle({...data,mysteryAwards:{[month]:result.patch['mysteryAwards/'+month]}},n).patch,{});assert.deepEqual(settle(data,n-10000).patch,{});count+=2;
 const empty=settle({...data,mysteryAttempts:{}},n);assert.equal(empty.patch['mysteryAwards/'+month].uid,undefined);assert.equal(Object.keys(empty.patch).filter(k=>k.startsWith('mysteryEntitlements/')).length,0);count+=2;
 console.log(count+' mystery security/settlement checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1});

