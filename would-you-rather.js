/* Authenticated, immutable ballots. No simulated community percentages. */
(function(){
'use strict';
const rows=[
 ['Hayal gücü','Uçabilmek','Görünmez olabilmek'],
 ['Hayal gücü','Geçmişe bir günlüğüne gitmek','Geleceğe bir günlüğüne gitmek'],
 ['Hayal gücü','Hayvanların dilini anlamak','Bütün insan dillerini konuşmak'],
 ['Hayal gücü','Uzayda bir hafta geçirmek','Okyanus altında bir hafta geçirmek'],
 ['Hayal gücü','Bir ejderhayla arkadaş olmak','Bir robotla dünyayı gezmek'],
 ['Hayal gücü','Rüyalarını film gibi izlemek','İstediğin kitabın içine girmek'],
 ['Hayal gücü','Her yere ışınlanabilmek','Zamanı günde beş dakika durdurmak'],
 ['Hayal gücü','Gizli bir büyü okuluna gitmek','Bir uzay gemisinin kaptanı olmak'],
 ['Günlük hayat','Hep yaz olması','Hep kış olması'],
 ['Günlük hayat','Deniz kenarında yaşamak','Ormanın yanında yaşamak'],
 ['Günlük hayat','Her gün erken kalkmak','Her gün geç yatmak'],
 ['Günlük hayat','Bir ay telefonsuz kalmak','Bir ay televizyonsuz kalmak'],
 ['Günlük hayat','Sadece evde film izlemek','Sadece sinemada film izlemek'],
 ['Günlük hayat','Her gün farklı bir yemek yemek','En sevdiğin yemeği her gün yemek'],
 ['Günlük hayat','Hep trenle seyahat etmek','Hep gemiyle seyahat etmek'],
 ['Günlük hayat','Sessiz bir köyde tatil yapmak','Kalabalık bir şehirde tatil yapmak'],
 ['Zor seçim','Bir konuda dünyanın en iyisi olmak','Birçok konuda iyi olmak'],
 ['Zor seçim','Harika şarkı söylemek','Harika resim yapmak'],
 ['Zor seçim','Bir kitabın yazarı olmak','Bir filmin yönetmeni olmak'],
 ['Zor seçim','Her şeyi önceden planlamak','Her şeye anlık karar vermek'],
 ['Zor seçim','Tek başına büyük bir maceraya çıkmak','Arkadaşlarınla sakin bir tatil yapmak'],
 ['Zor seçim','Herkesin bildiği bir şarkı yazmak','Herkesin oynadığı bir oyun yapmak'],
 ['Zor seçim','Çok hızlı öğrenmek','Öğrendiklerini hiç unutmamak'],
 ['Zor seçim','Gizemli bir adayı keşfetmek','Kayıp bir şehri keşfetmek'],
 ['Komik','Her konuştuğunda arka planda müzik çalması','Her odaya girdiğinde alkış duyulması'],
 ['Komik','Bir hafta şarkı söyleyerek konuşmak','Bir hafta kafiyeli konuşmak'],
 ['Komik','Ayakkabılarının her adımda ışık saçması','Şapkanın ruh haline göre renk değiştirmesi'],
 ['Komik','Kedinin sana günlük görevler vermesi','Köpeğinin sana moda tavsiyesi vermesi'],
 ['Komik','Bütün kapıların açılırken miyavlaması','Bütün sandalyelerin oturunca alkışlaması'],
 ['Komik','Bir günlüğüne bir kedi olmak','Bir günlüğüne bir penguen olmak'],
 ['Komik','Kahkahanın çizgi film sesi gibi çıkması','Hapşırınca konfeti çıkması'],
 ['Komik','Konuşan bir buzdolabıyla yaşamak','Şaka yapan bir çamaşır makinesiyle yaşamak'],
 ['Hayal gücü','Bir süper kahramanın yardımcısı olmak','Kendi maceranın kahramanı olmak'],
 ['Günlük hayat','Arkadaşlarınla masa oyunu oynamak','Arkadaşlarınla doğa yürüyüşüne çıkmak'],
 ['Zor seçim','Hep doğru yönü bulmak','Hep kaybettiğin eşyayı bulmak'],
 ['Komik','Hayatının bir gün boyunca müzikal olması','Hayatının bir gün boyunca sessiz film olması'],
 ['Hayal gücü','Minicik olup bir bahçeyi keşfetmek','Dev olup dağların üstünden bakmak'],
 ['Günlük hayat','Yağmurda kitap okumak','Güneşte müzik dinlemek'],
 ['Zor seçim','Bir gizemi çözmek','Yeni bir şey icat etmek'],
 ['Komik','Her fotoğrafta çizgi film gibi görünmek','Her videoda ağır çekimde görünmek']
];
// IDs are permanent: never reorder rows or change a published dilemma's meaning.
const questions=rows.map((r,i)=>({id:'w'+String(i+1).padStart(2,'0'),category:r[0],a:r[1],b:r[2]}));
let auth,db,user=null,order=[],position=0,chosen=null,busy=false,epoch=0,ref=null,listener=null;
const el=id=>document.getElementById(id);
function detach(){if(ref&&listener)ref.off('value',listener);ref=null;listener=null}
function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function message(text){el('qRatherStatus').textContent=text}
function controls(){el('qRatherA').disabled=busy||chosen!==null;el('qRatherB').disabled=busy||chosen!==null;el('qRatherNext').disabled=busy;el('qRatherCategory').disabled=busy}
function mark(value){chosen=value;for(const [i,id] of ['qRatherA','qRatherB'].entries())el(id).setAttribute('aria-pressed',String(i===value));controls()}
function results(snapshot){
 let a=0,b=0;snapshot.forEach(s=>{if(s.val()===0)a++;if(s.val()===1)b++});const total=a+b;
 if(!total){message('Henüz oy bulunamadı.');return}
 const pa=Math.round(a/total*100),pb=100-pa;
 el('qRatherResults').hidden=false;el('qRatherCount').textContent=total+' hesap oy verdi · Bu ikilemin katılımcıları';
 for(const [id,n,p] of [['A',a,pa],['B',b,pb]]){el('qRatherPercent'+id).textContent='%'+p+' · '+n+' oy';el('qRatherBar'+id).style.width=p+'%'}
 message('Oyun kaydedildi. Seçimin işaretli; şimdi diğerlerinin tercihini görebilirsin.');
}
function watch(q,version){
 detach();ref=db.ref('ratherVotes/'+q.id);listener=s=>{if(version===epoch)results(s)};
 ref.on('value',listener,()=>{if(version===epoch)message('Oyun kaydedildi, ancak oranlar yüklenemedi. Sonra tekrar deneyebilirsin.')});
}
async function render(){
 const version=++epoch;detach();chosen=null;busy=false;el('qRatherResults').hidden=true;
 const q=order[position];el('qRatherProgress').textContent=(position+1)+' / '+order.length+' · '+q.category;
 el('qRatherA').textContent=q.a;el('qRatherB').textContent=q.b;mark(null);
 message(user?'Seçimini yap; gerçek oy oranları ardından açılacak.':'Hemen oyna! Topluluk oylamasına katılmak için giriş yap.');
 el('qRatherLogin').hidden=!!user;
 if(!user)return;
 busy=true;controls();message('Önceki oyun kontrol ediliyor…');
 try{const s=await db.ref('ratherVotes/'+q.id+'/'+user.uid).once('value');if(version!==epoch)return;
 if(s.val()===0||s.val()===1){mark(s.val());watch(q,version)}else message('Seçimini yap; gerçek oy oranları ardından açılacak.');
 }catch(e){if(version===epoch)message('Oy durumu yüklenemedi. Bağlantını kontrol edip “Tekrar dene”ye bas.');}
 finally{if(version===epoch){busy=false;controls()}}
}
async function vote(value){
 if(busy||chosen!==null)return;
 if(!user){mark(value);message('Seçimin işaretlendi. Giriş yaptıktan sonra yeniden seçerek topluluk oylamasına katılabilirsin.');return}
 const version=epoch,q=order[position],uid=user.uid;busy=true;controls();message('Oyun kaydediliyor…');
 try{
  // Transaction preserves an existing ballot, including a simultaneous vote in another tab.
  const out=await db.ref('ratherVotes/'+q.id+'/'+uid).transaction(current=>current===null?value:undefined);
  if(version!==epoch)return;
  const actual=out.snapshot.val();if(actual!==0&&actual!==1)throw Error('invalid ballot');mark(actual);watch(q,version);
 }catch(e){if(version===epoch){mark(null);message('Oyun kaydedilemedi. Bağlantını kontrol edip yeniden seçebilirsin.')}}
 finally{if(version===epoch){busy=false;controls()}}
}
function reset(){const category=el('qRatherCategory').value;order=shuffled(questions.filter(q=>category==='all'||q.category===category));position=0;render()}
function init(){
 const host=document.createElement('section');host.id='qRather';host.setAttribute('aria-labelledby','qRatherTitle');
 host.innerHTML=`<style>
 #qRather{margin:24px 0 34px;padding:clamp(18px,4vw,32px);border:1px solid #78509e;border-radius:24px;background:linear-gradient(140deg,#291b45,#14101f);text-align:left;color:#f6efff}
 #qRather h3{font-size:clamp(24px,5vw,34px);margin:8px 0}#qRather p{line-height:1.6}#qRather .qr-top{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}
 #qRather select{max-width:100%;padding:12px;background:#20152f;color:white;border:1px solid #9477b1;border-radius:12px}
 #qRather .qr-choices{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}#qRather .qr-choice{min-height:150px;padding:24px 18px;border:2px solid #a181ee;border-radius:18px;background:#482875;color:white;font:inherit;font-size:20px;font-weight:700;cursor:pointer;overflow-wrap:anywhere}
 #qRather .qr-choice:last-child{background:#173d58;border-color:#64b6d2}#qRather .qr-choice[aria-pressed=true]{outline:3px solid #ffe392;outline-offset:4px}#qRather button:disabled{cursor:default;opacity:.8}#qRather :focus-visible{outline:3px solid #ffe392;outline-offset:4px}
 #qRather .qr-results{display:grid;grid-template-columns:1fr 1fr;gap:16px}#qRather .qr-track{height:10px;border-radius:10px;background:#382b48;overflow:hidden;margin-top:8px}#qRather .qr-fill{height:100%;background:#b98bff}#qRather .qr-results>div:last-child .qr-fill{background:#63d4ef}
 #qRather [hidden]{display:none!important}#qRatherStatus{min-height:3em}#qRather .qr-actions{display:flex;flex-wrap:wrap;gap:12px}#qRather .qr-actions button,#qRatherLogin{padding:12px 18px;border-radius:12px;border:1px solid #ad8cdb;background:#6533a0;color:white;cursor:pointer;font:inherit}
 #qRather .qr-note{color:#cbbbdc;font-size:13px;margin-bottom:0}@media(max-width:540px){#qRather .qr-choices{grid-template-columns:1fr}#qRather .qr-choice{min-height:112px;font-size:18px}}
 </style><div class="qr-top"><span>🤔 İKİ SEÇENEK, TEK KARAR</span><label>Kategori <select id="qRatherCategory"><option value="all">Hepsi</option>${[...new Set(rows.map(r=>r[0]))].map(c=>'<option>'+c+'</option>').join('')}</select></label></div>
 <h3 id="qRatherTitle">Hangisini seçerdin?</h3><p>Doğru cevap yok. İçinden geleni seç, diğer oyuncuların ne düşündüğünü keşfet.</p>
 <p id="qRatherProgress"></p><div class="qr-choices"><button class="qr-choice" id="qRatherA" type="button" aria-pressed="false"></button><button class="qr-choice" id="qRatherB" type="button" aria-pressed="false"></button></div>
 <div id="qRatherResults" hidden><div class="qr-results"><div><strong id="qRatherPercentA"></strong><div class="qr-track"><div class="qr-fill" id="qRatherBarA"></div></div></div><div><strong id="qRatherPercentB"></strong><div class="qr-track"><div class="qr-fill" id="qRatherBarB"></div></div></div></div><p id="qRatherCount"></p></div>
 <p id="qRatherStatus" role="status" aria-live="polite"></p><div class="qr-actions"><button type="button" id="qRatherNext">Sıradaki →</button><button type="button" id="qRatherRetry">Tekrar dene</button><button type="button" id="qRatherLogin">Oy vermek için giriş yap</button></div>
 <p class="qr-note">40 ikilem · Her hesap her ikileme bir kez oy verir; oy değiştirilemez. Oranlar yalnızca oy veren hesaplara aittir, bilimsel bir anket değildir. Seçimlerin topluluk toplamlarına katılır; burada adın ve profilin gösterilmez.</p>`;
 const games=el('v9Games');games.insertBefore(host,games.children[2]);
 el('qRatherA').onclick=()=>vote(0);el('qRatherB').onclick=()=>vote(1);el('qRatherCategory').onchange=reset;el('qRatherRetry').onclick=()=>{if(!busy)render()};
 el('qRatherNext').onclick=()=>{if(busy)return;if(position+1<order.length){position++;render()}else{reset();message('Bu tur bitti! Yeni bir sırayla devam edebilirsin.')}};
 el('qRatherLogin').onclick=()=>window.q19Open?.('login');reset();
 try{const app=firebase.apps.length?firebase.app():firebase.initializeApp(QUIZORA_FIREBASE_CONFIG);auth=app.auth();db=app.database();auth.onAuthStateChanged(u=>{user=u&&!u.isAnonymous?u:null;render()})}catch(e){message('Misafir olarak oynayabilirsin. Oy sistemi şu anda yüklenemedi.')}
}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init);else init();
})();

