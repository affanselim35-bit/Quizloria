// Independent enumerations for the refreshed reasoning questions; no network or user data.
const assert=require('node:assert/strict');
let checks=0;
const locations=['A','B','C'];
assert.deepEqual(locations.filter(key=>[key==='B',key!=='B',key!=='A'].filter(Boolean).length===1),['A']);checks++;
const people=['Ece','Mina','Can'];assert.deepEqual(people.filter(key=>[key==='Mina',key!=='Mina',key!=='Ece'].filter(Boolean).length===2),['Mina','Can']);checks++;
function permutations(xs){return xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(p=>[x,...p])):[[]]}
const seats=permutations(['Aslı','Bora','Cem','Deniz']).filter(p=>p.indexOf('Aslı')+1===p.indexOf('Bora')&&p.indexOf('Cem')<p.indexOf('Aslı')&&p.indexOf('Deniz')>p.indexOf('Bora'));
assert.deepEqual(seats,[['Cem','Aslı','Bora','Deniz']]);checks++;
let draws=0,red=0;for(let a=0;a<5;a++)for(let b=0;b<5;b++)if(a!==b){draws++;if(a<3&&b<3)red++}assert.equal(red/draws,3/10);checks++;
const dice=[];for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)if(a+b===9)dice.push([a,b]);assert.equal(dice.filter(([a])=>a===4).length/dice.length,1/4);checks++;
let teams=0;for(let a=0;a<5;a++)for(let b=a+1;b<5;b++)for(let c=b+1;c<5;c++)teams++;assert.equal(teams,10);checks++;
assert.equal(240/(120/60+120/40),48);checks++;
assert.equal(1/(1/6+1/12),4);checks++;
const boxes=permutations(['apple','pear','mixed']).filter(p=>p[0]!=='apple'&&p[1]!=='pear'&&p[2]!=='mixed');assert.equal(boxes.filter(p=>p[2]==='apple').length,1);assert.equal(boxes.filter(p=>p[2]==='pear').length,1);checks++;
const age=Array.from({length:100},(_,x)=>x).filter(x=>(x+6)+(2*x+6)===42);assert.deepEqual(age,[10]);checks++;
console.log(checks+' independent reasoning checks passed.');
