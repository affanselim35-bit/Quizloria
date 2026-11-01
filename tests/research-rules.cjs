const assert=require('node:assert/strict');let count=0;
function token(uid){const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return encode({alg:'none',typ:'JWT'})+'.'+encode({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,firebase:{sign_in_provider:'custom'}})+'.'}
async function api(method,path,value,uid='owner'){const url=new URL('http://127.0.0.1:9000/'+path+'.json');url.searchParams.set('ns','demo-quizloria-default-rtdb');const headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()}}
async function yes(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,true,label+': '+JSON.stringify(r));count++;return r.body}
async function no(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,false,label);assert.equal(r.status,401,label+JSON.stringify(r));count++}
async function main(){
 const seed=JSON.parse(require('node:fs').readFileSync(process.env.QUIZLORIA_RESEARCH_SEED,'utf8'));assert.equal(Object.keys(seed.premiumAssessments).length,20);
 await yes('reset local emulator','PUT','',null);await yes('seed trusted admin','PUT','admins',{admin:true});
 await yes('grant active membership','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()+3600000,updatedAt:{'.sv':'timestamp'}},'admin');
 for(const [id,test] of Object.entries(seed.premiumAssessments)){
  await yes('admin publishes full form '+id,'PUT','premiumAssessments/'+id,test,'admin');
  await yes('admin publishes metadata '+id,'PUT','premiumCatalog/'+id,seed.premiumCatalog[id],'admin');
  await yes('public may see metadata '+id,'GET','premiumCatalog/'+id,undefined,null);
  await no('public cannot see private form '+id,'GET','premiumAssessments/'+id,undefined,null);
  await no('free cannot see private form '+id,'GET','premiumAssessments/'+id,undefined,'bob');
  await yes('member reads form '+id,'GET','premiumAssessments/'+id,undefined,'alice');
 }
 const form=seed.premiumAssessments['ipip-c6'];
 await no('member cannot change items','PUT','premiumAssessments/ipip-c6/items/0/q','Spoofed','alice');
 await no('free cannot change interpretation','PUT','premiumAssessments/ipip-c6/higher','Spoofed','bob');
 await no('incomplete form rejected','PUT','premiumAssessments/broken',{...form,items:form.items.slice(0,9)},'admin');
 await no('extra items rejected','PUT','premiumAssessments/broken',{...form,items:[...form.items,form.items[0]]},'admin');
 await no('missing reverse key rejected','PUT','premiumAssessments/broken',{...form,items:form.items.map((x,i)=>i?x:{q:x.q,original:x.original})},'admin');
 await no('string reverse key rejected','PUT','premiumAssessments/ipip-c6/items/0/reverse','true','admin');
 await no('unknown fields rejected','PUT','premiumAssessments/ipip-c6/clinicalDiagnosis','Spoofed','admin');
 await no('unknown facet rejected','PUT','premiumAssessments/ipip-c6/facet','N3','admin');
 await yes('expire membership local seed','PUT','memberships/alice',{plan:'premium',expiresAt:Date.now()-1,updatedAt:Date.now()});
 await no('expired cannot read form','GET','premiumAssessments/ipip-c6',undefined,'alice');
 console.log(count+' research form permission and schema checks passed.');
}
main().catch(e=>{console.error(e);process.exitCode=1});

