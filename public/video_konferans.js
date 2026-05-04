import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, doc, addDoc, query, orderBy, limit, onSnapshot , getDoc, setDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.vk={};
const configuration = {
  iceServers:[
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" }
],
  iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;

let kayitDialog = null;
let girisDialog = null;
let gelenAramaDialog = null;

async function AramaYap(){ 
  await openUserMedia();
  createRoom()
}
window.vk.AramaYap=AramaYap;

async function openUserMedia(e) {

  if(!document.getElementById('videos')){
    var elemDiv = document.createElement('div');
    elemDiv.id='videos';
    elemDiv.style="position: fixed;left: 0;width: 100%;height: 100%;background-color:white;    z-index: 4;"
    elemDiv.innerHTML=`
      <i style="position: fixed; right: 0; z-index: 1;" onclick="document.getElementById('videos').style.display='none'" class="fa fa-remove w3-right w3-button w3-transparent w3-xxlarge"></i>
      <video id="remoteVideo" autoplay="" playsinline="" style="position: fixed;left: 0;top: 0;width: 100%;height: 100%;margin: 0;object-fit: contain;"></video>
      <video id="localVideo" muted="" autoplay="" playsinline="" style="position: fixed;right: 0;bottom: 5px;height:auto;max-width: 30%;max-height: 30%"></video>
    `;
    document.body.insertBefore(elemDiv,document.getElementById('mySidebar'));
  }else{
    document.getElementById('videos').style.display='block';
  }

  var stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: {
      width: { min: 640, ideal: 1920 },
      height: { min: 400, ideal: 1080 },
      aspectRatio: { ideal: 1.7777777778 },
    },
    audio: {
      sampleSize: 16,
      channelCount: 2,
    }});
  } catch (error) {}
  if(stream==null){
    try {
      stream = await navigator.mediaDevices.getUserMedia({video: false, audio: {noiseSuppression:true}});
    } catch (error) {}    
  }
  if(stream==null){
    try {stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});} catch (error) {}    
  }  
  
  
  document.querySelector('#localVideo').srcObject = stream;
  localStream = stream;
  remoteStream = new MediaStream();
  document.querySelector('#remoteVideo').srcObject = remoteStream;
    
}

var aranan_uid='z1DkY3pkC4MAVkiHqal4wVikPuD3';
async function createRoom() {

  const roomAdd = await addDoc(collection(db, "rooms"),{});
  console.log('roomRef',roomAdd.id);

  const roomRef = doc(collection(db,"rooms"),roomAdd.id)

  peerConnection = new RTCPeerConnection(configuration);
  registerPeerConnectionListeners();
  try {localStream.getTracks().forEach(track => { peerConnection.addTrack(track, localStream)}) } catch (error) {}

  const callerCandidatesCollection = collection(roomRef,'callerCandidates');
  peerConnection.addEventListener('icecandidate', event => {if (!event.candidate) {return} setDoc(callerCandidatesCollection,event.candidate.toJSON(), { merge: true }) });


  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);


  await setDoc(roomRef,{'offer': {type: offer.type, sdp: offer.sdp}});
  roomId = roomRef.id; 
  console.log('roomId',roomId);

  const aramaRef = await addDoc(collection(db, "aramalar"),{'arayan':uye.uid,'arayanAdi':(window.uyeDb && window.uyeDb.uyeAdi)?window.uyeDb.uyeAdi:uye.uid.substr(0,10),'aranan':aranan_uid,'arananAdi':'Kazdağı Doğal Taşlar','oda':roomRef.id,'durum':null,tarih: serverTimestamp()});

  peerConnection.addEventListener('track', event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  });


  const unsub = onSnapshot(doc(db, 'rooms', roomRef.id), async (doc) => {
    const data = doc.data();
    if (!peerConnection.currentRemoteDescription && data && data.answer) {
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await peerConnection.setRemoteDescription(rtcSessionDescription);
    }
  });

  const unsub2 = onSnapshot(collection(doc(db, 'rooms', roomRef.id),'calleeCandidates'), async (snapshot) => {
   snapshot.docChanges().forEach(async change => {
      if (change.type === 'added') {
        let data = change.doc.data();
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });

}
var aramalar=[];
function AramalarListesi(){
    const q = query(collection(db, "aramalar"),orderBy("tarih", "asc"),limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        var html='';

        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                var veri = change.doc.data();
                veri.id = change.doc.id;
                var ekle=true;
                for (let i = 0; i < aramalar.length; i++) {
                    if(aramalar[i].id===veri.id){
                        ekle=false;
                        break;
                    }
                }
                if(ekle===true){
                    aramalar.push(veri);
                    html+='<a href="javascript:void(0)" id="link_uye_adi" class="w3-bar-item w3-button w3-padding" onclick="alert("sonra")">' + veri.arayanAdi + ' ' + window.fb.convertTimestamp( veri.tarih) + '</a>';
                }
   
            }
        });
        console.log(aramalar);
        document.getElementById('konferans_gecmisi').innerHTML='<div class="w3-bar-item w3-button w3-padding">Konferans Geçmişi</div> '+html+'<br><br>';
    });
}
window.vk.AramalarListesi=AramalarListesi;


async function joinRoomById(roomId) {
  await openUserMedia();
  const roomRef = doc(collection(db, "rooms"), roomId);
  const docSnap = await getDoc(roomRef);

  if (docSnap.exists) {
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();
    try {
      localStream.getTracks().forEach(track => {peerConnection.addTrack(track, localStream);});      
    } catch (error) {}

    const calleeCandidatesCollection = collection(roomRef,'calleeCandidates');
    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      addDoc(calleeCandidatesCollection,event.candidate.toJSON());
    });

    peerConnection.addEventListener('track', event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    });

    // Code for creating SDP answer below
    const offer = docSnap.data().offer;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    const docSnap2 = await setDoc(roomRef,roomWithAnswer,{merge:true});

    const unsub2 = onSnapshot(collection(doc(db, 'rooms', roomRef.id),'calleeCandidates'), async (snapshot) => {
    snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listening for remote ICE candidates above
  }
}
window.vk.joinRoomById=joinRoomById;
async function hangUp(e) {
  const tracks = document.querySelector('#localVideo').srcObject.getTracks();
  tracks.forEach(track => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector('#localVideo').srcObject = null;
  document.querySelector('#remoteVideo').srcObject = null;
  document.querySelector('#cameraBtn').disabled = false;
  document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#hangupBtn').disabled = true;
  document.querySelector('#currentRoom').innerText = '';

  // Delete room on hangup
  if (roomId) {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(roomId);
    const calleeCandidates = await roomRef.collection('calleeCandidates').get();
    calleeCandidates.forEach(async candidate => {
      await candidate.ref.delete();
    });
    const callerCandidates = await roomRef.collection('callerCandidates').get();
    callerCandidates.forEach(async candidate => {
      await candidate.ref.delete();
    });
    await roomRef.delete();
  }

  document.location.reload(true);
}

function registerPeerConnectionListeners() {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}




async function gelenArama(dId,odaId,arUid,arAdi) {
  const db = firebase.firestore();
  document.getElementById('mesajVar').style.display='block';
  document.getElementById('mesajVar').innerHTML=arAdi+' Arıyor...<br><br><div class="mesajButon" onclick="aramaKabul(\''+dId+'\',\''+odaId+'\')">Kabul Et</div><div class="mesajButon" onclick="aramaRed(\''+dId+'\')">Reddet</div>';
  document.getElementById('myAudio').play()  
}
async function aramaKabul(dId,odaId){
  document.getElementById('mesajVar').style.display='none';
  await joinRoomById(odaId);
  db.collection("aramalar").doc(dId).update({'durum':'cevaplandi'})
  document.getElementById('myAudio').pause() 
}
function aramaRed(dId,odaId){
  document.getElementById('mesajVar').style.display='none';
  db.collection("aramalar").doc(dId).update({'durum':'reddedildi'})
  document.getElementById('myAudio').pause() 
}