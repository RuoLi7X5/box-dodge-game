// 游戏主循环和入口
import { Player } from "./player.js";
import { Ball } from "./ball.js";
import { setupJoystick, getMoveDir, isMobileDevice } from "./joystick.js";

const WIDTH = 500,
  HEIGHT = 400,
  PLAYER_SIZE = 20,
  BALL_SIZE = 16,
  BALL_SPEED = 4,
  BALL_INTERVAL = 900;

let canvas, ctx, scoreLabel, restartBtn, joystick, stick;
let player, balls, score, running, moveDir, lastBallTime;
let isMobile;

function getDom() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  scoreLabel = document.getElementById("scoreLabel");
  restartBtn = document.getElementById("restartBtn");
  joystick = document.getElementById("joystick");
  stick = document.getElementById("joystick-stick");
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
  if (r < 0.5) {
    let dir = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
    balls.push(new Ball(dir, canvas, WIDTH, BALL_SIZE, BALL_SPEED));
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
    let vx = ((BALL_SPEED * dx) / dist) * (canvas.width / WIDTH);
    let vy = ((BALL_SPEED * dy) / dist) * (canvas.width / WIDTH);
    balls.push(
      new Ball("custom", canvas, WIDTH, BALL_SIZE, BALL_SPEED, vx, vy, x, y)
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

function update() {
  if (running) {
    // 速度增加5%
    let baseSpeed = 2.6 * 1.05 * (canvas.width / WIDTH);
    let dx, dy;
    if (isMobile && moveDir._amp) {
      // 保证方向速度一致：归一化方向向量
      let len = Math.sqrt(moveDir._vx * moveDir._vx + moveDir._vy * moveDir._vy) || 1;
      dx = (moveDir._vx / len) * baseSpeed;
      dy = (moveDir._vy / len) * baseSpeed;
      player.move(dx, dy, canvas, WIDTH, PLAYER_SIZE);
    } else {
      dx = (moveDir.right ? 1 : 0) - (moveDir.left ? 1 : 0);
      dy = (moveDir.down ? 1 : 0) - (moveDir.up ? 1 : 0);
      if (dx || dy) {
        let len = Math.sqrt(dx * dx + dy * dy) || 1;
        player.move((dx * baseSpeed) / len, (dy * baseSpeed) / len, canvas, WIDTH, PLAYER_SIZE);
      }
    }
    balls.forEach((b) => b.move());
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
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  setupEvents();
  update();
};
