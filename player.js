// 玩家类
export class Player {
  constructor(canvas, WIDTH, PLAYER_SIZE) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.WIDTH = WIDTH;
    this.PLAYER_SIZE = PLAYER_SIZE;
  }
  move(dx, dy, canvas, WIDTH, PLAYER_SIZE) {
    let nx = this.x + dx,
      ny = this.y + dy;
    let s = (PLAYER_SIZE * canvas.width) / WIDTH / 2;
    if (
      s <= nx &&
      nx <= canvas.width - s &&
      s <= ny &&
      ny <= canvas.height - s
    ) {
      this.x = nx;
      this.y = ny;
    }
  }
  draw(ctx, canvas, WIDTH, PLAYER_SIZE) {
    let size = (PLAYER_SIZE * canvas.width) / WIDTH;
    ctx.fillStyle = "#00bfff";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(this.x - size / 2, this.y - size / 2, size, size);
    ctx.fill();
    ctx.stroke();
  }
}
