// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, doc, addDoc, query, orderBy, limit, onSnapshot , getDoc, setDoc,collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
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

var uye,uyeDb;

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
        UrunleriGetir()

    }
});


async function UyeBilgileri(){
    if(uye){
        const docRef = doc(collection(db, "uyeler"), uye.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            uyeDb=docSnap.data();
            if(uye.isAnonymous){
                if(uyeDb['email']==undefined || uyeDb['uyeAdi']==undefined){
                    setDoc(docRef, {'email':uye.uid.substr(0,5),'uyeAdi':uye.uid.substr(0,5),'son': serverTimestamp()}, { merge: true });
                }
            }else{
                if(uyeDb['email']==undefined && uye.email){
                    setDoc(docRef, {'email':uye.email,'son': serverTimestamp()}, { merge: true });
                }
                if(uyeDb['uyeAdi']==undefined){
                    setDoc(docRef, {'email':uye.email.substr(0,5),'son': serverTimestamp()}, { merge: true });
                }
            }
        } else {
            
        }
    }
}

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
    var email=document.getElementById('logemail').value;
    var parola=document.getElementById('logpas').value
    //document.getElementById('fbbar').innerHTML='<div><img src="https://ongame.run/gelistirme/yukleniyor.svg"></div>';

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
        document.getElementById('hata_goster').innerHTML=error.message;

      });
}
window.fb.EmailGiris=EmailGiris;

function EmailKayit(email,parola){
    var email=document.getElementById('regemail').value;
    var parola=document.getElementById('regpas').value
    //document.getElementById('fbbar').innerHTML='<div><img src="https://ongame.run/gelistirme/yukleniyor.svg"></div>';
   
    createUserWithEmailAndPassword(auth, email, parola)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      document.getElementById('hata_goster').innerHTML=error.message;
      // ..
    });


}
window.fb.EmailKayit=EmailKayit;


function NotTok(){
    if(ttkn && uye && uye.uid){
        const docRef = doc(db, "uyeler", uye.uid);
        setDoc(docRef, {'ntok':ttkn,'email':uye.email,'son': serverTimestamp()}, { merge: true });
    }
    if(uye && uye.uid){
    
    }
}

function convertTimestamp(timestamp) {
    if(timestamp===null) return 'Yeni';
    if(timestamp===undefined) return '';
    var fark=Date.now()-(timestamp.seconds*1000);
    if(fark<500000){ return Math.floor(fark/1000)+' Sn'}
      let date = timestamp.toDate();
      let mm = date.getMonth()+1;
      let dd = date.getDate();
      let yyyy = date.getFullYear();
      let h = date.getHours();
      let m = date.getMinutes();
    m=m<10?'0'+m:m;
  
      date = mm + '/' + dd + '/' + yyyy + ' '+h+':'+m;
      return date;
}

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
        UrunleriEkranaBas()
    });
}
window.fb.UrunleriGetir=UrunleriGetir;

function UrunleriEkranaBas(){
    var urunler_list=[];
    var urun_say=0;
    for (let i = urunler.length-1; i > -1; i--) {
        if(filtre_tipi==='' || filtre_tipi===urunler[i].tipi){
            urunler_list.push(`
                <div class="w3-container urun" onclick="UrunTik('${urunler[i].id}')">
                    <img src="https://firebasestorage.googleapis.com/v0/b/kazdagidogaltaslar.firebasestorage.app/o/${urunler[i].foto1}?alt=media&token=18c486fd-a7c1-4cdb-8f41-b7f48315a974" style="width:100%" loading="lazy">
                    <p>${urunler[i].aciklama}<br><b>${urunler[i].fiyat}</b></p>
                </div>    
            `);
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
    document.getElementById('tek_urun_ic').innerHTML=
    `
        <img src="https://firebasestorage.googleapis.com/v0/b/kazdagidogaltaslar.firebasestorage.app/o/${urun.foto1}?alt=media&amp;token=18c486fd-a7c1-4cdb-8f41-b7f48315a974" style="width:80%;float:left">
        <p style="width:19%;float:right;font-size: 18px;height: auto !important;    background-color: black;    color: white;    padding: 1%;    margin: 0;">
            ${urun.aciklama}
            <br>
            <br>
            <b>${urun.fiyat}₺</b>
            <br>
            <br>
            <a href="#" class="w3-button w3-black w3-padding-large w3-large"><i class="fa fa-shopping-cart"></i></a>
        </p>
    `;

}
window.fb.TekUrun=TekUrun;
