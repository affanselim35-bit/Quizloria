const assert=require('node:assert/strict');let count=0;
function token(uid){const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return encode({alg:'none',typ:'JWT'})+'.'+encode({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,firebase:{sign_in_provider:'custom'}})+'.'}
async function api(method,path,value,uid='owner'){const url=new URL('http://127.0.0.1:9000/'+path+'.json');url.searchParams.set('ns','demo-quizloria-default-rtdb');const headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()}}
async function yes(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,true,label+': '+JSON.stringify(r));count++;return r.body}
async function no(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,false,label);assert.equal(r.status,401,label+JSON.stringify(r));count++}
async function main(){
 const seed=JSON.parse(require('node:fs').readFileSync(process.env.QUIZLORIA_STORIES_SEED,'utf8'));assert.equal(Object.keys(seed.premiumStories).length,24);
 await yes('reset local emulator','PUT','',null);await yes('seed admin','PUT','admins',{admin:true});await yes('grant member','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:{'.sv':'timestamp'}},'admin');
 for(const [id,story] of Object.entries(seed.premiumStories)){
  await yes('admin publishes complete story '+id,'PUT','premiumStories/'+id,story,'admin');
  await yes('admin publishes metadata '+id,'PUT','premiumCatalog/'+id,seed.premiumCatalog[id],'admin');
  await yes('guest reads metadata '+id,'GET','premiumCatalog/'+id,undefined,null);
  await no('guest cannot read story '+id,'GET','premiumStories/'+id,undefined,null);
  await no('free cannot read story '+id,'GET','premiumStories/'+id,undefined,'bob');
  await no('free cannot read question child '+id,'GET','premiumStories/'+id+'/questions/0',undefined,'bob');
  await yes('member reads story '+id,'GET','premiumStories/'+id,undefined,'alice');
 }
 const story=Object.values(seed.premiumStories)[0],copy=()=>structuredClone(story);
 await no('member cannot alter results','PUT','premiumStories/story-anime-yolculugu/results/0/name','Spoofed','alice');
 let bad=copy();bad.questions.pop();await no('missing scenario rejected','PUT','premiumStories/broken',bad,'admin');
 bad=copy();bad.questions.push(story.questions[0]);await no('extra scenario rejected','PUT','premiumStories/broken',bad,'admin');
 bad=copy();bad.questions[0].traits=[0,0,2,3];await no('duplicate answer theme rejected','PUT','premiumStories/broken',bad,'admin');
 bad=copy();bad.questions[0].traits=[0,1,2,5];await no('out-of-range answer theme rejected','PUT','premiumStories/broken',bad,'admin');
 bad=copy();bad.results[0].weights=[1,1,1,1];await no('invalid profile total rejected','PUT','premiumStories/broken',bad,'admin');
 bad=copy();bad.results[0].weights=[7.5,0.5,1,1];await no('noninteger profile rejected','PUT','premiumStories/broken',bad,'admin');
 bad=copy();bad.results.pop();await no('missing outcome rejected','PUT','premiumStories/broken',bad,'admin');
 bad=copy();bad.results[0].clinicalDiagnosis='Spoofed';await no('extra outcome fields rejected','PUT','premiumStories/broken',bad,'admin');
 await yes('expire member locally','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()-1,updatedAt:Date.now()});await no('expired denied','GET','premiumStories/story-anime-yolculugu',undefined,'alice');
 console.log(count+' story schema/access checks passed (24 private quizzes, 288 scenarios, 192 outcomes).');
}
main().catch(e=>{console.error(e);process.exitCode=1});

