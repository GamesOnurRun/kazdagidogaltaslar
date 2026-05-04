import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, doc, addDoc, query, orderBy, limit, onSnapshot , getDoc, setDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getMessaging, getToken  } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getStorage, ref, uploadString } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyBbzi3yjPjrwya_bF_wA-gYcaybxHRuIjg",
  authDomain: "kazdagidogaltaslar.firebaseapp.com",
  projectId: "kazdagidogaltaslar",
  storageBucket: "kazdagidogaltaslar.firebasestorage.app",
  messagingSenderId: "531559401226",
  appId: "1:531559401226:web:2683c9040e2601871fdcf3",
  measurementId: "G-KTNRP151DF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
var messaging = getMessaging(app);
const auth = getAuth();
var ttkn;
window.fb={};

var uye,uyeDb,admin;
onAuthStateChanged(auth, (user) => {
    uye = user;
    console.log(uye);
    if(uye===null){
        AnonimGiris()
    }else{
        window.uye = user;
        NotTok();
        //UyeDurumEkran()
        document.getElementById('load').innerHTML = 'Firebase Yüklendi.';
        
        UyeBilgileri();
        UrunleriGetir();
    }
    KullaniciTipineGoreAyarlar();
});


if(location.host.indexOf('127.0.0.1')==-1 && location.host.indexOf('localhost')==-1){
    getToken(messaging, { vapidKey: 'BF698lgrhV6LGFaqgqR82zug9bLMU_slcahjnVYrkN9CUvPdIhacSZizhr9Mf543bYBb06lqZtI_gBLX4M88-YU' }).then((currentToken) => {
        if (currentToken) {
            ttkn = currentToken;
            NotTok();
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
        }).catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
    });
}
function NotTok(){
    if(ttkn && uye && uye.uid){
        if(uyeDb.ttkn!=ttkn) UyeBilgileriKaydet(uye.uid,{'ntok':ttkn});
    }
}

function KullaniciTipineGoreAyarlar(){
    if(uye===null){
        document.getElementById('link_uye_adi').innerHTML = '<img src="img/yukleniyor.svg">';
        document.getElementById('link_uye_ol').style.display='none';
        document.getElementById('link_uye_giris').style.display='none';
        document.getElementById('link_uye_cikis').style.display='none';
        document.getElementById('link_yeni_urun_olustur').style.display='none';
    }else{
        if(uye.isAnonymous){
            document.getElementById('link_uye_ol').style.display='block';
            document.getElementById('link_uye_giris').style.display='block';
            document.getElementById('link_uye_cikis').style.display='none';
            document.getElementById('link_yeni_urun_olustur').style.display='none';
        }else{
            document.getElementById('uye_yeni_modal').style.display='none';
            document.getElementById('uye_giris_modal').style.display='none';

            document.getElementById('link_uye_ol').style.display='none';
            document.getElementById('link_uye_giris').style.display='none';
            document.getElementById('link_uye_cikis').style.display='block';
            if(admin){
                document.getElementById('link_yeni_urun_olustur').style.display='block';
            }
        }
    }
}



async function UyeBilgileri(){
    if(uye){
        const docRef = doc(collection(db, "uyeler"), uye.uid);
        const docSnap = await getDoc(docRef);
        
        document.getElementById('link_uye_adi').innerHTML = uye.uid.substr(0,5);

        if (docSnap.exists()) {
            uyeDb=docSnap.data();
            window.uyeDb=uyeDb;
            SiparisListesiGoster();
            document.getElementById('link_uye_adi').innerHTML = uyeDb.uyeAdi===undefined?uye.uid.substr(0,5):uyeDb.uyeAdi;
            window.YuklemeTamamlandi('uye');
        }

        const docRef2 = doc(collection(doc(collection(db, "ayarlar"), 'ayarlar'),'adminler'),uye.uid);
        const docSnap2 = await getDoc(docRef2);

        if (docSnap2.exists()) {
            admin=docSnap2.data()['isAdmin'];
            window.vk.AramalarListesi();
            KullaniciTipineGoreAyarlar();
        }
    }
}

async function UyeBilgileriKaydet(uye_uid,veri){

    if(uye_uid===null){
        uye_uid=uye.uid;
    }
    veri.son=serverTimestamp();
    
    console.log('UyeBilgileriKaydet',uye_uid,veri);

    const docRef = doc(collection(db, "uyeler"), uye_uid);
    await setDoc(docRef, veri, { merge: true });
    UyeBilgileri();
}
fb.UyeBilgileriKaydet=UyeBilgileriKaydet;


async function Kaydet(veri){
    veri.uye_uid=uye.uid;
    veri.tarih=serverTimestamp();
    addDoc(collection(db, "urunler"), veri);

    //const docRef2 = await addDoc(collection(doc(collection(db, "ongame"), uye.uid), oyun),veri);
}

window.fb.Kaydet=Kaydet;

async function ResimKaydet(img,dosya_adi){
    try {
        if(img.files[0].type!=='' && img.files[0].type.substr(0,5)==='image'){
            const storage = getStorage();
            var resim_adi = DosyaAdiDuzenle(dosya_adi) + Math.floor(Math.random()*958678473)+'.'+img.files[0].type.substr(6);
            const storageRef = ref(storage, resim_adi);

            var base = await toBase64(img.files[0])

            uploadString(storageRef, base, 'data_url').then((snapshot) => {
                console.log('Uploaded a data_url string!');
            });
            return resim_adi;
        }else{
            alert('Seçili dosya fotoğraf olmalıdır.');
            return false;
        }
    } catch (error) {
        console.log(error);
        alert('Hata, tekrar deneyiniz.');
        return false;
    }

}
window.fb.ResimKaydet=ResimKaydet;

function DosyaAdiDuzenle(veri){
    veri = veri.replaceAll(' ','_');
    veri = veri.replaceAll('.','_');
    return veri;
}
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

function Cikis(){
    //document.getElementById('fbbar').innerHTML='<div><img src="https://ongame.run/gelistirme/yukleniyor.svg"></div>';
    signOut(auth).then(() => {
    // Sign-out successful.
    }).catch((error) => {
    // An error happened.
    });
}
window.fb.Cikis=Cikis;

function AnonimGiris(){
    //document.getElementById('fbbar').innerHTML='<div><img src="https://ongame.run/gelistirme/yukleniyor.svg"></div>';

    signInAnonymously(auth)
    .then(() => {
        // Signed in..
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error);
        // ...
    });
}
window.fb.AnonimGiris=AnonimGiris;



function EmailGiris(email,parola){
    signInWithEmailAndPassword(auth, email, parola)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        document.getElementById('uye_yeni_hata_goster').innerHTML = error.message;

      });
}
window.fb.EmailGiris=EmailGiris;

function EmailKayit(email,parola){
    createUserWithEmailAndPassword(auth, email, parola)
    .then((userCredential) => {
      const user = userCredential.user;
        UyeBilgileriKaydet(user.uid,{'uyeAdi':document.getElementById('uye_yeni_isim').value,'email':email});
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      document.getElementById('uye_yeni_hata_goster').innerHTML = error.message;
      // ..
    });


}
window.fb.EmailKayit=EmailKayit;


function convertTimestamp(timestamp) {
    if(timestamp===null) return 'Yeni';
    if(timestamp===undefined) return '';
    var fark=Date.now()-(timestamp.seconds*1000);
    if(fark<500000){ 
        return 'Yeni';
        //return Math.floor(fark/1000)+' Sn';
    }
    let date = timestamp.toDate();
    let mm = date.getMonth()+1;
    let dd = date.getDate();
    let yyyy = date.getFullYear();
    let h = date.getHours();
    let m = date.getMinutes();
    m=m<10?'0'+m:m;
  
    date = dd + '/' + mm + '/' + yyyy + ' '+h+':'+m;
    return date;
}
window.fb.convertTimestamp=convertTimestamp;

var urunler=[];
function UrunleriGetir(){
    const q = query(collection(db, "urunler"),orderBy("tarih", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                var veri = change.doc.data();
                veri.id = change.doc.id;
                var ekle=true;
                for (let i = 0; i < urunler.length; i++) {
                    if(urunler[i].id===veri.id){
                        ekle=false;
                        break;
                    }
                }
                if(ekle===true){
                    urunler.push(veri);
                }

                //if(convertTimestamp(change.doc.data()['tarih']).indexOf('Sn')>-1){
                //    document.getElementById('urunler').innerHTML+='<div id="online_'+change.doc.id+'" class="'+(convertTimestamp(change.doc.data()['son']).indexOf('Sn')>-1?'online_online':'online_offline')+'">'+change.doc.data()['uyeAdi']+' '+convertTimestamp(change.doc.data()['son'])+'</div>'+document.getElementById('online_text').innerHTML;
                //}else{
                //    document.getElementById('urunler').innerHTML+='<div id="online_'+change.doc.id+'" class="'+(convertTimestamp(change.doc.data()['son']).indexOf('Sn')>-1?'online_online':'online_offline')+'">'+change.doc.data()['uyeAdi']+' '+convertTimestamp(change.doc.data()['son'])+'</div>';
                //}               
            }
        });
        console.log(urunler);
        UrunleriEkranaBas();
        window.YuklemeTamamlandi('urunler');
    });
}
window.fb.UrunleriGetir=UrunleriGetir;

function UrunleriEkranaBas(){
    var urunler_list=[];
    var urun_say=0;
    for (let i = urunler.length-1; i > -1; i--) {
        if(filtre_tipi==='' || filtre_tipi===urunler[i].tipi){
            var urun_html='';
            if(convertTimestamp(urunler[i].tarih)=='Yeni'){
                urun_html=`
                <a href="index.html?urun=${urunler[i].id}" onclick="UrunTik('${urunler[i].id}');return false;">
                    <div class="w3-container urun">
                        <div class="w3-display-container">
                        <img src="https://firebasestorage.googleapis.com/v0/b/kazdagidogaltaslar.firebasestorage.app/o/${urunler[i].foto1}?alt=media&token=18c486fd-a7c1-4cdb-8f41-b7f48315a974" style="width:100%" loading="lazy">
                        <span class="w3-tag w3-display-topleft">Yeni</span>
                        <div class="w3-display-middle w3-display-hover">
                            <button class="w3-button w3-black">Hemen Satın Al <i class="fa fa-shopping-cart"></i></button>
                        </div>
                        <p>${urunler[i].aciklama}<br><b>${urunler[i].fiyat}₺</b></p>
                        </div>
                    </div>
                </a>
                `;
            }else{
                urun_html=`
                    <a href="index.html?urun=${urunler[i].id}" onclick="UrunTik('${urunler[i].id}');return false;">
                        <div class="w3-container urun">
                            <img src="https://firebasestorage.googleapis.com/v0/b/kazdagidogaltaslar.firebasestorage.app/o/${urunler[i].foto1}?alt=media&token=18c486fd-a7c1-4cdb-8f41-b7f48315a974" style="width:100%" loading="lazy">
                            <p>${urunler[i].aciklama}<br><b>${urunler[i].fiyat}₺</b></p>
                        </div> 
                    </a> 
                `;
            }
            urunler_list.push(urun_html);
            urun_say++;
        }
    }
    
    var urunlerHTML='';
    for (let i = 0; i < urunler_list.length; i++) {
        if((i+1)===urunler_list.length){
            urunlerHTML+='<div class="w3-col l3 s6">' + urunler_list[i] + '</div>';
        }else{
            urunlerHTML+='<div class="w3-col l3 s6">' + urunler_list[i] + urunler_list[i + 1] + '</div>';
            i++;
        }
        if(filtre_tipi==='' && i===7){
            break;

        }
    }
    document.getElementById('liste_aciklama').innerHTML = urun_say===0?'Ürün Bulunamadı.':(urun_say + ' Ürün Bulundu.');
    document.getElementById('urunler').innerHTML=urunlerHTML;

    //unsubscribe();
}

var filtre_tipi='';
function UrunleriFiltrele(veri){
    filtre_tipi=veri;
    UrunleriEkranaBas();
}
window.fb.UrunleriFiltrele=UrunleriFiltrele;

function TekUrun(veri){
    var urun=null;
    for (let i = 0; i < urunler.length; i++) {
        if(urunler[i].id===veri){
            urun=urunler[i];
            break;
        }  
    }
    var secenekler='';
    if(urun.tipi==='Bileklik'){
        secenekler=`
        <select  id="sepet_urun_secenek" class="w3-input w3-border">
            <option value="22 cm.">22 cm.</option>
            <option value="24 cm.">24 cm.</option>
            <option value="26 cm.">26 cm.</option>
            <option value="28 cm.">28 cm.</option>
        </select>
        `;
    }

    document.getElementById('tek_urun_ic').innerHTML=
    `   <img src="https://firebasestorage.googleapis.com/v0/b/kazdagidogaltaslar.firebasestorage.app/o/${urun.foto1}?alt=media&amp;token=18c486fd-a7c1-4cdb-8f41-b7f48315a974" style="width:80%;float:left">
        <p style="width:19%;float:right;font-size: 18px;height: auto !important;    background-color: black;    color: white;    padding: 1%;    margin: 0;">
            ${urun.aciklama}
            <br>
            <br>
            <b>${urun.fiyat}₺</b>
            <br>
            ${secenekler}
            <button type="submit" class="w3-button w3-block w3-black" onclick="SiparisListesineEkle('${urun.id}','sepet_urun_secenek')"><i class="fa fa-shopping-cart"></i></button>
        </p>
    `;
    window.yedek_href=location.href;
    window.history.replaceState( {} , urun.aciklama, 'index.html?urun=' + veri );

}
window.fb.TekUrun=TekUrun;

function SiparisListesiGoster(){
    document.getElementById('siparis_listesi_adet').innerHTML = '';

    if(uyeDb.siparis_listesi){
        document.getElementById('siparis_listesi_adet').innerHTML = uyeDb.siparis_listesi.length;
        var html='';
        var toplam_adet=0;
        var toplam_tutar=0;
        for (let i = 0; i < uyeDb.siparis_listesi.length; i++) {
            for (let ii = 0; ii < urunler.length; ii++) {
                if(urunler[ii].id === uyeDb.siparis_listesi[i].uid){
                    html+='<div class="urun yarim" style="margin:10px"><img src="https://firebasestorage.googleapis.com/v0/b/kazdagidogaltaslar.firebasestorage.app/o/'+urunler[ii].foto1+'?alt=media&token=18c486fd-a7c1-4cdb-8f41-b7f48315a974" style="width:27%" loading="lazy"></div>';       
                    html+='<div class="urun yarim" style="margin:10px"><p>İD: ' + uyeDb.siparis_listesi[i].uid + '<br>'+(uyeDb.siparis_listesi[i].detay ?'Detay: ' + uyeDb.siparis_listesi[i].detay + '<br>' : '')+'Adet: '+uyeDb.siparis_listesi[i].adet + '<br>Fiyat: '+urunler[ii].fiyat + '₺<br>Tutar: '+(urunler[ii].fiyat*uyeDb.siparis_listesi[i].adet) + '₺</p></div>';       

                    toplam_adet+=uyeDb.siparis_listesi[i].adet ;
                    toplam_tutar+=(urunler[ii].fiyat*uyeDb.siparis_listesi[i].adet);
                    break;
                }
            }
        }
        document.getElementById('siparis_listesi_ic').innerHTML = html+'<div class="urun yarim" style="margin:10px"></div><div class="urun yarim" style="margin:10px">Toplam Adet: '+toplam_adet+'<br>Toplam Tutar: '+toplam_tutar+'₺</div>';
    }
}
window.fb.SiparisListesiGoster=SiparisListesiGoster;

async function SiparisListesiEkle(veri,detay){
    if(!uyeDb.siparis_listesi){
        uyeDb.siparis_listesi=[];
    }
    var ekle=true;
    for (let i = 0; i < uyeDb.siparis_listesi.length; i++) {
        if(uyeDb.siparis_listesi[i].uid===veri){
            uyeDb.siparis_listesi[i].adet++;
            uyeDb.siparis_listesi[i].detay=detay?detay:'';
            ekle=false;
            break;
        }        
    }
    if(ekle===true) {
        uyeDb.siparis_listesi.push({'uid':veri,'adet':1});
    }
    UyeBilgileriKaydet(uye.uid,{'siparis_listesi':uyeDb.siparis_listesi});
    SiparisListesiGoster()
}
window.fb.SiparisListesiEkle=SiparisListesiEkle;