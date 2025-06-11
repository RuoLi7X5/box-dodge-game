// 小球类
export class Ball {
  constructor(
    direction,
    canvas,
    WIDTH,
    BALL_SIZE,
    BALL_SPEED,
    vx,
    vy,
    x,
    y,
    color
  ) {
    this.color = color || Ball.randomColor();
    if (
      x !== undefined &&
      y !== undefined &&
      vx !== undefined &&
      vy !== undefined
    ) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
    } else {
      if (direction === "left") {
        this.x = 0;
        this.y = Math.random() * (canvas.height - BALL_SIZE) + BALL_SIZE / 2;
        this.vx = BALL_SPEED;
        this.vy = 0;
      } else if (direction === "right") {
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - BALL_SIZE) + BALL_SIZE / 2;
        this.vx = -BALL_SPEED;
        this.vy = 0;
      } else if (direction === "top") {
        this.x = Math.random() * (canvas.width - BALL_SIZE) + BALL_SIZE / 2;
        this.y = 0;
        this.vx = 0;
        this.vy = BALL_SPEED;
      } else {
        this.x = Math.random() * (canvas.width - BALL_SIZE) + BALL_SIZE / 2;
        this.y = canvas.height;
        this.vx = 0;
        this.vy = -BALL_SPEED;
      }
    }
    let scale = canvas.width / WIDTH;
    this.vx *= scale;
    this.vy *= scale;
  }
  static randomColor() {
    let arr = ["red", "orange", "yellow", "lime", "cyan", "blue", "magenta"];
    return arr[Math.floor(Math.random() * arr.length)];
  }
  move() {
    this.x += this.vx;
    this.y += this.vy;
  }
  draw(ctx, canvas, WIDTH, BALL_SIZE) {
    let size = (BALL_SIZE * canvas.width) / WIDTH;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
  isOut(canvas, WIDTH, BALL_SIZE) {
    let size = (BALL_SIZE * canvas.width) / WIDTH;
    return (
      this.x < -size ||
      this.x > canvas.width + size ||
      this.y < -size ||
      this.y > canvas.height + size
    );
  }
  collide(px, py, canvas, WIDTH, PLAYER_SIZE, BALL_SIZE) {
    let size = (BALL_SIZE * canvas.width) / WIDTH;
    let psize = (PLAYER_SIZE * canvas.width) / WIDTH;
    return (
      Math.abs(this.x - px) < (size + psize) / 2 &&
      Math.abs(this.y - py) < (size + psize) / 2
    );
  }
}
