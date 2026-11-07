/* Original reflection prompts, with no clinical scoring or diagnosis. */
(function(){
'use strict';
const tests=[
 ['Kaygı ve Endişe','🧠','Belirsizlik karşısındaki düşüncelerini keşfet.',[
  ['Birden fazla konu seni endişelendirdiğinde dikkatini başka bir işe verebilir misin?',['Kolayca başka bir işe geçebilirim.','Biraz toparlanınca odaklanabilirim.','Endişeler aklımı sık sık böler.','Başka bir işe odaklanmakta çok zorlanırım.']],
  ['Sonucunu bilmediğin bir durumla karşılaştığında ilk yaklaşımın hangisine daha yakın?',['Bilgi toplar, bildiklerimle ilerlerim.','Biraz düşünür, sonra bekleyebilirim.','Olasılıkları tekrar tekrar düşünürüm.','Belirsizlik yüzünden karar veremem.']],
  ['Bir plan yaparken olumsuz ihtimaller düşüncelerinde ne kadar yer kaplar?',['Olası sorunları kısaca değerlendiririm.','Olumlu ve olumsuz ihtimalleri dengelerim.','Daha çok ters gidebilecek şeyleri düşünürüm.','En kötü ihtimal diğer düşüncelerin önüne geçer.']],
  ['Endişeliyken yapman gereken bir işe nasıl başlarsın?',['İşi küçük adımlara bölüp başlarım.','Biraz sakinleşip başlayabilirim.','Başlamak için uzun süre kendimi ikna ederim.','Endişem yüzünden işe başlayamam.']],
  ['Gergin hissettiğinde gevşemek senin için nasıldır?',['Bana iyi gelen bir yöntemle rahatlarım.','Biraz uğraşınca gevşeyebilirim.','Rahatlasam bile gerginlik geri gelir.','Gerginliğimi azaltmakta çok zorlanırım.']],
  ['Kaygılandığın bir görev önündeyken genellikle ne yaparsın?',['Uygun bir adımla göreve yaklaşırım.','Destek alarak ya da hazırlanarak ilerlerim.','Görevi başka bir zamana ertelerim.','Görevden tamamen kaçınmak isterim.']],
  ['Küçük bir aksilik yaşadığında onu nasıl değerlendirirsin?',['Çözülebilecek bir ayrıntı olarak görürüm.','Rahatsız olur, sonra ölçülü bakabilirim.','Daha büyük sorunların işareti gibi gelir.','Sonuçlarını gözümde çok büyütürüm.']],
  ['Endişelerin günlük planlarını nasıl etkiler?',['Planlarımı sürdürebilirim.','Bazı adımları değiştirerek devam ederim.','Planlarımı sık sık ertelerim.','Ne yapacağımı belirlemekte zorlanırım.']]
 ]],
 ['Duygusal İyi Oluş','🌤️','Günlük yaşamında sana iyi gelenleri fark et.',[
  ['Kendinle baş başa kaldığında iç dünyanı nasıl tarif edersin?',['Genellikle huzurlu ve dengeli hissederim.','Karışık hissetsem de rahatlayabilirim.','İçimde bir huzursuzluk taşırım.','Ne hissettiğimi tarif etmekte zorlanırım.']],
  ['Sevdiğin bir etkinliğe katıldığında nasıl hissedersin?',['İlgimi çeker ve keyif alırım.','Başlamak zor gelse de sonra iyi gelir.','Eskisi kadar keyif vermeyebilir.','Şu sıralar keyif aldığım bir etkinlik bulamıyorum.']],
  ['Güne başlarken günlük işlerine yaklaşımın hangisine yakın?',['Yapacaklarıma istekle başlayabilirim.','Küçük bir başlangıç beni harekete geçirir.','Başlamak için kendimi zorlamam gerekir.','İşlere yönelmekte belirgin şekilde zorlanırım.']],
  ['Yakınlarınla vakit geçirmek sana nasıl gelir?',['Kendimi bağlı ve desteklenmiş hissederim.','Kiminle olduğuma göre değişir.','İyi gelse de kolayca yorulabilirim.','Şu sıralar insanlarla görüşmek istemeyebilirim.']],
  ['Günlük enerjini nasıl değerlendirirsin?',['Yapmak istediklerime çoğunlukla yeter.','Öncelik seçersem yeterli olur.','Çabuk yorulur, sık mola isterim.','Basit işler için bile enerji bulmak zor gelir.']],
  ['Küçük, güzel bir ayrıntıyla karşılaştığında ne olur?',['Fark eder, tadını çıkarırım.','Dikkatim çekilirse keyif alırım.','Çoğu zaman fark etmeden geçerim.','Fark etsem de bende pek karşılık bulmaz.']],
  ['Geleceği düşündüğünde hangi ifade sana daha yakın?',['Merak ettiğim ve beklediğim şeyler var.','Belirsiz olsa da güzel olasılıklar görüyorum.','Olumlu bir şey hayal etmekte zorlanıyorum.','Şu an geleceği düşünmek istemiyorum.']],
  ['Senin için anlamlı bir uğraşa hayatında nasıl yer açarsın?',['Bilinçli olarak zaman ayırırım.','Fırsat buldukça ilgilenirim.','İstesem de sürekli geri plana atarım.','Bana neyin anlamlı geldiğini henüz keşfediyorum.']]
 ]],
 ['Algılanan Stres','🌪️','Sorumluluklarınla kurduğun ilişkiyi gözden geçir.',[
  ['Yapılacak işlerin biriktiğinde ne yaparsın?',['Öncelik sırası koyarak ilerlerim.','Biraz bunalsam da bir plan yaparım.','Nereden başlayacağımı seçmekte zorlanırım.','İşlerin yükü altında donup kalırım.']],
  ['Beklenmedik bir değişiklik olduğunda nasıl karşılık verirsin?',['Yeni duruma göre planımı düzenlerim.','Önce gerilir, sonra uyum sağlarım.','Toparlanmak için epey desteğe ihtiyaç duyarım.','Değişiklik bütün düzenimi bozar.']],
  ['Bir işi yetiştirmen gerektiğinde zamanını nasıl kullanırsın?',['Süreyi bölüp adım adım ilerlerim.','Sonlara doğru hızlanmam gerekebilir.','Yetişmeyeceğini düşünerek telaşlanırım.','Telaş yüzünden ne yapacağımı şaşırırım.']],
  ['Günlük beklentiler sana nasıl hissettirir?',['Genellikle yönetilebilir görünür.','Bazı günler zorlar ama denge kurabilirim.','Çoğu beklenti baskı gibi gelir.','Benden istenenler kapasitemi aşıyor gibi gelir.']],
  ['Dinlenmek için ara verdiğinde zihnin ne yapar?',['İşlerden uzaklaşıp molaya katılabilirim.','İşler aklıma gelse de molaya dönebilirim.','Yapılacaklar zihnimi meşgul eder.','Dinlenirken suçluluk duyarım.']],
  ['Birden fazla sorumluluğun olduğunda nasıl ilerlersin?',['Birini bitirip diğerine geçerim.','İşleri paylaşır ya da yardım isterim.','Hepsine aynı anda yetişmeye çalışırım.','Birini seçmekte zorlanıp işleri bekletirim.']],
  ['Küçük aksilikler karşısında sabrın nasıl etkilenir?',['Genellikle sakin kalabilirim.','Biraz gerilsem de toparlanırım.','Normalden daha çabuk tepki veririm.','Tepkimi durdurmakta çok zorlanırım.']],
  ['Sorumlulukların arasında kendine nasıl alan açarsın?',['Kendime ayırdığım zamanı korurum.','Kısa molalarla denge kurarım.','Kendime ayırdığım zamanı ilk ben iptal ederim.','Kendi ihtiyaçlarımı tamamen ertelerim.']]
 ]],
 ['Tekrarlayan Düşünceler','💭','Aklına takılan düşüncelerle ilişkini incele.',[
  ['Geçmişte yaşadığın bir olay yeniden aklına geldiğinde ne yaparsın?',['Bir anlam çıkarıp başka konuya geçerim.','Bir süre düşünür, sonra bırakabilirim.','Aynı ayrıntıları yeniden ele alırım.','Olay zihnimde dönüp durur.']],
  ['Bir konuşma bittikten sonra söylediklerini nasıl değerlendirirsin?',['Genel olarak bırakır, günüme devam ederim.','Dikkatimi çeken bir noktaya kısaca bakarım.','Nasıl anlaşılmış olabileceğimi tekrar düşünürüm.','Her cümleyi zihnimde yeniden kurarım.']],
  ['İstemediğin bir düşünce aklına takıldığında ona yaklaşımın nedir?',['Geldiğini fark eder, dikkatimi yönlendiririm.','Biraz zaman verince başka şeye geçebilirim.','Düşünceyle uzun süre tartışırım.','Düşünceyi bırakamıyormuşum gibi hissederim.']],
  ['Henüz yaşanmamış bir sorunu düşünürken hangisi sana daha yakın?',['Gerekli bir önlem düşünüp bırakırım.','Birkaç ihtimali değerlendiririm.','Olumsuz senaryoları ayrıntılandırırım.','Aynı senaryoyu tekrar tekrar yaşar gibi olurum.']],
  ['Aklına takılan bir konu günlük işlerin sırasında ne yapar?',['İşlerime odaklanmama pek engel olmaz.','Dikkatim dağılsa da geri dönebilirim.','İşlerimi sık sık bölmeme yol açar.','İşlerimi tamamlamamı güçleştirir.']],
  ['Küçük bir karar verirken nasıl ilerlersin?',['Yeterli bilgiyle karar veririm.','Kısa bir karşılaştırma yaparım.','Seçenekleri gereğinden uzun tartarım.','Karar verdikten sonra bile tekrar sorgularım.']],
  ['Yatmaya hazırlanırken günün düşünceleriyle ne olur?',['Günü geride bırakabilirim.','Aklımdakileri toparlayınca sakinleşirim.','Düşünceler uykuya geçişimi zorlaştırır.','Aynı konulara dönmekten dinlenemem.']],
  ['Bir sorunu uzun süre düşündüğünde sonuç genellikle ne olur?',['Uygulayabileceğim bir sonraki adımı bulurum.','Çözemesem de ara verebilirim.','Yeni bir çözüm bulmadan düşünmeyi sürdürürüm.','Düşündükçe daha da sıkışmış hissederim.']]
 ]],
 ['Duygusal Farkındalık','❤️','Duygularını nasıl tanıdığını keşfet.',[
  ['Biri sana nasıl hissettiğini sorduğunda hangisi daha yakın?',['Duygumu belirgin kelimelerle anlatabilirim.','Biraz düşününce adını koyabilirim.','Daha çok “iyi” veya “kötü” diyebilirim.','Ne hissettiğimi bulmakta zorlanırım.']],
  ['Duyguların gün içinde değiştiğinde bunu nasıl fark edersin?',['Değişimi olurken fark ederim.','Biraz sonra farkına varırım.','Ancak bir davranışım değişince anlarım.','Çoğunlukla başka biri söylediğinde fark ederim.']],
  ['Bir duygunun neyle ilişkili olduğunu anlamak senin için nasıldır?',['Olayla duygum arasında bağlantı kurarım.','Biraz düşünmek bağlantıyı bulmama yardım eder.','Birçok neden arasında kararsız kalırım.','Neyin tetiklediğini anlamakta zorlanırım.']],
  ['Aynı olay için iki farklı duygu hissettiğinde nasıl düşünürsün?',['İkisine de yer verebilirim.','Karışık gelse de ikisini ayırt edebilirim.','Hangisinin gerçek duygu olduğuna karar vermeye çalışırım.','Duygularımı birbirinden ayıramam.']],
  ['Bir duygu bedeninde kendini gösterdiğinde ne fark edersin?',['Nerede ve nasıl hissettiğimi ayırt ederim.','Dikkat edersem bazı işaretleri bulurum.','Daha çok genel bir rahatsızlık hissederim.','Bedenimdeki değişimleri pek fark etmem.']],
  ['Zorlandığında hangi duyguya sahip olduğunu nasıl anlarsın?',['Öfke, üzüntü veya kaygı gibi ayrımları yapabilirim.','Kendime zaman verince netleşir.','Birkaç duygu birbirine karışır.','Sadece kötü hissettiğimi söyleyebilirim.']],
  ['Güvendiğin birine hislerini anlatırken ne olur?',['İhtiyaçlarımı ve duygumu anlatabilirim.','Doğru kelimeleri arayarak paylaşırım.','Anlatmak isterim ama cümle kurmakta zorlanırım.','Genellikle ne diyeceğimi bilemem.']],
  ['Bir olayla ilgili düşüncen ve duygun arasındaki farkı nasıl görürsün?',['Aklımdan geçeni ve hissettiğimi ayırabilirim.','Bir örnek üzerinde düşününce ayırabilirim.','İkisini sıklıkla aynı şey gibi anlatırım.','Aralarındaki fark bana net gelmez.']]
 ]],
 ['Öz Şefkat','🪞','Zorlandığında kendine nasıl davrandığını fark et.',[
  ['Hata yaptığında kendine ilk söylediğin şey hangisine yakın?',['Hata yapabilirim; şimdi neyi düzeltebilirim?','Canım sıkıldı ama bu hatadan öğrenebilirim.','Bunu nasıl yaptım diye kendime yüklenirim.','Kendimi bütünüyle yetersiz görürüm.']],
  ['Bir konuda zorlandığında bunu nasıl yorumlarsın?',['İnsanların zaman zaman zorlanabileceğini hatırlarım.','Yalnız olmadığımı hatırlamak bana iyi gelir.','Başkalarının benden daha kolay başardığını düşünürüm.','Bu güçlüğü sadece ben yaşıyormuşum gibi gelir.']],
  ['İçinden kendinle konuşurken kullandığın dil nasıldır?',['Anlayışlı ve destekleyicidir.','Gerçekçi olmaya çalışırım.','Daha çok eksiklerimi vurgularım.','Oldukça sert ve suçlayıcıdır.']],
  ['İşler istediğin gibi gitmediğinde toparlanmak için kendine ne tanırsın?',['Dinlenmek ve yeniden denemek için alan açarım.','Kısa bir mola vermeye izin veririm.','Mola vermek konusunda kendimi suçlu hissederim.','Hemen toparlanmam gerektiğini dayatırım.']],
  ['Kendini başkalarıyla karşılaştırdığında hangi yaklaşım sana yakın?',['Koşullarımızın farklı olabileceğini hatırlarım.','Kendi ilerlememe dönmeye çalışırım.','Daha çok geride kaldığım yerlere bakarım.','Başkalarının başarısını kendi eksikliğim gibi görürüm.']],
  ['Bir eksikliğini fark ettiğinde güçlü yanlarını da görebilir misin?',['Evet, ikisini birlikte değerlendirebilirim.','Biraz düşününce güçlü yanlarımı hatırlarım.','Eksikliğim diğer özelliklerimi gölgeler.','O anda iyi yaptığım hiçbir şey aklıma gelmez.']],
  ['Kötü geçen bir günün ardından kendini nasıl değerlendirirsin?',['Zor bir gündü; bu beni bütünüyle tanımlamaz.','Canım sıkılır ama kendime haksızlık etmemeye çalışırım.','Günün kötü gitmesini kendime bağlarım.','Kendimle ilgili genel ve sert yargılara varırım.']],
  ['Bir arkadaşına göstereceğin anlayışı kendine de gösterebilir misin?',['Çoğunlukla aynı anlayışla yaklaşabilirim.','Hatırladığımda kendime daha yumuşak davranırım.','Arkadaşlarıma kendimden daha anlayışlıyımdır.','Kendime anlayış göstermeyi hak etmiyormuşum gibi gelir.']]
 ]],
 ['Sosyal Ortamlarda Kaygı','👥','Sosyal durumlarda sana yakın gelen tepkileri keşfet.',[
  ['Bir grup önünde konuşman gerektiğinde hangisi sana daha yakın?',['Düşüncemi rahatça paylaşabilirim.','Heyecanlansam da konuşabilirim.','Konuşmadan önce oldukça gerilirim.','Söz almaktan kaçınmak isterim.']],
  ['Yeni biriyle tanışacağında aklından ne geçer?',['Birbirimizi tanımayı merak ederim.','Biraz çekingen olsam da iletişim kurarım.','Yanlış bir şey söylemekten endişelenirim.','Tanışmamak için bir yol ararım.']],
  ['Başkalarının yanında hata yaptığında nasıl düşünürsün?',['İnsanların hata yapabileceğini düşünürüm.','Utanırım ama konuya devam edebilirim.','İnsanların beni nasıl değerlendirdiğine takılırım.','Bu hatanın uzun süre hatırlanacağını düşünürüm.']],
  ['Yeni bir arkadaş grubuna katılman gerektiğinde ne yaparsın?',['Selam verip konuşmaya dahil olurum.','Önce ortamı gözler, sonra katılırım.','Birinin beni çağırmasını beklerim.','Katılmak istesem de uzak dururum.']],
  ['Bir konuda fikrin varken söz almak senin için nasıldır?',['Uygun bir anda fikrimi söylerim.','Biraz cesaret toplayıp paylaşırım.','Söyleyeceklerimi içimden tekrarlar ama beklerim.','Genellikle konuşmaktan vazgeçerim.']],
  ['İnsanların sana baktığını fark ettiğinde nasıl hissedersin?',['Bunu doğal karşılayabilirim.','Biraz dikkat kesilir, sonra rahatlarım.','Davranışlarımı fazlasıyla kontrol ederim.','Görünmez olmak ya da ortamdan ayrılmak isterim.']],
  ['Sosyal bir buluşmadan sonra neye odaklanırsın?',['Genel deneyime ve güzel anlara bakarım.','Dikkatimi çeken bir iki anı düşünürüm.','Yanlış anlaşılmış olabileceğim anları incelerim.','Konuşmalarımı tekrar tekrar sorgularım.']],
  ['Eleştirilebileceğin bir etkinliğe davet edildiğinde ne yaparsın?',['İlgimi çekiyorsa katılırım.','Biraz hazırlıkla katılmayı denerim.','Katılmakla kaçınmak arasında uzun süre kalırım.','Eleştirilmemek için katılmamayı seçerim.']]
 ]],
 ['Duygu Düzenleme','🧩','Yoğun duygular karşısındaki yaklaşımını incele.',[
  ['Duyguların yoğunlaştığında kısa bir mola verebilir misin?',['Durup kendime alan açabilirim.','Bunu hatırlayınca mola verebilirim.','Mola vermem gerektiğini geç fark ederim.','O anda durmakta çok zorlanırım.']],
  ['Tepki vermeden önce duygunu anlamak için ne yaparsın?',['Ne hissettiğimi kendime sorarım.','Biraz sakinleşince düşünürüm.','Çoğunlukla tepki verdikten sonra anlarım.','Duygumla tepkimi ayırmakta zorlanırım.']],
  ['Zorlandığında destek istemeye yaklaşımın nasıldır?',['Güvendiğim birine anlatabilirim.','Önce kendim dener, gerekirse paylaşırım.','Anlatmak istesem de çekinirim.','Her şeyi tek başıma çözmem gerektiğini düşünürüm.']],
  ['Yoğun duygular yaşarken günlük işlerini nasıl sürdürürsün?',['Tempomu ayarlayıp gerekli adımları atabilirim.','Öncelikleri azaltarak ilerlerim.','İşlere dönmek için uzun süre beklerim.','Günlük işlerim tamamen durabilir.']],
  ['Sakinleşmek istediğinde nasıl bir yol izlersin?',['Bana iyi geldiğini bildiğim bir yöntem kullanırım.','Birkaç yöntem deneyerek uygun olanı bulurum.','Ne yapacağımı bilsem de uygulamak zor gelir.','Bana neyin yardımcı olduğunu bilmiyorum.']],
  ['Bir tartışmanın ardından ne yaparsın?',['Sakinleşip konuşmayı yeniden değerlendirebilirim.','Biraz zaman geçince iletişime dönebilirim.','Duygularım uzun süre yoğun kalır.','Tartışmadan kopup günlük hayatıma dönmekte zorlanırım.']],
  ['Zor bir duygunun içindeyken onun değişebileceğini düşünür müsün?',['Duyguların değişebildiğini hatırlayabilirim.','Bunu bilsem de kendime hatırlatmam gerekir.','O duygunun hep süreceği hissine kapılırım.','O anda başka bir his hayal etmekte zorlanırım.']],
  ['Zor bir duyguyla başa çıkmak için seçtiğin yol hangisine yakın?',['Kendime iyi gelen ve beni koruyan bir yol ararım.','Kısa bir mola ya da güvenilir bir destek seçerim.','Duyguyu bastırıp hiç yokmuş gibi davranırım.','Nasıl başa çıkacağımı bulmakta zorlanırım.']]
 ]],
 ['Uyku ve Dinlenme','🌙','Uykuya hazırlanma ve dinlenme alışkanlıklarına bak.',[
  ['Uyumak için yatağa girdiğinde genellikle ne olur?',['Uykum geldiğinde rahatça uykuya geçerim.','Biraz sakinleşmeye ihtiyaç duyarım.','Uyumak istesem de uzun süre uyanık kalırım.','Uykuya ne zaman geçeceğimi kestiremem.']],
  ['Gece uyandığında yeniden uykuya dönmek senin için nasıldır?',['Genellikle kesintisiz uyurum.','Uyansam da yeniden uyuyabilirim.','Yeniden uyumak zaman alır.','Uyandıktan sonra tekrar uyumakta çok zorlanırım.']],
  ['Sabah uyandığında kendini nasıl hissedersin?',['Dinlenmiş ve güne hazır hissederim.','Biraz açıldıktan sonra iyi hissederim.','Uykumu tam alamamış gibi hissederim.','Uyumuş olsam da belirgin yorgunluk hissederim.']],
  ['Gün içindeki uykululuk günlük akışını nasıl etkiler?',['Uyanık ve dikkatli kalabilirim.','Ara verdiğimde toparlanabilirim.','Dikkatimi sürdürmekte zorlanırım.','Uykulu hissetmek yapacaklarımı ciddi biçimde böler.']],
  ['Uyuma ve uyanma düzenini nasıl tarif edersin?',['Bana uygun, benzer bir düzenim var.','Düzenim değişse de geri dönebilirim.','Uyku saatlerim sık sık kayar.','Belirgin bir uyku düzenim yok.']],
  ['Yatmadan önce zihnini sakinleştirmek için ne yaparsın?',['Bana iyi gelen bir akşam rutinim var.','Işıkları ya da etkinlikleri azaltırım.','Günü düşünmeyi bırakmakta zorlanırım.','Zihnim en çok yatağa girince hareketlenir.']],
  ['Yeterince dinlenmediğinde dikkatini nasıl fark edersin?',['Belirgin bir değişiklik fark etmem.','Biraz yavaşlar ama işimi sürdürebilirim.','Odaklanmak ve ayrıntıları izlemek zorlaşır.','Basit işleri bile takip etmekte zorlanırım.']],
  ['Gün içinde dinlenmeye ihtiyaç duyduğunda ne yaparsın?',['İhtiyacımı fark edip uygun bir ara veririm.','İşlerimin arasına kısa molalar koyarım.','Mola ihtiyacımı son ana kadar ertelerim.','Dinlenmek istesem de kendime alan açamam.']]
 ]],
 ['Psikolojik Dayanıklılık','🌱','Aksilikler karşısındaki kaynaklarını keşfet.',[
  ['Bir planın işe yaramadığında ne yaparsın?',['Başka bir çözüm yolu ararım.','Biraz durup yeni bir deneme yaparım.','Aynı yöntemde ısrar edebilirim.','Ne yapacağımı bilemeyip vazgeçmek isterim.']],
  ['Zor bir durumla tek başına baş edemediğinde nasıl davranırsın?',['İhtiyacım olan desteği açıkça isterim.','Güvendiğim birine danışırım.','Yardım istemek için epey beklerim.','Destek istemeyi çok zor bulurum.']],
  ['Planların değiştiğinde yeni duruma nasıl uyum sağlarsın?',['Hedefimi koruyup yolumu değiştirebilirim.','Biraz zamana ihtiyaç duyarım.','Eski plana bağlı kalmak isterim.','Değişiklik ilerlememi tamamen durdurur.']],
  ['Büyük bir hedefe ilerlerken küçük adımlarını nasıl görürsün?',['Küçük ilerlemeleri fark edip önemserim.','Hatırlatınca neleri başardığımı görebilirim.','Daha çok henüz yapamadıklarıma bakarım.','Sonuca ulaşmadıkça ilerlediğimi hissedemem.']],
  ['Karmaşık bir sorunla karşılaştığında ilk adımın nedir?',['Sorunu küçük ve somut parçalara ayırırım.','En kolay başlayabileceğim noktayı seçerim.','Her şeyi aynı anda çözmeye çalışırım.','Nereden başlayacağımı bulamam.']],
  ['Zor dönemlerde sana iyi gelen etkinliklere nasıl yaklaşırsın?',['Onlara küçük de olsa yer açarım.','Fırsat bulunca yeniden yönelirim.','Yapmak istesem de hep ertelerim.','Bana neyin iyi geldiğini hatırlamakta zorlanırım.']],
  ['Daha önce aştığın bir güçlüğü düşündüğünde ne görürsün?',['İşe yarayan beceri ve desteklerimi görebilirim.','Biraz düşününce öğrendiklerimi hatırlarım.','Daha çok ne kadar zor olduğunu hatırlarım.','O deneyimden yararlanmakta zorlanırım.']],
  ['Bir şey yolunda gitmediğinde farklı bir yol denemek senin için nasıldır?',['Yeni bir yaklaşımı denemeye açığım.','Güvendiğim birinin fikriyle deneyebilirim.','Yanlış yapmaktan çekinip bildiğim yolda kalırım.','Başka bir yol olabileceğini görmekte zorlanırım.']]
 ]]
];
const interpretations=[
 [
  ['Endişeyle başa çıkma yolların öne çıkıyor','Cevaplarının çoğunda, endişe yaşasan da dikkatini yönlendirebildiğini veya küçük adımlarla ilerleyebildiğini anlattın. Bu özet, seçtiğin başa çıkma yollarını öne çıkarıyor.'],
  ['Endişenin zorladığı anlar öne çıkıyor','Cevaplarının çoğunda, endişelerin odağını, kararlarını veya günlük planlarını zorlayabildiğini belirttin. Bu başlık, bu deneyimleri anlatan seçimlerinin daha fazla olmasından kaynaklanıyor.'],
  ['Endişeye yaklaşımın duruma göre değişiyor','Bazı cevaplarında endişeyle ilerleyebildiğini, bazılarında ise zorlandığını anlattın. İki yöndeki cevapların eşit olduğu için tek bir yaklaşımı baskın göstermiyoruz.']
 ],
 [
  ['Sana iyi gelen deneyimler öne çıkıyor','Cevaplarında keyif, yakınlık, enerji veya anlam bulabildiğini anlatan seçimler daha fazla. Sonuç, bu ankette yaşamının sana iyi gelen yönlerini daha çok işaretlemene dayanıyor.'],
  ['İyi hissetmekte zorlandığın alanlar öne çıkıyor','Cevaplarında keyif bulmak, enerji toplamak veya hislerini tarif etmek konusunda güçlük ya da belirsizlik anlatan seçimler daha fazla. Bu özet, seçtiğin deneyimleri görünür kılıyor.'],
  ['İyi oluş deneyimin farklı yönler taşıyor','Hem sana iyi gelen deneyimleri hem de zorlandığın veya belirsiz hissettiğin alanları eşit sayıda işaretledin. Bu yüzden sonuç iki tarafı birlikte yansıtıyor.']
 ],
 [
  ['Sorumluluklarını yönetme yolların öne çıkıyor','Çoğu cevabında öncelik koyma, mola verme, yardım isteme veya planını düzenleme gibi yolları seçtin. Sonuç, yükünle başa çıkabildiğini anlattığın cevapların daha fazla olmasına dayanıyor.'],
  ['Günlük yükün zorladığı anlar öne çıkıyor','Çoğu cevabında birikmiş işler, zaman baskısı veya kendine alan açmakta zorlanma anlattın. Sonuç başlığı bu seçimlerinin ortak yönünü özetliyor.'],
  ['Günlük yükünü yönetirken farklı deneyimler yaşıyorsun','Bazı alanlarda işleri yönetebildiğini, bazılarında ise yük altında zorlandığını eşit sayıda belirttin. Bu özet, tek bir etiket yerine bu farklılığı gösteriyor.']
 ],
 [
  ['Düşüncelerinden uzaklaşabilme yolların öne çıkıyor','Cevaplarının çoğunda düşünceleri değerlendirdikten sonra ara verebildiğini veya bir sonraki adıma geçebildiğini anlattın. Sonuç bu seçimlerin ortak yönünden oluşuyor.'],
  ['Aynı düşüncelere dönme deneyimin öne çıkıyor','Çoğu cevabında geçmiş konuşmaları, olasılıkları veya kararları tekrar ele aldığını ve bırakmakta zorlanabildiğini anlattın. Bu başlık, seçtiğin bu deneyimleri özetliyor.'],
  ['Düşüncelerle ilişkin duruma göre değişiyor','Bazı cevapların düşüncelerden uzaklaşabildiğini, bazıları aynı konulara döndüğünü anlatıyor. Bu iki tür seçimin eşit olduğu için karma bir yanıt örüntüsü görünüyor.']
 ],
 [
  ['Duygularını tanımlayabilmen öne çıkıyor','Cevaplarında duygularını adlandırabildiğini, değişimleri fark edebildiğini veya düşünce ile duyguyu ayırabildiğini anlatan seçimler daha fazla. Sonucun bu ortak anlatımdan oluşuyor.'],
  ['Duygularını netleştirmekte zorlandığın alanlar öne çıkıyor','Cevaplarında hislerini adlandırmak, nedenlerini ayırt etmek veya birine anlatmak konusunda güçlük belirten seçimler daha fazla. Bu özet bu alanları görünür kılıyor.'],
  ['Bazı duyguların net, bazıları daha karışık geliyor','Duygularını ayırt edebildiğini ve zorlandığını anlatan cevapları eşit sayıda seçtin. Sonuç bu farklı durumları birlikte yansıtıyor.']
 ],
 [
  ['Kendine anlayışla yaklaşman öne çıkıyor','Çoğu cevabında hata ve güçlükler karşısında kendine alan tanımayı, daha dengeli konuşmayı veya güçlü yanlarını hatırlamayı seçtin. Bu başlık bu cevaplarının ortak temasını anlatıyor.'],
  ['Kendine yüklenme eğilimini anlatan cevapların öne çıkıyor','Çoğu cevabında hatalar, karşılaştırmalar veya kötü günler karşısında kendine sert yaklaşabildiğini anlattın. Sonuç bu seçimlerinin ortak yönüne dayanıyor; seni bütünüyle tanımlamıyor.'],
  ['Kendine yaklaşımın duruma göre değişiyor','Bazı cevaplarında anlayışlı, bazılarında daha sert bir iç konuşma anlattın. İki yöndeki seçimlerin eşit olduğu için sonuç bu değişkenliği öne çıkarıyor.']
 ],
 [
  ['Sosyal ortamlara katılabilmen öne çıkıyor','Çoğu cevabında heyecan veya çekingenlik olsa bile konuşmaya ve insanlarla iletişime katılabildiğini belirttin. Bu başlık bu seçimlerinin daha fazla olmasından doğuyor.'],
  ['Sosyal durumlarda çekindiğin anlar öne çıkıyor','Cevaplarında değerlendirilme endişesi, söz almaktan kaçınma veya konuşmaları tekrar düşünme anlatan seçimler daha fazla. Sonuç bu belirttiğin deneyimlere dayanıyor.'],
  ['Sosyal rahatlığın duruma göre değişiyor','İletişime katılabildiğin ve daha çok çekindiğin durumları eşit sayıda işaretledin. Bu yüzden sonuç tek bir sosyal özellik yerine farklı deneyimlerini birlikte gösteriyor.']
 ],
 [
  ['Duygularına alan açma yolların öne çıkıyor','Cevaplarında mola verme, destek alma veya duygularını anlamaya çalışma gibi yolları seçmen daha sık. Sonuç bu ankette başvurabildiğini anlattığın yolları vurguluyor.'],
  ['Yoğun duygularla başa çıkmakta zorlandığın anlar öne çıkıyor','Çoğu cevabında durmak, sakinleşmek veya uygun bir başa çıkma yolu bulmak konusunda güçlük belirttin. Bu başlık bu deneyimlerini anlatan seçimlerinin ortak yönünü özetliyor.'],
  ['Duygularını yönetirken farklı yollar ve güçlükler yaşıyorsun','Hem başvurabildiğin yolları hem de zorlandığın anları eşit sayıda seçtin. Sonuç bu iki tarafı birlikte ele alıyor.']
 ],
 [
  ['Dinlenmeyi destekleyen deneyimlerin öne çıkıyor','Çoğu cevabında uykuya geçiş, günlük enerji, düzen veya mola verme konusunda daha rahat deneyimler anlattın. Sonucun bu seçimlerin ortak yönünden oluşuyor.'],
  ['Uyku ve dinlenmede zorlandığın alanlar öne çıkıyor','Cevaplarında uykuya geçiş, dinlenmiş uyanma, dikkat veya molaya alan açma konusunda güçlük anlatan seçimler daha fazla. Bu özet hangi alanları işaretlediğini görünür kılıyor.'],
  ['Uyku ve dinlenme deneyimin farklı yönler taşıyor','Daha rahat dinlendiğin ve zorlandığın durumları eşit sayıda belirttin. Bu nedenle sonuç tüm uyku deneyimini tek bir başlıkla değerlendirmiyor.']
 ],
 [
  ['Zorluklar karşısında kullanabildiğin kaynaklar öne çıkıyor','Cevaplarında alternatif arama, destek isteme, küçük adımları görme veya önceki deneyimlerinden yararlanma anlatan seçimler daha fazla. Sonuç bu belirttiğin kaynakları öne çıkarıyor.'],
  ['Zorluklar karşısında ilerlemekte güçlük yaşadığın alanlar öne çıkıyor','Çoğu cevabında yeni bir yol bulmak, destek istemek veya ilerlediğini fark etmek konusunda zorlandığını anlattın. Bu özet, bu seçimlerinin daha fazla olmasına dayanıyor.'],
  ['Bazı durumlarda kaynaklarına ulaşabiliyor, bazılarında zorlanıyorsun','Kullanabildiğin yolları ve güçlük yaşadığın alanları eşit sayıda seçtin. Sonuç bu farklı deneyimleri birlikte yansıtıyor.']
 ]
];
let current=-1,step=0,answers=[];
const root=()=>document.getElementById('psyContent');
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function button(text,action,cls){const b=node('button',text,cls);b.type='button';b.onclick=action;return b}
function focusQuestion(){const q=root().querySelector('.psy-question,.psy-result-title');if(q)q.focus({preventScroll:true});const p=root().querySelector('.psy-panel');if(p){const nav=document.querySelector('.v9-nav');window.scrollTo({top:Math.max(0,p.getBoundingClientRect().top+scrollY-(nav?.getBoundingClientRect().height||0)-16),behavior:'instant'})}}
window.qPsychologyTests=tests.map((t,i)=>({id:String(i),title:t[0]}));
window.qPsychologyStart=function(id){const i=Number(id);if(!Number.isInteger(i)||!tests[i])return;current=i;step=0;answers=[];openV9Page('psychology');draw();focusQuestion()};
function list(){current=-1;step=0;answers=[];const grid=node('div',undefined,'psy-grid');tests.forEach((t,i)=>{const card=node('article',undefined,'psy-card');card.append(node('h3',t[1]+' '+t[0]),node('p',t[2]+' · '+t[3].length+' soru'),button('Değerlendirmeye Başla →',()=>{current=i;step=0;answers=[];draw();focusQuestion()}));grid.append(card)});root().replaceChildren(grid)}
function draw(){
 const t=tests[current],question=t[3][step],panel=node('div',undefined,'psy-panel');
 panel.append(node('h2',t[1]+' '+t[0]),node('p','Günlük deneyimlerini düşünerek sana en yakın cevabı seç. Doğru veya yanlış cevap yok.','psy-muted'));
 const progress=node('p','Soru '+(step+1)+' / '+t[3].length,'psy-progress');progress.setAttribute('role','status');panel.append(progress);
 const q=node('h3',question[0],'psy-question');q.tabIndex=-1;q.id='psyQuestion';panel.append(q);
 const choices=node('div',undefined,'psy-answers');choices.setAttribute('role','group');choices.setAttribute('aria-labelledby','psyQuestion');
 const actions=node('div',undefined,'psy-actions');
 const next=button(step===t[3].length-1?'Yanıt özetini gör →':'Sonraki soru →',()=>{if(!Number.isInteger(answers[step]))return;if(step<t[3].length-1){step++;draw();focusQuestion()}else finish()});next.disabled=!Number.isInteger(answers[step]);
 const selected=node('p',Number.isInteger(answers[step])?'Seçimin: '+String.fromCharCode(65+answers[step]):'Devam etmek için bir şık seç.','psy-selection');selected.setAttribute('aria-live','polite');
 question[1].forEach((text,i)=>{const b=button(String.fromCharCode(65+i)+') '+text,()=>{answers[step]=i;choices.querySelectorAll('button').forEach((item,j)=>item.setAttribute('aria-pressed',String(j===i)));selected.textContent='Seçimin: '+String.fromCharCode(65+i);next.disabled=false},'psy-choice');b.setAttribute('aria-pressed',String(answers[step]===i));choices.append(b)});
 const previous=button('← Önceki soru',()=>{if(step>0){step--;draw();focusQuestion()}});previous.disabled=step===0;
 actions.append(previous,next,button('Anketlere dön',list));panel.append(choices,selected,actions,node('p','Özgün bir farkındalık anketidir; klinik ölçek veya tanı aracı değildir. Yanıtların kaydedilmez.','psy-muted'));root().replaceChildren(panel);
}
function finish(){
 const t=tests[current];if(!t||answers.length!==t[3].length||!Array.from(answers).every(a=>Number.isInteger(a)&&a>=0&&a<4))return;window.qDailyChallenge?.complete('reflection:'+current);
 const panel=node('div',undefined,'psy-panel psy-result');
 const easier=answers.filter(a=>a<2).length,harder=answers.length-easier,kind=easier>harder?0:harder>easier?1:2;
 const [title,explanation]=interpretations[current][kind],hero=node('section',undefined,'psy-result-hero');
 hero.dataset.pattern=['resources','difficulties','mixed'][kind];
 hero.append(node('p',t[1]+' '+t[0]+' · Sonucun','psy-result-kicker'));
 const heading=node('h2',title,'psy-result-title');heading.tabIndex=-1;hero.append(heading,node('p',explanation,'psy-result-description'));panel.append(hero);
 window.qAddResultCardControls?.(hero,{kind:'reflection',test:t[0],result:title,summary:explanation});
 const why=node('section',undefined,'psy-result-why');why.append(node('h3','Bu sonuç neden çıktı?'));
 const method=kind===2
  ?'8 cevabının 4’ünde daha rahat ilerlediğin, 4’ünde ise zorlandığın veya belirsiz kaldığın deneyimleri seçtin. Sayılar eşit olduğu için sonuç her iki yönü de içeriyor.'
  :'8 cevabının '+(kind===0?easier:harder)+' tanesinde '+(kind===0?'daha rahat ilerlediğin veya başvurabildiğin yolları anlatan':'zorlandığın ya da belirsiz kaldığın deneyimleri anlatan')+' seçenekleri işaretledin. Başlık, daha çok seçtiğin bu cevapların ortak temasını özetliyor.';
 why.append(node('p',method),node('p','Sonuca yansıyan cevaplarından örnekler:','psy-muted'));
 const evidence=node('ul',undefined,'psy-result-evidence');
 const matching=answers.map((answer,i)=>({answer,i})).filter(({answer})=>kind===2?true:kind===0?answer<2:answer>=2);
 const examples=kind===2?[...matching.filter(x=>x.answer<2).slice(0,2),...matching.filter(x=>x.answer>=2).slice(0,2)]:matching.slice(0,3);
 examples.forEach(({answer,i})=>{const item=node('li');item.append(node('strong',t[3][i][0]),node('p','“'+t[3][i][1][answer]+'”'));evidence.append(item)});why.append(evidence);panel.append(why);
 panel.append(node('p','Bu sonuç bir klinik puan veya tanı değildir. Yalnızca seçtiğin cevapların betimleyici bir özetidir; kalıcı bir kişilik özelliği ya da hastalık şiddeti göstermez. Yanıtların kaydedilmez.','psy-warning'));
 const review=node('details',undefined,'psy-result-details');review.append(node('summary','Tüm soruları ve cevaplarımı gör'));
 const listEl=node('ol',undefined,'psy-review');t[3].forEach((question,i)=>{const item=node('li');item.append(node('h3',question[0]),node('p',String.fromCharCode(65+answers[i])+') '+question[1][answers[i]]));listEl.append(item)});review.append(listEl);panel.append(review);
 const actions=node('div',undefined,'psy-actions');actions.append(button('← Yanıtlarımı düzenle',()=>{step=t[3].length-1;draw();focusQuestion()}),button('Anketlere dön',list));panel.append(actions);root().replaceChildren(panel);focusQuestion();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',list);else list();
})();
