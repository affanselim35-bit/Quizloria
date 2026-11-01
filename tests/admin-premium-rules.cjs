const assert=require('node:assert/strict');let count=0;
function token(uid){const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return encode({alg:'none',typ:'JWT'})+'.'+encode({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,firebase:{sign_in_provider:'custom'}})+'.'}
async function api(method,path,value,uid='owner'){const url=new URL('http://127.0.0.1:9000/'+path+'.json');url.searchParams.set('ns','demo-quizloria-default-rtdb');const headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()}}
async function yes(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,true,label+': '+JSON.stringify(r));count++;return r.body}
async function no(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,false,label);assert.equal(r.status,401,label+JSON.stringify(r));count++}
async function main(){
 await yes('reset local DB','PUT','',null);await yes('seed trusted role and toy content','PATCH','',{admins:{alice:true,bob:false,charlie:'true'},premiumTests:{fixture:{title:'Fixture'}},premiumAssessments:{fixture:{title:'Fixture'}},premiumStories:{fixture:{title:'Fixture'}}});
 for(const path of ['premiumTests/fixture','premiumAssessments/fixture','premiumStories/fixture']){
  await yes('admin without subscription reads '+path,'GET',path,undefined,'alice');
  await no('free denied '+path,'GET',path,undefined,'bob');await no('truthy string role denied '+path,'GET',path,undefined,'charlie');await no('guest denied '+path,'GET',path,undefined,null);
 }
 await yes('seed expired admin subscription','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()-1,updatedAt:Date.now()});
 for(const path of ['premiumTests/fixture','premiumAssessments/fixture','premiumStories/fixture'])await yes('admin still reads with expired subscription '+path,'GET',path,undefined,'alice');
 await no('cannot grant own admin','PUT','admins/bob',true,'bob');await no('cannot grant friend admin','PUT','admins/bob',true,'alice');await no('cannot self-grant subscription','PUT','memberships/bob',{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:{'.sv':'timestamp'}},'bob');
 await yes('remove trusted admin locally','DELETE','admins/alice');for(const path of ['premiumTests/fixture','premiumAssessments/fixture','premiumStories/fixture'])await no('revoked role loses access '+path,'GET',path,undefined,'alice');
 await yes('seed ordinary valid subscriber','PUT','memberships/bob',{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:Date.now()});for(const path of ['premiumTests/fixture','premiumAssessments/fixture','premiumStories/fixture'])await yes('ordinary paid member still reads '+path,'GET',path,undefined,'bob');
 console.log(count+' admin Premium rule checks passed (all three banks, true-only role, no self-upgrade, revocation and ordinary subscriptions).');
}
main().catch(e=>{console.error(e);process.exitCode=1});

