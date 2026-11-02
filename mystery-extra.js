/* Standalone non-ranking mystery. Existing submitted daily answers are never rewritten. */
(function(){
'use strict';
function init(){
 const host=document.getElementById('qMystery');if(!host||document.getElementById('qmExtra'))return;
 const section=document.createElement('section');section.id='qmExtra';section.setAttribute('aria-labelledby','qmxTitle');
 section.innerHTML=`<style>
 #qmExtra{margin:24px 0;padding:clamp(17px,4vw,26px);border:1px solid #dfb65e;border-radius:20px;background:linear-gradient(135deg,#30223b,#121d2b);color:#f8f0ff}#qmExtra h4{font-size:26px;margin:10px 0}#qmExtra p,#qmExtra li{line-height:1.75}#qmExtra .qmx-tag{color:#f8d993;font-size:13px;font-weight:700}#qmExtra fieldset{border:0;padding:0;margin:20px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px}#qmExtra legend{margin-bottom:12px;font-weight:700}#qmExtra label{display:flex;gap:12px;align-items:center;padding:14px;border:1px solid #9c7baf;border-radius:12px;cursor:pointer}#qmExtra label:has(input:checked){background:#583575;border-color:#ffe392}#qmExtra input{width:20px;height:20px;accent-color:#c99aff}#qmExtra button{padding:12px 18px;border:1px solid #cfac77;border-radius:12px;background:#65437c;color:white;font:inherit;cursor:pointer}#qmExtra button:disabled{opacity:.5;cursor:default}#qmExtra :focus-visible{outline:3px solid #ffe392;outline-offset:3px}#qmxResult{margin-top:20px;padding:16px;border:1px solid #bda174;border-radius:14px}#qmExtra [hidden]{display:none!important}@media(max-width:500px){#qmExtra fieldset{grid-template-columns:1fr}}
 </style><span class="qmx-tag">🧩 EKSTRA ZOR DOSYA · SIRALAMA DIŞI</span><h4 id="qmxTitle">Gece Vardiyası: Kayıp Mühür</h4>
 <p>Mühür kaybolmadan önce Atlas, Bilge, Defne ve Kuzey dört farklı odaya birer kez girdi. Her kişi yalnız bir odaya girdi; kartların okutulma sırası ile kişilerin giriş sırası aynı. Mührü arşive giren kişinin aldığı biliniyor. Ancak kayıtların yalnız aşağıdaki parçaları kurtarıldı.</p>
 <ol><li>Gözlemevinin kartı, arşivin kartından tam iki sıra önce okutuldu.</li><li>Arşivin kartı en son okutulan kart değildi.</li><li>Atölyenin kartı, lobinin kartından önce okutuldu.</li><li>Bilge, Atlas’ın hemen ardından girdi.</li><li>Defne, Kuzey’den sonra ama Bilge’den önce girdi.</li></ol>
 <p><strong>Önce odaların sırasını, sonra kişilerin sırasını bul. Arşive kim girdi?</strong></p>
 <fieldset><legend>Cevabın</legend>${['Bilge','Defne','Atlas','Kuzey'].map((name,i)=>'<label><input type="radio" name="qmx-choice" value="'+i+'"><span>'+name+'</span></label>').join('')}</fieldset>
 <button id="qmxSubmit" type="button" disabled>Cevabımı kontrol et</button><div id="qmxResult" role="status" aria-live="polite" hidden></div><p class="qmx-tag">Herkes çözebilir. Bu ek dosya puan vermez ve günlük yarışma hakkını kullanmaz.</p>`;
 host.insertBefore(section,host.querySelector('.qm-layout'));
 const submit=section.querySelector('#qmxSubmit'),result=section.querySelector('#qmxResult'),inputs=[...section.querySelectorAll('input')];
 inputs.forEach(input=>input.onchange=()=>{submit.disabled=false});
 submit.onclick=()=>{
  const choice=inputs.find(i=>i.checked);if(!choice)return;
  inputs.forEach(i=>i.disabled=true);submit.disabled=true;result.hidden=false;result.replaceChildren();
  const title=document.createElement('strong');title.textContent=choice.value==='2'?'🔎 Doğru: Atlas.':'🔎 Doğru cevap: Atlas.';result.append(title);
  const steps=document.createElement('ol');for(const text of [
   'Arşiv son sırada değil. Gözlemevi ondan iki sıra önce olduğuna göre arşiv 3., gözlemevi 1. sırada olmalı.',
   'Geriye 2. ve 4. sıralar kalır. Atölye lobiden önce olduğundan 2. atölye, 4. lobi olur.',
   'Atlas ve Bilge art arda gelir. Kuzey de Defne de Bilge’den önce olmalı. Atlas–Bilge ikilisi ilk iki sıraya veya ortadaki iki sıraya sığamaz; son iki sıradadır.',
   'Kişiler bu yüzden Kuzey → Defne → Atlas → Bilge sırasındadır. Odalar Gözlemevi → Atölye → Arşiv → Lobi sırasındadır.',
   'İki sırayı eşleştirince 3. kişi Atlas, 3. oda arşivdir. Yalnız odaları veya yalnız kişileri sıralamak cevaba yetmez.'
  ]){const li=document.createElement('li');li.textContent=text;steps.append(li)}result.append(steps);
 };
}
if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();

