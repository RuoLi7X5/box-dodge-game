// 游戏主循环和入口
import { Player } from "./player.js";
import { Ball } from "./ball.js";
import { setupJoystick, getMoveDir, isMobileDevice } from "./joystick.js";

const WIDTH = 500,
  HEIGHT = 400,
  PLAYER_SIZE = 20,
  BALL_SIZE = 16,
  // 速度参数改为“每秒移动画布宽度的百分比”
  PLAYER_SPEED_RATIO_BASE = 0.22,
  BALL_SPEED_RATIO_BASE = 0.18,
  // 速度倍率，后续可暴露给用户控制
  PLAYER_SPEED_MULTIPLIER = 2.5, // 方块速度倍率
  BALL_SPEED_MULTIPLIER = 4, // 小球速度倍率
  PLAYER_SPEED_RATIO = PLAYER_SPEED_RATIO_BASE * PLAYER_SPEED_MULTIPLIER,
  BALL_SPEED_RATIO = BALL_SPEED_RATIO_BASE * BALL_SPEED_MULTIPLIER,
  BALL_INTERVAL = 900;

let canvas, ctx, scoreLabel, restartBtn, joystick, stick, startBtn;
let player, balls, score, running, moveDir, lastBallTime;
let isMobile;

function getDom() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  scoreLabel = document.getElementById("scoreLabel");
  restartBtn = document.getElementById("restartBtn");
  joystick = document.getElementById("joystick");
  stick = document.getElementById("joystick-stick");
  startBtn = document.getElementById("startBtn");
}

function resizeCanvas() {
  if (window.innerWidth < 700) {
    let w = Math.min(window.innerWidth * 0.98, 700);
    let h = (w * HEIGHT) / WIDTH;
    canvas.width = w;
    canvas.height = h;
  } else {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
  }
  resetGame();
}

function resetGame() {
  player = new Player(canvas, WIDTH, PLAYER_SIZE);
  balls = [];
  score = 0;
  running = true;
  moveDir = getMoveDir();
  lastBallTime = Date.now();
  restartBtn.style.display = "none";
  scoreLabel.textContent = "得分: 0";
  if (isMobile) {
    setTimeout(() => {
      setupJoystick();
    }, 50);
  }
}

function spawnBall() {
  if (!running) return;
  let r = Math.random();
  let ballSpeed = canvas.width * BALL_SPEED_RATIO;
  if (r < 0.5) {
    let dir = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
    balls.push(new Ball(dir, canvas, WIDTH, BALL_SIZE, ballSpeed));
  } else {
    let edge = ["left", "right", "top", "bottom"][
      Math.floor(Math.random() * 4)
    ];
    let x, y;
    if (edge === "left") {
      x = 0;
      y = Math.random() * canvas.height;
    } else if (edge === "right") {
      x = canvas.width;
      y = Math.random() * canvas.height;
    } else if (edge === "top") {
      x = Math.random() * canvas.width;
      y = 0;
    } else {
      x = Math.random() * canvas.width;
      y = canvas.height;
    }
    let dx = player.x - x,
      dy = player.y - y;
    let dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1e-6);
    let vx = (ballSpeed * dx) / dist;
    let vy = (ballSpeed * dy) / dist;
    balls.push(
      new Ball("custom", canvas, WIDTH, BALL_SIZE, ballSpeed, vx, vy, x, y)
    );
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx, canvas, WIDTH, PLAYER_SIZE);
  balls.forEach((b) => b.draw(ctx, canvas, WIDTH, BALL_SIZE));
  if (!running) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.floor(canvas.height / 10)}px 微软雅黑,Arial`;
    ctx.fillStyle = "#fff";
    ctx.fillText("游戏结束", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = `${Math.floor(canvas.height / 18)}px 微软雅黑,Arial`;
    ctx.fillStyle = "yellow";
    ctx.fillText(
      "最终得分: " + Math.floor(score / 10),
      canvas.width / 2,
      canvas.height / 2 + 20
    );
    ctx.font = `${Math.floor(canvas.height / 22)}px 微软雅黑,Arial`;
    ctx.fillStyle = "#ccc";
    ctx.fillText(
      "按R键或按钮重新开始",
      canvas.width / 2,
      canvas.height / 2 + 50
    );
    ctx.restore();
  }
}

let lastTime = performance.now();

function update() {
  let now = performance.now();
  let delta = (now - lastTime) / 1000; // 秒
  lastTime = now;
  if (running) {
    // 速度单位：画布宽度百分比/秒
    let baseSpeed = canvas.width * PLAYER_SPEED_RATIO;
    let dx = 0,
      dy = 0;
    if (isMobile && moveDir._amp) {
      let len =
        Math.sqrt(moveDir._vx * moveDir._vx + moveDir._vy * moveDir._vy) || 1;
      dx = (moveDir._vx / len) * baseSpeed * delta;
      dy = (moveDir._vy / len) * baseSpeed * delta;
      player.move(dx, dy, canvas, WIDTH, PLAYER_SIZE);
    } else {
      dx = (moveDir.right ? 1 : 0) - (moveDir.left ? 1 : 0);
      dy = (moveDir.down ? 1 : 0) - (moveDir.up ? 1 : 0);
      if (dx || dy) {
        let len = Math.sqrt(dx * dx + dy * dy) || 1;
        player.move(
          (dx * baseSpeed * delta) / len,
          (dy * baseSpeed * delta) / len,
          canvas,
          WIDTH,
          PLAYER_SIZE
        );
      }
    }
    balls.forEach((b) => b.move(delta));
    balls = balls.filter((b) => !b.isOut(canvas, WIDTH, BALL_SIZE));
    for (let b of balls) {
      if (
        b.collide(player.x, player.y, canvas, WIDTH, PLAYER_SIZE, BALL_SIZE)
      ) {
        running = false;
        restartBtn.style.display = "block";
        break;
      }
    }
    score++;
    scoreLabel.textContent = "得分: " + Math.floor(score / 10);
    if (Date.now() - lastBallTime > BALL_INTERVAL) {
      spawnBall();
      lastBallTime = Date.now();
    }
  }
  draw();
  requestAnimationFrame(update);
}

function setupEvents() {
  window.addEventListener("keydown", (e) => {
    if (!running && (e.key === "r" || e.key === "R")) {
      resetGame();
    }
    if (!running) return;
    if (["ArrowLeft", "a", "A"].includes(e.key)) moveDir.left = 1;
    if (["ArrowRight", "d", "D"].includes(e.key)) moveDir.right = 1;
    if (["ArrowUp", "w", "W"].includes(e.key)) moveDir.up = 1;
    if (["ArrowDown", "s", "S"].includes(e.key)) moveDir.down = 1;
  });
  window.addEventListener("keyup", (e) => {
    if (["ArrowLeft", "a", "A"].includes(e.key)) moveDir.left = 0;
    if (["ArrowRight", "d", "D"].includes(e.key)) moveDir.right = 0;
    if (["ArrowUp", "w", "W"].includes(e.key)) moveDir.up = 0;
    if (["ArrowDown", "s", "S"].includes(e.key)) moveDir.down = 0;
  });
  restartBtn.addEventListener("click", resetGame);
}

window.onload = function () {
  getDom();
  isMobile = isMobileDevice();
  setupJoystick(moveDir);
  // 设置按钮逻辑
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const joystickPos = document.getElementById("joystickPos");
  const joystickSize = document.getElementById("joystickSize");
  settingsBtn.onclick = () => (settingsPanel.style.display = "block");
  closeSettingsBtn.onclick = () => (settingsPanel.style.display = "none");
  saveSettingsBtn.onclick = () => {
    // 位置
    const pos = joystickPos.value;
    const js = document.getElementById("joystick");
    js.style.left = "";
    js.style.right = "";
    js.style.bottom = "";
    js.style.top = "";
    js.style.transform = "";
    if (pos === "left") {
      js.style.left = "3vw";
      js.style.right = "auto";
      js.style.bottom = "10vh";
      js.style.top = "auto";
      js.style.transform = "none";
    } else if (pos === "right") {
      js.style.left = "auto";
      js.style.right = "3vw";
      js.style.bottom = "10vh";
      js.style.top = "auto";
      js.style.transform = "none";
    } else {
      js.style.left = "50%";
      js.style.right = "auto";
      js.style.bottom = "7vw";
      js.style.top = "auto";
      js.style.transform = "translateX(-50%)";
    }
    // 大小
    if (joystickSize.value === "small") {
      js.style.width = "20vw";
      js.style.height = "20vw";
      js.style.minWidth = "60px";
      js.style.minHeight = "60px";
      js.style.maxWidth = "100px";
      js.style.maxHeight = "100px";
    } else if (joystickSize.value === "large") {
      js.style.width = "40vw";
      js.style.height = "40vw";
      js.style.minWidth = "120px";
      js.style.minHeight = "120px";
      js.style.maxWidth = "240px";
      js.style.maxHeight = "240px";
    } else {
      js.style.width = "28vw";
      js.style.height = "28vw";
      js.style.minWidth = "80px";
      js.style.minHeight = "80px";
      js.style.maxWidth = "160px";
      js.style.maxHeight = "160px";
    }
    // 屏幕方向
    const orientation = document.getElementById("screenOrientation").value;
    if (orientation === "landscape") {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(() => {});
      }
      // 兼容部分浏览器
      document.body.requestFullscreen && document.body.requestFullscreen();
    } else if (orientation === "portrait") {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("portrait").catch(() => {});
      }
      document.body.requestFullscreen && document.body.requestFullscreen();
    } else {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      document.exitFullscreen && document.exitFullscreen();
    }
    settingsPanel.style.display = "none";
  };
  // 初始只显示开始按钮
  canvas.style.display = "none";
  scoreLabel.style.display = "none";
  restartBtn.style.display = "none";
  joystick.style.display = isMobile ? "block" : "none";
  startBtn.style.display = "block";
  startBtn.onclick = function () {
    startBtn.style.display = "none";
    canvas.style.display = "block";
    scoreLabel.style.display = "block";
    restartBtn.style.display = "none";
    joystick.style.display = isMobile ? "block" : "none";
    // 立即重置并启动游戏
    resetGame();
    window.addEventListener("resize", resizeCanvas);
    setupEvents();
    update();
  };
  // 保证PC端也能隐藏按钮
  if (!isMobile) {
    joystick.style.display = "none";
    startBtn.style.display = "block";
    // 监听PC端点击
    startBtn.addEventListener("click", function () {
      startBtn.style.display = "none";
      canvas.style.display = "block";
      scoreLabel.style.display = "block";
      restartBtn.style.display = "none";
      resetGame();
      window.addEventListener("resize", resizeCanvas);
      setupEvents();
      update();
    });
  }
};
