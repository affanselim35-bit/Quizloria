const assert=require('node:assert/strict');let count=0;
function token(uid){const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return encode({alg:'none',typ:'JWT'})+'.'+encode({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,firebase:{sign_in_provider:'custom'}})+'.'}
async function api(method,path,value,uid='owner'){const url=new URL('http://127.0.0.1:9000/'+path+'.json');url.searchParams.set('ns','demo-quizloria-default-rtdb');const headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()}}
async function yes(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,true,label+': '+JSON.stringify(r));count++;return r.body}
async function no(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,false,label);assert.equal(r.status,401,label+JSON.stringify(r));count++}
async function main(){
 const seed=JSON.parse(require('node:fs').readFileSync(process.env.QUIZLORIA_ADVANCED_SEED,'utf8'));assert.equal(Object.keys(seed.premiumTests).length,36);
 await yes('reset emulator','PUT','',null);await yes('seed trusted admin','PUT','admins',{admin:true});
 await yes('activate member','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:{'.sv':'timestamp'}},'admin');
 for(const [id,test] of Object.entries(seed.premiumTests)){
  await yes('admin writes private bank '+id,'PUT','premiumTests/'+id,test,'admin');
  await yes('admin writes metadata '+id,'PUT','premiumCatalog/'+id,seed.premiumCatalog[id],'admin');
  await yes('public reads metadata '+id,'GET','premiumCatalog/'+id,undefined,null);
  await no('guest cannot read bank '+id,'GET','premiumTests/'+id,undefined,null);
  await no('free cannot read bank '+id,'GET','premiumTests/'+id,undefined,'bob');
  await no('free cannot read question child '+id,'GET','premiumTests/'+id+'/questions/0',undefined,'bob');
  const actual=await yes('paid reads bank '+id,'GET','premiumTests/'+id,undefined,'alice');assert.deepEqual(actual,test);
 }
 await no('member cannot change questions','PUT','premiumTests/qplus_1/questions/0/correct',3,'alice');
 await yes('expire local member','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()-1,updatedAt:Date.now()});
 await no('expired member denied','GET','premiumTests/qplus_1',undefined,'alice');
 console.log(count+' advanced Premium bank permission checks passed (36 tests / 540 entries).');
}
main().catch(e=>{console.error(e);process.exitCode=1});

