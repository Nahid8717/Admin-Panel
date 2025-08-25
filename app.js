// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Firebase Config (আপনার config বসান)
const firebaseConfig = {
  apiKey: "AIzaSyCrJ4yWoW7J13rd5aoNDBt_xihoK3oFMSM",
  authDomain: "dailytaskpro-74e03.firebaseapp.com",
  projectId: "dailytaskpro-74e03",
  storageBucket: "dailytaskpro-74e03.appspot.com",
  messagingSenderId: "380269223332",
  appId: "1:380269223332:web:1834b2533af421c495b531",
  measurementId: "G-9GHZEJ0QV7"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Page Load Check
if(!localStorage.getItem("admin")){
  window.location.href="login.html";
}

// Nav switch
window.show = function(id){
  document.querySelectorAll("section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}
show('dashboard');

// Logout
window.logout = function(){
  localStorage.removeItem("admin");
  window.location.href="login.html";
}

// Load Withdraw Requests
async function loadWithdraws(){
  const snap = await getDocs(collection(db,"withdrawRequests"));
  const list = document.getElementById("withdrawList");
  list.innerHTML="";
  snap.forEach(docu=>{
    let w = docu.data();
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${w.user}</td><td>${w.amount}</td><td>${w.method}</td><td>${w.status}</td>`;
    let td = document.createElement("td");
    let a = document.createElement("button"); a.textContent="Approve";
    let r = document.createElement("button"); r.textContent="Reject";
    a.onclick=()=>updateDoc(doc(db,"withdrawRequests",docu.id),{status:"Approved"}).then(loadWithdraws);
    r.onclick=()=>updateDoc(doc(db,"withdrawRequests",docu.id),{status:"Rejected"}).then(loadWithdraws);
    td.appendChild(a); td.appendChild(r);
    tr.appendChild(td);
    list.appendChild(tr);
  });
}
loadWithdraws();

// Load Users
async function loadUsers(){
  const snap = await getDocs(collection(db,"users"));
  const list = document.getElementById("userList");
  list.innerHTML="";
  snap.forEach(docu=>{
    let u = docu.data();
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${docu.id}</td><td>${u.name}</td><td>${u.balance}</td>`;
    let td = document.createElement("td");
    let b = document.createElement("button"); b.textContent="Block";
    b.onclick=()=>updateDoc(doc(db,"users",docu.id),{blocked:true}).then(loadUsers);
    td.appendChild(b);
    tr.appendChild(td);
    list.appendChild(tr);
  });
}
loadUsers();

// Load Settings
async function loadSettings(){
  const docRef = doc(db,"settings","main");
  const snap = await getDoc(docRef);
  let data = snap.exists()?snap.data():{};
  
  document.getElementById("minWithdraw").value=data.minimumWithdraw||0;

  // Methods
  const mlist=document.getElementById("methodList");
  mlist.innerHTML="";
  (data.methods||[]).forEach((m,i)=>{
    let li=document.createElement("li");
    li.textContent=m+" ";
    let del=document.createElement("button"); del.textContent="Delete";
    del.onclick=async()=>{
      data.methods.splice(i,1);
      await setDoc(docRef,data);
      loadSettings();
    }
    li.appendChild(del);
    mlist.appendChild(li);
  });

  // Ads
  const alist=document.getElementById("adsList");
  alist.innerHTML="";
  (data.ads||[]).forEach((ad,i)=>{
    let li=document.createElement("li");
    li.innerHTML=`<b>${ad.title}</b> (Reward: ${ad.reward}) <a href="${ad.link}" target="_blank">View</a>`;
    let del=document.createElement("button"); del.textContent="Delete";
    del.onclick=async()=>{
      data.ads.splice(i,1);
      await setDoc(docRef,data);
      loadSettings();
    }
    li.appendChild(del);
    alist.appendChild(li);
  });
}
loadSettings();

// Save Settings
window.saveMinWithdraw = async function(){
  const val=parseInt(document.getElementById("minWithdraw").value);
  const docRef=doc(db,"settings","main");
  const snap=await getDoc(docRef);
  let data=snap.exists()?snap.data():{};
  data.minimumWithdraw=val;
  await setDoc(docRef,data);
  alert("Minimum withdraw updated!");
}
window.addMethod = async function(){
  const val=document.getElementById("newMethod").value;
  if(!val) return;
  const docRef=doc(db,"settings","main");
  const snap=await getDoc(docRef);
  let data=snap.exists()?snap.data():{};
  data.methods=data.methods||[];
  data.methods.push(val);
  await setDoc(docRef,data);
  document.getElementById("newMethod").value="";
  loadSettings();
}
window.addAd = async function(){
  const title=document.getElementById("adTitle").value;
  const img=document.getElementById("adImage").value;
  const link=document.getElementById("adLink").value;
  const reward=parseInt(document.getElementById("adReward").value);
  if(!title||!link||!reward){alert("Fill all fields");return;}
  const docRef=doc(db,"settings","main");
  const snap=await getDoc(docRef);
  let data=snap.exists()?snap.data():{};
  data.ads=data.ads||[];
  data.ads.push({title,image:img,link,reward});
  await setDoc(docRef,data);
  document.getElementById("adTitle").value="";
  document.getElementById("adImage").value="";
  document.getElementById("adLink").value="";
  document.getElementById("adReward").value="";
  loadSettings();
    }
