var game = game || {};

function createMapMaker(res) {

  let ps = 4;
  let sz = game.mapWidth / ps;

  return {

    x: 0, // for iterating
    y: 0,
    pixelSize: ps,
    size: sz,
    cmapIterations: 1,
    cmapIteration: 1,
    colorMap: [],
    newColorMap: [],
    image: game.mapImage,
    ctx: game.mapImage.getContext("2d"),
    colorsDone: false,
    mapRendered: false,

    run: function() {
      if (!this.colorsDone) {
        this.colorMap[this.x] = [];
        drawLoadingScreen(game.ctx, "Generating map", this.x/this.size);
        for (let i = 0; i < this.size; i++) {
          let c = getInfo(this.x * this.pixelSize / game.tileSize, i * this.pixelSize / game.tileSize).color;
          this.colorMap[this.x][i] = c;
        }
        this.x++;
        if (this.x >= this.size) {
          this.x = 0;
          this.colorsDone = true;
        }
        return;
      }
      else if (this.cmapIteration <= this.cmapIterations && this.colorsDone) {
        
        drawLoadingScreen(game.ctx, "Refining colors", (this.x/this.size + this.cmapIteration - 1)/this.cmapIterations);
        if (this.x < this.size) {
          this.newColorMap[this.x] = [];
          for (let i = 0; i < this.size; i++) {
            if (this.x == 0 || i == 0 || this.x == this.size - 1 || i == this.size - 1) {
              this.newColorMap[this.x][i] = this.colorMap[this.x][i];
            }
            else {
              let c1 = this.colorMap[this.x - 1][i];
              let c2 = this.colorMap[this.x + 1][i];
              let c3 = this.colorMap[this.x][i - 1];
              let c4 = this.colorMap[this.x][i + 1];
              let b1 = blendColors(c1, c2, 0.5);
              let b2 = blendColors(c3, c4, 0.5);
              this.newColorMap[this.x][i] = blendColors(b1, b2, 0.5);
            }
          }
          this.x++;
          if (this.x == this.size) {
            this.x = 0;
            this.colorMap = JSON.parse(JSON.stringify(this.newColorMap));
            this.newColorMap = [];
            this.cmapIteration++;
          }
        }
      }
      else if (this.colorsDone && !this.mapRendered) {
        if (this.x < this.size) {
          drawLoadingScreen(game.ctx, "Rendering map", this.x/this.size);
          for (let i = 0; i < this.size; i++) {
            this.ctx.fillStyle = this.colorMap[this.x][i];
            this.ctx.fillRect(this.x, i, 1, 1);
          }
          this.x++;
        }
        if (this.x >= this.size) {
          //game.mapDone = true;
          this.mapRendered = true;
          this.x = 20;
        }
      }
      else if (this.mapRendered) {
        if (this.x < this.size * this.pixelSize) {
          drawLoadingScreen(game.ctx, "Adding details", this.x/(this.size * this.pixelSize));
          for (let i = 20; i < this.size * this.pixelSize - 20; i += 40) {
            let ox = this.x + Math.floor(Math.random() * 40) - 19;
            let oy = i + Math.floor(Math.random() * 40) - 19;
            addDetail(ox, oy);
          }
        }
        this.x += 40;
        if (this.x >= this.size * this.pixelSize - 20) {
          game.mapDone = true;
        }
      }
    }
  }
  
}