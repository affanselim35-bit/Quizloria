const assert=require('node:assert/strict');let count=0;
function token(uid){const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);return encode({alg:'none',typ:'JWT'})+'.'+encode({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:now,exp:now+3600,firebase:{sign_in_provider:'custom'}})+'.'}
async function api(method,path,value,uid='owner'){const url=new URL('http://127.0.0.1:9000/'+path+'.json');url.searchParams.set('ns','demo-quizloria-default-rtdb');const headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()}}
async function yes(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,true,label+': '+JSON.stringify(r));count++;return r.body}
async function no(label,method,path,value,uid){const r=await api(method,path,value,uid);assert.equal(r.ok,false,label);assert.equal(r.status,401,label+JSON.stringify(r));count++}
async function main(){
 const seed=JSON.parse(require('node:fs').readFileSync(process.env.QUIZLORIA_RELEASE_SEED,'utf8'));await yes('reset local','PUT','',null);await yes('seed public policy and content','PATCH','',{...seed,siteAccess:{freeTests:true},admins:{admin:true}});
 await yes('guest can read public policy','GET','siteAccess/freeTests',undefined,null);
 for(const [id,meta] of Object.entries(seed.premiumCatalog)){const key=meta.kind==='ipip-facet'?'premiumAssessments':meta.kind==='story-persona'?'premiumStories':'premiumTests';await yes('guest reads now-free test '+id,'GET',key+'/'+id,undefined,null)}
 for(const key of ['premiumTests/mantik-ustaligi','premiumAssessments/ipip-o5','premiumStories/story-anime-yolculugu']){await yes('ordinary reads free content','GET',key,undefined,'bob');await no('ordinary cannot edit','PUT',key+'/title','Spoofed','bob');await no('guest cannot edit','PUT',key+'/title','Spoofed',null)}
 await no('guest cannot change policy','PUT','siteAccess/freeTests',false,null);await no('ordinary cannot change policy','PUT','siteAccess/freeTests',false,'bob');await no('client admin cannot change policy','PUT','siteAccess/freeTests',false,'admin');await no('cannot read another membership','GET','memberships/alice',undefined,'bob');await no('cannot become admin','PUT','admins/bob',true,'bob');
 await yes('owner switches policy locally','PUT','siteAccess/freeTests',false);await no('paid-mode guest denied','GET','premiumTests/mantik-ustaligi',undefined,null);await yes('admin retains access','GET','premiumTests/mantik-ustaligi',undefined,'admin');
 console.log(count+' free-catalog permission checks passed (all 83 tests, guest access, protected writes and policy control).');
}
main().catch(e=>{console.error(e);process.exitCode=1});

