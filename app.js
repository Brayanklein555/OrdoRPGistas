window.onload = () => {

const chatInput = document.getElementById("chatInput");
const chatLog = document.getElementById("chatLog");
const mapUpload = document.getElementById("mapUpload");
const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

let room = "";
let user = "";
let tokens = [];
let mapImg = null;

/* ENTRAR NA SALA */
function joinRoom() {
  room = document.getElementById("room").value.trim();
  user = document.getElementById("username").value.trim();

  if (!room || !user) {
    alert("Preencha nome e sala!");
    return;
  }

  chatLog.innerHTML = ""; // limpa chat ao entrar
  listenData();
}

/* TEMA */
function toggleTheme() {
  document.body.classList.toggle("ordem");
  document.body.classList.toggle("dnd");
}

/* CHAT */
function sendMsg(e) {
  if (e.key === "Enter") {

    if (!room) return alert("Entre em uma sala primeiro!");

    let text = chatInput.value;

    db.ref(`rooms/${room}/chat`).push({
      user,
      text
    });

    chatInput.value = "";
  }
}

/* ESCUTA DADOS */
function listenData() {

  db.ref(`rooms/${room}/chat`).off(); // evita duplicação
  db.ref(`rooms/${room}/tokens`).off();

  db.ref(`rooms/${room}/chat`).on("child_added", snap => {
    let msg = snap.val();

    let div = document.createElement("div");
    div.innerText = `${msg.user}: ${msg.text}`;
    chatLog.appendChild(div);
  });

  db.ref(`rooms/${room}/tokens`).on("value", snap => {
    tokens = Object.values(snap.val() || {});
    draw();
  });
}

/* MAPA */
mapUpload.onchange = e => {
  let img = new Image();
  img.src = URL.createObjectURL(e.target.files[0]);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    mapImg = img;
    draw();
  };
};

/* DESENHO */
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (mapImg) ctx.drawImage(mapImg,0,0);

  tokens.forEach(t => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(t.x,t.y,10,0,Math.PI*2);
    ctx.fill();
  });
}

/* TOKENS */
canvas.onclick = e => {

  if (!room) return alert("Entre em uma sala!");

  let rect = canvas.getBoundingClientRect();

  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  db.ref(`rooms/${room}/tokens`).push({x,y});
};

/* RÉGUA */
let measuring = false;
let start = null;

canvas.oncontextmenu = e => {
  e.preventDefault();
  measuring = true;

  let rect = canvas.getBoundingClientRect();
  start = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

canvas.onmousemove = e => {
  if (!measuring) return;

  draw();

  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(x,y);
  ctx.stroke();

  let dist = Math.sqrt((x-start.x)**2 + (y-start.y)**2);

  ctx.fillStyle = "white";
  ctx.fillText((dist/40).toFixed(1)+"m", x, y);
};

canvas.onmouseup = () => measuring = false;

};
