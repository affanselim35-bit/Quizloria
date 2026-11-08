const assert=require('node:assert/strict'),c=require('../daily-challenge.js');let checks=0;
assert.equal(c.day('2026-11-07T20:59:59Z'),'2026-11-07');assert.equal(c.day('2026-11-07T21:00:00Z'),'2026-11-08');assert.equal(c.day('bad'),null);assert.equal(c.day('2028-02-28T21:00:00Z'),'2028-02-29');checks+=4;
const pool=Array.from({length:149},(_,i)=>({id:'t'+i,title:'Test '+i})),day='2026-11-07';assert.equal(c.choose(pool,day).id,c.choose([...pool].reverse(),day).id);assert.equal(c.choose([],day),null);assert.equal(c.choose(pool,'bad'),null);assert.equal(c.choose(pool,'2026-99-99'),null);checks+=4;
const all=new Set();for(let i=0;i<149;i++){all.add(c.choose(pool,c.day(Date.UTC(2026,10,1+i,12))).id)}assert.equal(all.size,149);checks++;
assert.equal(c.choose(pool,day,{day,id:'t10'}).id,'t10');assert.notEqual(c.choose(pool,day,{day:'2026-11-06',id:'t10'}).id,undefined);assert.ok(pool.some(x=>x.id===c.choose(pool,day,{day,id:'removed'}).id));checks+=3;
assert.equal(c.unique([{id:'premium:x',title:'X'},{id:'catalog:x',title:'X'},{id:'',title:'Bad'},null]).length,1);checks++;
assert.equal(c.completed('catalog:x',day,[{day,id:'premium:x'}]),true);assert.equal(c.completed('catalog:x',day,[{day:'2026-11-06',id:'catalog:x'}]),false);assert.equal(c.completed('catalog:x',day,[{day,id:'catalog:y'}]),false);checks+=3;
assert.equal(c.completed('catalog:x',day,[],[{type:'premium:x',date:'2026-11-07T12:00:00Z'}]),true);assert.equal(c.completed('catalog:x',day,[],[{type:'catalog:x',date:'2026-11-07T21:00:00Z'}]),false);assert.equal(c.completed('catalog:x',day,[],[{type:'catalog:x'}]),false);assert.equal(c.completed('catalog:x',day,[],[{type:'catalog:x',date:'bad'}]),false);checks+=4;
console.log(checks+' all-test daily rotation checks passed.');
