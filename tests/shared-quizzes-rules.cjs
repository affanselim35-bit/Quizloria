const assert=require('assert/strict');let count=0,serial=0;const stamp={'.sv':'timestamp'};
const fixture=(n=5,uid='alice')=>({title:'Arkadaşlık testi',questions:Array.from({length:n},(_,i)=>({q:'Örnek soru '+i,a:['Birinci','İkinci','Üçüncü','Dördüncü'],correct:i%4})),creator:uid,createdAt:stamp});
function token(uid,provider='password'){const e=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),t=Math.floor(Date.now()/1000);return e({alg:'none',typ:'JWT'})+'.'+e({sub:uid,user_id:uid,aud:'demo-quizloria',iss:'https://securetoken.google.com/demo-quizloria',iat:t,exp:t+3600,firebase:{sign_in_provider:provider}})+'.'}
async function req(method,key,value,uid='alice',provider='password'){const url=new URL('http://127.0.0.1:9000/'+key+'.json?ns=demo-quizloria-default-rtdb'),headers={'Content-Type':'application/json'};if(uid==='owner')headers.Authorization='Bearer owner';else if(uid)url.searchParams.set('auth',token(uid,provider));const r=await fetch(url,{method,headers,body:value===undefined?undefined:JSON.stringify(value)});return {ok:r.ok,status:r.status,body:await r.json()}}
async function check(allowed,label,...args){const r=await req(...args);assert.equal(r.ok,allowed,label+': '+JSON.stringify(r));count++;return r.body}
const key=()=> 'sharedQuizzes/Q'+String(++serial).padStart(19,'0');
(async()=>{
 await req('DELETE','sharedQuizzes',undefined,'owner');
 const first=key();await check(false,'unsigned creation denied','PUT',first,fixture(),null);
 await check(true,'registered creator','PUT',first,fixture());await check(true,'guest follows link','GET',first,undefined,null);
 await check(false,'no public list','GET','sharedQuizzes',undefined,null);await check(false,'no account list','GET','sharedQuizzes');
 await check(false,'owner cannot overwrite published quiz','PUT',first,fixture());await check(false,'other account cannot edit','PUT',first+'/title','Changed','bob');await check(false,'owner cannot delete','DELETE',first);
 await check(true,'anonymous creator supported','PUT',key(),fixture(5,'anon'),'anon','anonymous');
 for(let n=6;n<=15;n++)await check(true,'valid question count '+n,'PUT',key(),fixture(n));
 const bad=[
  ['too few questions',v=>v.questions=fixture(4).questions],['too many questions',v=>v.questions=fixture(16).questions],
  ['title short',v=>v.title='ab'],['title long',v=>v.title='x'.repeat(71)],['title wrong type',v=>v.title=123],
  ['creator impersonation',v=>v.creator='bob'],['fake timestamp',v=>v.createdAt=1],['missing timestamp',v=>delete v.createdAt],
  ['unexpected root field',v=>v.admin=true],['missing first question',v=>delete v.questions[0]],
  ['noncontiguous questions',v=>{v.questions=Object.fromEntries(v.questions.map((q,i)=>[i,q]));v.questions[6]=v.questions[4];delete v.questions[4]}],
  ['gap after first five',v=>{v.questions=Object.fromEntries(v.questions.map((q,i)=>[i,q]));v.questions[7]=v.questions[4]}],
  ['question key text',v=>{v.questions={...v.questions,extra:v.questions[0]}}],
  ['short question',v=>v.questions[0].q='abcd'],['long question',v=>v.questions[0].q='x'.repeat(241)],
  ['question wrong type',v=>v.questions[0].q=5],['unexpected question field',v=>v.questions[0].points=999],
  ['missing option',v=>v.questions[0].a.pop()],['extra option',v=>v.questions[0].a.push('Extra')],
  ['sparse options',v=>v.questions[0].a={0:'A',1:'B',2:'C',4:'D'}],['empty option',v=>v.questions[0].a[0]=''],
  ['long option',v=>v.questions[0].a[0]='x'.repeat(141)],['nonstring option',v=>v.questions[0].a[0]=5],
  ...[-1,4,.5,'0',true].map(x=>['invalid correct '+x,v=>v.questions[0].correct=x])
 ];
 for(const [label,edit] of bad){const v=fixture();edit(v);await check(false,label,'PUT',key(),v)}
 await check(false,'invalid short id','PUT','sharedQuizzes/short',fixture());await check(false,'invalid long id','PUT','sharedQuizzes/'+'x'.repeat(21),fixture());
 await check(false,'cannot alter roles','PUT','admins/alice',true);await check(false,'cannot inspect another history','GET','profiles/bob/history');
 console.log(count+' shared-quiz permission checks passed: guests follow links, both creator types, 5–15 questions, immutable published data and bounded schema.');
})().catch(e=>{console.error(e);process.exitCode=1});

