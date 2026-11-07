const assert=require('node:assert/strict'),{build,identity}=require('../result-insights.js');let checks=0;
const questions=[{q:'A',a:['a','b','c','d'],correct:0,topic:'space'},{q:'B',a:['a','b','c','d'],correct:1,topic:'space'},{q:'C',a:['a','b','c','d'],correct:2,topic:'physics'}];
const input={type:'science',mode:'normal',questions,answers:[0,0,-1]};let first=build(input);assert.equal(first.record.correct,1);assert.equal(first.rows[0].correct,1);assert.equal(first.rows[0].total,2);assert.equal(first.rows[1].wrong,1);checks+=4;
assert.ok(first.comparison.includes('ilk kaydın'));assert.equal(first.strongest,undefined);assert.ok(first.recommendations.length>0);assert.ok(first.recommendations.every(x=>x.type!=='science'));checks+=4;
const previous=first.record;const improved=build({...input,answers:[0,1,2]},[previous]);assert.ok(improved.comparison.includes('2 soru daha fazla'));assert.equal(improved.strongest.label,'Uzay');assert.ok(improved.recommendations.every(r=>r.reason.includes('Yeni bir alanda')));checks+=3;
assert.ok(build({...input,answers:[3,3,-1]},[previous]).comparison.includes('1 daha az'));assert.ok(build(input,[previous]).comparison.includes('aynı sayıda'));checks+=2;
assert.equal(identity([...questions].reverse()),identity(questions));assert.ok(build({...input,questions:[...questions].reverse(),answers:[2,1,0]},[previous]).comparison.includes('2 soru daha fazla'));checks+=2;
assert.ok(build({...input,mode:'speed'},[previous]).comparison.includes('ilk kaydın'));assert.ok(build({...input,practice:true},[previous]).comparison.includes('eklenmez'));checks+=2;
for(const change of [q=>({...q,q:q.q+' changed'}),q=>({...q,a:['new','b','c','d']}),q=>({...q,correct:3})]){const changed=questions.map((q,i)=>i===0?change(q):q);assert.ok(build({...input,questions:changed},[previous]).comparison.includes('değişmiş'));checks++}
assert.ok(build(input,[{...previous,total:100}]).comparison.includes('değişmiş'));assert.ok(build(input,[{...previous,correct:Infinity}]).comparison.includes('değişmiş'));checks+=2;
for(const overrides of [{answers:[]},{answers:[undefined,0,0]},{answers:[4,0,0]},{questions:[]},{questions:[{q:'broken'}]}]){assert.equal(build({...input,...overrides}),null);checks++}
const mixed=build({...input,type:'mixed',questions:questions.map(q=>({...q,topic:undefined,sourceTest:'science'}))},[],{science:'Bilim'});assert.equal(mixed.rows[0].label,'Bilim');assert.equal(mixed.rows[0].total,3);checks+=2;
console.log(checks+' learning-summary logic checks passed.');
