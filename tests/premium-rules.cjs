const assert=require('node:assert/strict');let count=0;
function token(uid){const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return encode({alg:'none',typ:'JWT'})+'.'+encode({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,firebase:{sign_in_provider:'custom'}})+'.'}
async function api(method,path,value,uid='owner'){const url=new URL('http://127.0.0.1:9000/'+path+'.json');url.searchParams.set('ns','demo-quizloria-default-rtdb');const headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()}}
async function yes(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,true,label+': '+JSON.stringify(r));count++;return r.body}
async function no(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,false,label);assert.equal(r.status,401,label+JSON.stringify(r));count++}
const stamp={'.sv':'timestamp'},questions=Array.from({length:10},(_,i)=>({q:'Fixture question '+i,a:['A','B','C','D'],correct:0,explanation:'Test fixture explanation.'}));
const room=()=>({hostUid:'alice',status:'waiting',createdAt:stamp,index:0,maxPlayers:5,players:{0:{uid:'alice',name:'Alice'}},questions:questions.map(({explanation,...q})=>q),test:'mixed',mode:'normal',seconds:0});
async function main(){
 await yes('reset local database','PUT','',null);
 await yes('seed trusted admin and public profiles','PATCH','',{admins:{admin:true},socialProfiles:{alice:{name:'Alice',key:'alice'},bob:{name:'Bob',key:'bob'},eve:{name:'Eve',key:'eve'}},socialFriends:{alice:{bob:{name:'Bob'}},bob:{alice:{name:'Alice'}}}});
 const premium={plan:'premium',expiresAt:Date.now()+3600000,updatedAt:stamp};
 await no('user cannot grant premium','PUT','memberships/alice',premium,'alice');await no('user cannot grant to a friend','PUT','memberships/bob',premium,'alice');
 await no('cannot become admin','PUT','admins/alice',true,'alice');
 await yes('trusted admin may activate','PUT','memberships/alice',premium,'admin');
 await yes('member reads own plan','GET','memberships/alice',undefined,'alice');await no('other user cannot read plan','GET','memberships/alice',undefined,'bob');await no('guest cannot read plan','GET','memberships/alice',undefined,null);
 await no('member cannot extend expiry','PUT','memberships/alice/expiresAt',Date.now()+86400000,'alice');
 await no('malformed entitlement denied','PUT','memberships/bob',{...premium,extra:true},'admin');
 await yes('admin writes protected test','PUT','premiumTests/fixture',{title:'Fixture Premium',questions},'admin');
 await yes('admin writes public catalogue','PUT','premiumCatalog/fixture',{title:'Fixture Premium',description:'Local test only',count:10},'admin');
 await yes('public catalogue readable','GET','premiumCatalog',undefined,null);
 await no('public cannot read questions','GET','premiumTests/fixture',undefined,null);await no('free user cannot read questions','GET','premiumTests/fixture',undefined,'bob');
 await no('free user cannot change content','PUT','premiumTests/fixture/title','Spoofed','bob');await no('paid user cannot change content','PUT','premiumTests/fixture/title','Spoofed','alice');
 await yes('active member reads protected questions','GET','premiumTests/fixture',undefined,'alice');
 await yes('seed expired plan','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()-1,updatedAt:Date.now()});await no('expired member cannot read content','GET','premiumTests/fixture',undefined,'alice');
 await yes('reactivate','PUT','memberships/alice',premium,'admin');await yes('admin revokes','DELETE','memberships/alice',undefined,'admin');await no('revoked cannot read','GET','premiumTests/fixture',undefined,'alice');
 await yes('create lobby','PUT','partyRooms/123456',room(),'alice');
 const invite={code:'123456',senderName:'Alice',createdAt:stamp,expiresAt:Date.now()+600000};
 await yes('host invites a mutual friend','PUT','duelInvites/bob/alice',invite,'alice');await yes('recipient reads inbox','GET','duelInvites/bob',undefined,'bob');await no('outsider cannot read inbox','GET','duelInvites/bob',undefined,'eve');
 await no('cannot impersonate sender','PUT','duelInvites/bob/alice',invite,'eve');await no('non-friend cannot be invited','PUT','duelInvites/eve/alice',invite,'alice');
 await no('recipient cannot rewrite invite','PUT','duelInvites/bob/alice',{...invite,code:'654321'},'bob');await no('wrong sender display name denied','PUT','duelInvites/bob/alice',{...invite,senderName:'Fake'},'alice');
 await no('unbounded expiry denied','PUT','duelInvites/bob/alice',{...invite,expiresAt:Date.now()+86400000},'alice');await no('expired invite cannot be created','PUT','duelInvites/bob/alice',{...invite,expiresAt:Date.now()-1},'alice');
 await yes('recipient declines','DELETE','duelInvites/bob/alice',undefined,'bob');await yes('invite again','PUT','duelInvites/bob/alice',invite,'alice');await yes('sender can withdraw','DELETE','duelInvites/bob/alice',undefined,'alice');
 await yes('seed finished match','PATCH','partyRooms/123456',{status:'finished',index:9,players:{0:{uid:'alice',name:'Alice'},1:{uid:'bob',name:'Bob'}}});
 await no('invites to finished room denied','PUT','duelInvites/bob/alice',invite,'alice');
 const next={...room(),previousRoom:'123456'};
 await yes('host creates matching rematch room','PUT','partyRooms/234567',next,'alice');
 await no('guest cannot create rematch as host','PUT','partyRooms/345678',{...next,hostUid:'bob',players:{0:{uid:'bob',name:'Bob'}}},'bob');
 await no('rematch cannot change capacity','PUT','partyRooms/345678',{...next,maxPlayers:2},'alice');
 await no('guest cannot publish rematch link','PUT','partyRooms/123456/nextRoom','234567','bob');
 await no('invalid rematch target denied','PUT','partyRooms/123456/nextRoom','999999','alice');
 await yes('host links fresh rematch','PUT','partyRooms/123456/nextRoom','234567','alice');await yes('old guest sees link','GET','partyRooms/123456/nextRoom',undefined,'bob');
 await no('link cannot be overwritten','PUT','partyRooms/123456/nextRoom','234567','alice');await no('outsider cannot read link','GET','partyRooms/123456/nextRoom',undefined,'eve');
 await yes('create waiting room','PUT','partyRooms/345678',room(),'alice');await no('cannot rematch before finish','PUT','partyRooms/456789',{...next,previousRoom:'345678'},'alice');
 console.log(count+' premium, invitation and rematch permission checks passed.');
}
main().catch(e=>{console.error(e);process.exitCode=1});

