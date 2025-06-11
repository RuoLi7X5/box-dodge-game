// 虚拟摇杆模块
export function isMobileDevice() {
  return /mobile|android|iphone|ipad|phone/i.test(navigator.userAgent);
}

let moveDir = {
  left: 0,
  right: 0,
  up: 0,
  down: 0,
  _amp: 0,
  _vx: 0,
  _vy: 0,
};

export function getMoveDir() {
  return moveDir;
}

export function setupJoystick() {
  const joystick = document.getElementById("joystick");
  const stick = document.getElementById("joystick-stick");
  let joyActive = false,
    joyCenter = { x: 0, y: 0 },
    joyRadius = 0;

  function updateJoystickCenter() {
    const rect = joystick.getBoundingClientRect();
    joyCenter.x = rect.left + rect.width / 2;
    joyCenter.y = rect.top + rect.height / 2;
    joyRadius = rect.width / 2;
  }
  window.addEventListener("resize", updateJoystickCenter);
  setTimeout(updateJoystickCenter, 300);
  joystick.addEventListener("touchstart", (e) => {
    updateJoystickCenter();
    joyActive = true;
    // 复位到中心
    stick.style.left = "50%";
    stick.style.top = "50%";
    stick.style.transform = "translate(-50%, -50%)";
    moveDir.left = moveDir.right = moveDir.up = moveDir.down = 0;
    moveDir._amp = 0;
    moveDir._vx = 0;
    moveDir._vy = 0;
  });
  joystick.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (!joyActive) return;
      let t = e.touches[0];
      let dx = t.clientX - joyCenter.x,
        dy = t.clientY - joyCenter.y;
      let len = Math.sqrt(dx * dx + dy * dy);
      let maxLen = joyRadius * 0.72;
      if (len > maxLen) {
        dx = (dx * maxLen) / len;
        dy = (dy * maxLen) / len;
        len = maxLen;
      }
      // stick位置（百分比，居中）
      let px = 50 + (dx / joyRadius) * 36; // 36%为摇杆半径
      let py = 50 + (dy / joyRadius) * 36;
      stick.style.left = px + "%";
      stick.style.top = py + "%";
      stick.style.transform = "translate(-50%, -50%)";
      // 只要手指移动方向变，立即响应方向
      let vx = dx;
      let vy = dy;
      let vlen = Math.sqrt(vx * vx + vy * vy);
      let threshold = 0.12 * joyRadius; // 死区
      moveDir.left = moveDir.right = moveDir.up = moveDir.down = 0;
      if (vlen > threshold) {
        moveDir._vx = vx / vlen;
        moveDir._vy = vy / vlen;
        moveDir._amp = len / maxLen;
      } else {
        moveDir._vx = 0;
        moveDir._vy = 0;
        moveDir._amp = 0;
      }
    },
    { passive: false }
  );
  joystick.addEventListener("touchend", (e) => {
    joyActive = false;
    // 复位到中心
    stick.style.left = "50%";
    stick.style.top = "50%";
    stick.style.transform = "translate(-50%, -50%)";
    moveDir.left = moveDir.right = moveDir.up = moveDir.down = 0;
    moveDir._amp = 0;
    moveDir._vx = 0;
    moveDir._vy = 0;
  });
}
