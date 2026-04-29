let room = "";
let user = "";
let tokens = [];
let mapImg = null;

/* ENTRAR NA SALA */
function joinRoom() {
  room = document.getElementById("room").value;
  user = document.getElementById("username").value;

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
    let text = chatInput.value;

    db.ref(`rooms/${room}/chat`).push({
      user,
      text
    });

    chatInput.value = "";
  }
}

function listenData() {
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
let canvas = document.getElementById("mapCanvas");
let ctx = canvas.getContext("2d");

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

function draw() {
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

  ctx.fillText((dist/40).toFixed(1)+"m", x, y);
};

canvas.onmouseup = () => measuring = false;
