// Run against the local RTDB emulator only. Never connects to production.
const assert=require('node:assert/strict');
const endpoint=process.env.QUIZLORIA_TEST_DATABASE||'http://127.0.0.1:9000';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(endpoint))throw Error('Local emulator required');
let checks=0;
function token(uid){const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return enc({alg:'none',typ:'JWT'})+'.'+enc({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,auth_time:now,firebase:{sign_in_provider:'custom'}})+'.'}
async function api(method,path,value,uid='owner'){
 const url=new URL(endpoint+'/'+path+'.json');url.searchParams.set('ns','demo-quizloria-default-rtdb');
 const headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid));
 const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()};
}
async function allow(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,true,label+': '+JSON.stringify(r));checks++;return r.body}
async function deny(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,false,label+' unexpectedly allowed');assert.equal(r.status,401,label+': '+JSON.stringify(r));checks++}
const stamp={'.sv':'timestamp'};
function makeRoom(host='alice',capacity=5,mode='normal'){return {hostUid:host,status:'waiting',createdAt:stamp,index:0,maxPlayers:capacity,players:{0:{uid:host,name:host}},questions:Array.from({length:10},(_,i)=>({q:'Question '+i,a:['A','B','C','D'],correct:i%4})),test:'mixed',mode,seconds:mode==='normal'?0:10}}
async function main(){
 await allow('clear emulator','PUT','',null);
 await allow('seed profiles','PATCH','',{socialProfiles:{alice:{name:'Alice',key:'alice'},bob:{name:'Bob',key:'bob'},eve:{name:'Eve',key:'eve'}}});
 const pending={name:'Alice',status:'pending'},path='socialRequests/bob/alice';
 await deny('anonymous cannot send','PUT',path,pending,null);
 await deny('cannot impersonate sender','PUT',path,pending,'eve');
 await allow('send request with outgoing pointer','PATCH','',{[path]:pending,'socialSent/alice/bob':{name:'Bob'}},'alice');
 await allow('sender can read sent request','GET',path,undefined,'alice');
 await deny('third party cannot read request','GET',path,undefined,'eve');
 await deny('sender cannot enumerate another inbox','GET','socialRequests/bob',undefined,'alice');
 await deny('third party cannot read outgoing list','GET','socialSent/alice',undefined,'eve');
 await allow('identical request retry','PUT',path,pending,'alice');
 await deny('cannot forge sender name','PUT',path,{name:'Someone',status:'pending'},'alice');
 await deny('sender cannot accept own request','PUT',path+'/status','accepted','alice');
 await deny('third party cannot cancel','DELETE',path,undefined,'eve');
 await allow('sender cancels both records','PATCH','',{[path]:null,'socialSent/alice/bob':null},'alice');
 await allow('resend','PATCH','',{[path]:pending,'socialSent/alice/bob':{name:'Bob'}},'alice');
 await allow('recipient declines both records','PATCH','',{[path]:null,'socialSent/alice/bob':null},'bob');
 await allow('send again','PATCH','',{[path]:pending,'socialSent/alice/bob':{name:'Bob'}},'alice');
 await deny('friendship cannot precede acceptance','PUT','socialFriends/bob/alice',{name:'Alice'},'bob');
 await allow('recipient accepts','PUT',path+'/status','accepted','bob');
 await deny('cannot reset accepted request','PUT',path,pending,'alice');
 await deny('cannot cancel accepted request before friendship','DELETE',path,undefined,'alice');
 const friends={'socialFriends/bob/alice':{name:'Alice'},'socialFriends/alice/bob':{name:'Bob'},'socialSent/alice/bob':null};
 await allow('recipient creates symmetric friendship','PATCH','',friends,'bob');
 await allow('retry acceptance completion safely','PATCH','',friends,'bob');
 await deny('outsider cannot remove friendships','PATCH','',{'socialFriends/alice/bob':null,'socialFriends/bob/alice':null},'eve');
 await allow('either participant removes both sides and accepted request','PATCH','',{'socialFriends/alice/bob':null,'socialFriends/bob/alice':null,[path]:null},'alice');
 await allow('new request after unfriend','PUT',path,pending,'alice');
 await allow('create party','PUT','partyRooms/123456',makeRoom(),'alice');
 await deny('cannot start solo','PATCH','partyRooms/123456',{status:'playing',questionStartedAt:stamp},'alice');
 await deny('capacity over five','PUT','partyRooms/123457',makeRoom('alice',6),'alice');
 await deny('spoofed host slot','PUT','partyRooms/123457',{...makeRoom(),players:{0:{uid:'eve',name:'Alice'}}},'alice');
 await deny('cannot prefill extra seat at creation','PUT','partyRooms/123457',{...makeRoom(),players:{0:{uid:'alice',name:'Alice'},1:{uid:'bob',name:'Bob'}}},'alice');
 await deny('cannot hide extra seat at creation','PUT','partyRooms/123457',{...makeRoom(),players:{0:{uid:'alice',name:'Alice'},5:{uid:'bob',name:'Bob'}}},'alice');
 await deny('cannot seed future answers at creation','PUT','partyRooms/123457',{...makeRoom(),answers:{0:{alice:0}}},'alice');
 await deny('anonymous cannot discover room','GET','partyRooms/123456',undefined,null);
 await allow('signed in user reads lobby by code','GET','partyRooms/123456',undefined,'bob');
 const race=await Promise.all(['bob','carol'].map(uid=>api('PUT','partyRooms/123456/players/1',{uid,name:uid},uid)));
 assert.equal(race.filter(x=>x.ok).length,1,'same seat has one winner');checks++;
 const winner=(await api('GET','partyRooms/123456/players/1',undefined,'owner')).body.uid,loser=winner==='bob'?'carol':'bob';
 await allow('race loser takes next seat','PUT','partyRooms/123456/players/2',{uid:loser,name:loser},loser);
 await deny('same user cannot occupy two seats','PUT','partyRooms/123456/players/3',{uid:winner,name:winner},winner);
 await allow('fourth player joins','PUT','partyRooms/123456/players/3',{uid:'dave',name:'Dave'},'dave');
 await allow('fifth player joins','PUT','partyRooms/123456/players/4',{uid:'eve',name:'Eve'},'eve');
 await deny('sixth player denied','PUT','partyRooms/123456/players/5',{uid:'frank',name:'Frank'},'frank');
 await deny('cannot evict another user','DELETE','partyRooms/123456/players/1',undefined,'eve');
 await deny('non-host cannot start','PATCH','partyRooms/123456',{status:'playing',questionStartedAt:stamp},winner);
 await allow('host starts all five','PATCH','partyRooms/123456',{status:'playing',questionStartedAt:stamp},'alice');
 await deny('outsider cannot read started room','GET','partyRooms/123456',undefined,'frank');
 await deny('late join denied','PUT','partyRooms/123456/players/4',{uid:'frank',name:'Frank'},'frank');
 await deny('cannot skip unanswered question','PATCH','partyRooms/123456',{index:1,questionStartedAt:stamp},'alice');
 await deny('cannot answer for another user','PUT','partyRooms/123456/answers/0/'+winner,0,'alice');
 await deny('cannot submit invalid answer','PUT','partyRooms/123456/answers/0/alice',4,'alice');
 await deny('cannot submit future answer','PUT','partyRooms/123456/answers/1/alice',0,'alice');
 await allow('answer recorded','PUT','partyRooms/123456/answers/0/alice',0,'alice');
 await deny('answer cannot change','PUT','partyRooms/123456/answers/0/alice',1,'alice');
 await deny('cannot remove seat during game','DELETE','partyRooms/123456/players/4',undefined,'eve');
 await allow('guest can leave game','PUT','partyRooms/123456/players/4/left',true,'eve');
 await deny('departed guest cannot answer','PUT','partyRooms/123456/answers/0/eve',0,'eve');
 for(let i=0;i<10;i++){
  for(const uid of ['alice',winner,loser,'dave']){if(i===0&&uid==='alice')continue;await allow('answer question '+i+' '+uid,'PUT','partyRooms/123456/answers/'+i+'/'+uid,i%4,uid)}
  if(i<9)await allow('advance question '+i,'PATCH','partyRooms/123456',{index:i+1,questionStartedAt:stamp},'alice');
 }
 await allow('finish after all active players answer','PUT','partyRooms/123456/status','finished','alice');
 await allow('create two person room','PUT','partyRooms/223456',makeRoom('alice',2),'alice');
 await allow('second person joins two person room','PUT','partyRooms/223456/players/1',{uid:'bob',name:'Bob'},'bob');
 await deny('third person blocked by capacity','PUT','partyRooms/223456/players/2',{uid:'eve',name:'Eve'},'eve');
 await allow('guest disconnect in lobby','PUT','partyRooms/223456/players/1/left',true,'bob');
 await deny('cannot start with only departed guest','PATCH','partyRooms/223456',{status:'playing',questionStartedAt:stamp},'alice');
 await allow('reuse departed seat','PUT','partyRooms/223456/players/1',{uid:'eve',name:'Eve'},'eve');
 await allow('lobby guest leaves','DELETE','partyRooms/223456/players/1',undefined,'eve');
 await allow('host closes lobby','PUT','partyRooms/223456/status','cancelled','alice');
 await allow('create timed room','PUT','partyRooms/323456',makeRoom('alice',2,'timed'),'alice');
 await allow('timed guest joins','PUT','partyRooms/323456/players/1',{uid:'bob',name:'Bob'},'bob');
 await allow('timed start','PATCH','partyRooms/323456',{status:'playing',questionStartedAt:stamp},'alice');
 await deny('cannot reset question timer','PUT','partyRooms/323456/questionStartedAt',stamp,'alice');
 await deny('cannot time out early','PUT','partyRooms/323456/answers/0/bob',-1,'bob');
 await allow('host closes active room','PUT','partyRooms/323456/status','cancelled','alice');
 // Unknown fields and seat indexes cannot create extra permissions.
 await deny('unknown field rejected at creation','PUT','partyRooms/423456',{...makeRoom(),extra:true},'alice');
 await deny('host cannot change capacity later','PUT','partyRooms/223456/maxPlayers',5,'alice');
 console.log(checks+' emulator permission and multiplayer checks passed.');
}
main().catch(e=>{console.error(e);process.exitCode=1});

