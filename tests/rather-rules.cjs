const assert=require('node:assert/strict');let checks=0;
function token(uid,provider='password'){const e=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return e({alg:'none',typ:'JWT'})+'.'+e({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,firebase:{sign_in_provider:provider}})+'.'}
async function request(method,path,value,uid='alice',provider='password'){const url=new URL('http://127.0.0.1:9000/'+path+'.json?ns=demo-quizloria-default-rtdb'),headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid,provider));return fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)})}
async function check(allowed,label,...args){const r=await request(...args);assert.equal(r.ok,allowed,label+': '+await r.text());checks++}
(async()=>{
 await check(true,'clean ballots','DELETE','ratherVotes',undefined,'owner');
 await check(false,'guest cannot vote','PUT','ratherVotes/w01/guest',0,null);
 await check(false,'anonymous cannot vote','PUT','ratherVotes/w01/anon',0,'anon','anonymous');
 await check(false,'cannot write another account','PUT','ratherVotes/w01/bob',0);
 await check(false,'cannot see results before voting','GET','ratherVotes/w01');
 await check(true,'can read own empty ballot','GET','ratherVotes/w01/alice');
 for(const value of [-1,2,0.5,'0',true,{value:0}])await check(false,'invalid choice '+JSON.stringify(value),'PUT','ratherVotes/w01/alice',value);
 for(const q of ['w00','w41','w1','w010','unknown'])await check(false,'unknown dilemma '+q,'PUT','ratherVotes/'+q+'/alice',0);
 await check(true,'one valid vote','PUT','ratherVotes/w01/alice',0);
 await check(true,'voter reads real results','GET','ratherVotes/w01');
 await check(false,'guest cannot read ballots','GET','ratherVotes/w01',undefined,null);
 await check(false,'unvoted account cannot read another ballot','GET','ratherVotes/w01/alice',undefined,'bob');
 await check(false,'cannot change vote','PUT','ratherVotes/w01/alice',1);
 await check(false,'cannot delete vote','DELETE','ratherVotes/w01/alice');
 await check(false,'cannot rewrite whole question','PUT','ratherVotes/w01',{alice:1});
 await check(false,'cannot rewrite bank','PUT','ratherVotes',{w01:{alice:1}});
 await check(true,'second voter','PUT','ratherVotes/w01/bob',1,'bob');
 await check(true,'last supported ID','PUT','ratherVotes/w40/alice',1);
 await check(false,'cannot read whole bank','GET','ratherVotes');
 await check(false,'cannot edit another membership','PUT','memberships/bob',{plan:'premium',expiresAt:9999999999999});
 await check(false,'cannot grant admin','PUT','admins/alice',true);
 console.log(checks+' dilemma rule checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1});

