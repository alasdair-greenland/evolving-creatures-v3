var game = game || {};

game.species = {}; // stores all our species
game.mapDetails = []; // stores all non-living objects
game.creatures = []; // stores all living objects

game.tileSize = 10;

game.day = 0;
game.timeOfDay = 0; // 0 is noon
game.dayLengthInTicks = 60 * 20; // 1 minute
game.dayInYear = 0;
game.yearLengthInDays = 100;
game.year = 0;
game.season = "Spring";

game.trackedCreature = null;

let testSpeed = 5;
let testTurn = 3;

let replit = (window.location.href == "https://evolving-creatures-3.wordguesser.repl.co/");

game.mapWidth = replit ? 5000 : 10000;
game.mapHeight = replit ? 5000 : 10000; // this is so that size on replit is 5000 but on production build its 10000

game.mapDone = false;

game.mapImage = document.createElement("canvas"); // an image of the map
game.mapImage.width = game.mapWidth / 4;
game.mapImage.height = game.mapHeight / 4;

game.mapImageURL = ""; // a dataURL of the image
/*
game.mapImageDetail = document.createElement("canvas");
game.mapImageDetail.width = game.mapWidth;
game.mapImageDetail.height = game.mapHeight;
*/
game.camerax = game.mapWidth/2 - window.innerWidth/2;
game.cameray = game.mapHeight/2 - window.innerHeight/2;

game.fps = 60;
game.tps = 20;
game.framesPerTick = Math.floor(game.fps / game.tps);
game.frameCount = 0;

game.infoOverlay = true;
game.paused = false;

function onLoad() {

  game.canvas = document.getElementById("canvas"); // get the canvas object and load it into game code
  game.ctx = canvas.getContext("2d"); // get the canvas' context, so we can draw on it

  resizeCanvasToWindow();

  drawLoadingScreen(game.ctx, "Preparing", 0);

  setTimeout(init, 10);
  
}

function init() {

  

  game.colorFinder = [];
  for (let i = 0; i < 200; i++) {
    game.colorFinder[i] = [];
    for (let j = 0; j < 100; j++) {
      game.colorFinder[i][j] = colorFinderValues(i, j).color;
    }
    game.colorFinder = averageColorMap(game.colorFinder);
    game.colorFinder = averageColorMap(game.colorFinder);
  }

  let mapBuilder = createMapMaker("low");

  function mapLoop() {

    mapBuilder.run();

    if (!game.mapDone) {
      setTimeout(mapLoop, 10);
    }
    else {
      
      for (let i = 0; i < 20; i++) {
        game.creatures.push(createBerryMuncher(2500, 2500));
      }
      game.creatures[0].tracked = true;
      game.trackedCreature = game.creatures[0];
      
      game.colorFinder = null; // no longer needed once map is generated
      game.mapImageURL = game.mapImage.toDataURL("image/jpeg", 0.7);
      game.mapImage = null;
      sortDetails();
      mainLoop();
    }
    
  }

  mapLoop();
  
}

game.firstPauseFrame = true;
function mainLoop() {

  let ctx = game.ctx;

  game.camerax += game.scrollHorizontal * game.scrollSpeed; // move the camera
  game.cameray += game.scrollVertical * game.scrollSpeed; // move the camera
  game.camerax = Math.max(Math.min(game.mapWidth - window.innerWidth, game.camerax), 0); // make sure camera can't go offscreen
  game.cameray = Math.max(Math.min(game.mapHeight - window.innerHeight, game.cameray), 0); // same

  //let z = Math.E ** game.zoom;
  
  let xc = 0;
  let yc = 0;

  let img = new Image;
  img.src = game.mapImageURL;

  let cx = game.camerax - xc;
  let cy = game.cameray - yc;

  let cwidth = window.innerWidth / 4;
  let cheight = window.innerHeight / 4;

  let tempCanvas = document.createElement("canvas");
  tempCanvas.width = game.canvas.width;
  tempCanvas.height = game.canvas.height;
  let tctx = tempCanvas.getContext("2d");

  tctx.drawImage(img, cx/4, cy/4, cwidth, cheight, 0, 0, window.innerWidth, window.innerHeight);
  drawCreaturesAndDetails(tctx, cx, cy);

  tctx.fillStyle = '#000000';
  let distFromMidnight = Math.abs((game.timeOfDay / game.dayLengthInTicks) - .5);
  tctx.globalAlpha = (.5 - distFromMidnight) * .75; // .5 was a bit dark lmao
  tctx.globalAlpha = 0;
  tctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  tctx.globalAlpha = 1;

  ctx.drawImage(tempCanvas, 0, 0);

  tempCanvas.remove();

  if (game.paused) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '50px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("PAUSED", window.innerWidth/2, window.innerHeight/2);
  }
  
  if (game.infoOverlay) {

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    // behind the minimap
    ctx.fillRect(0, 0, 120, 120); // draw a white rectangle for contrast
    ctx.strokeRect(-5, -5, 125, 125); // -5 so the stroke goes offscreen

    // behind the time info
    ctx.fillRect(0, window.innerHeight - 140, 80, 140);
    ctx.strokeRect(-5, window.innerHeight - 140, 85, 145);

    // behind the biome info
    let biomeText = game.currentHoverInfo.biome.replaceAll("_", " ");
    let w = getWidthOfText(`Biome: ${biomeText}`, "15px Roboto");
    ctx.fillRect(window.innerWidth - (w + 40), window.innerHeight - 55, 40 + w, 55);
    ctx.strokeRect(window.innerWidth - (w + 40), window.innerHeight - 55, 45 + w, 60);

    // behind tracked creature info
    if (game.trackedCreature) {
      let w = getWidthOfText(`Species: ${game.trackedCreature.species.replace("_", " ")}`, "15px Roboto");
      ctx.fillRect(window.innerWidth - (w + 40), 0, w + 40, 115);
      ctx.strokeRect(window.innerWidth - (w + 40), -5, w + 45, 120);
    }

    
    
    // draw minimap
    ctx.drawImage(img, 10, 10, 100, 100);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 100, 100);
    ctx.lineWidth = 1;
    let scale = 100 / game.mapWidth;
    game.ctx.strokeRect(10 + game.camerax * scale, 10 + game.cameray * scale, window.innerWidth * scale, window.innerHeight * scale);

    // biome text
    ctx.fillStyle = '#000000';
    ctx.font = '15px Roboto, sans-serif';
    ctx.textAlign = 'right';
    if (game.currentHoverInfo.biome != "none" && !game.mouseDownInMinimap) {
      ctx.fillText("Biome: " + biomeText, window.innerWidth - 20, window.innerHeight - 20);
    }

    // creature info
    if (game.trackedCreature) {
      ctx.fillStyle = '#000000';
      ctx.font = '15px Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Species: ${game.trackedCreature.species.replace("_", " ")}`, window.innerWidth - 20, 30);
      ctx.fillText(`Energy: ${game.trackedCreature.energy}`, window.innerWidth - 20, 50);
      ctx.fillText(`State: ${game.trackedCreature.objective.state}`, window.innerWidth - 20, 70);
      ctx.fillText(`Strength: ${game.trackedCreature.objective.strength.toFixed(3)}`, window.innerWidth - 20, 90);
    }

    // time info
    ctx.textAlign = 'left';
    ctx.fillText(game.season, 15, window.innerHeight - 110);
    ctx.fillText("Year " + game.year, 15, window.innerHeight - 80);
    ctx.fillText("Day " + game.dayInYear, 15, window.innerHeight - 50);
    let hourLength = Math.floor(game.dayLengthInTicks / 24);
    let pm = true;
    let hour = Math.floor(game.timeOfDay / hourLength);
    if (hour > 11) { pm = false; hour -= 12; }
    if (hour == 0) { hour += 12; }
    ctx.fillText(hour + " " + (pm ? "PM" : "AM"), 15, window.innerHeight - 20);
    
  }

  if (!game.paused && game.frameCount >= game.framesPerTick) { // do decision updates (ontick)
    game.frameCount = 0;
    game.timeOfDay++;
    if (game.timeOfDay >= game.dayLengthInTicks) { game.dayInYear++; game.timeOfDay = 0; }
    if (game.dayInYear >= game.yearLengthInDays) { game.year++; game.dayInYear = 0; }

    game.season = [ "Spring", "Summer", "Autumn", "Winter" ][Math.floor((game.dayInYear/game.yearLengthInDays) * 4)];
    
    if (Math.abs(game.timeOfDay - 12) > 4 && Math.random() < 1 / (game.tps * 5)) {
      growthTick(); // try to grow/spawn things on average every 5 seconds, but not at night
    }

    for (let i = 0; i < game.creatures.length; i++) {
      let c = game.creatures[i];
      c.update();
      if (c.tracked) {
        game.camerax = Math.min(c.x - window.innerWidth/3, Math.max(c.x - window.innerWidth*.66, game.camerax));
        game.cameray = Math.min(c.y - window.innerHeight/3, Math.max(c.y - window.innerHeight*.66, game.cameray));
      }
    }
  }

  game.frameCount++;
  setTimeout(mainLoop, 1000/game.fps);
}

function growthTick() {

  for (let i = 0; i < game.mapDetails.length; i++) {

    let d = game.mapDetails[i];
    if (d.type == "bush") {
      if (Math.random() < 0.3) {
        if (d.stage) d.stage++;
        else d.stage = 1;
      }
      if (d.stage > 12) {
        d.type = "berry_bush";
      }
    }
    
  }
  
}

game.scrollVertical = 0;
game.scrollHorizontal = 0;
game.scrollSpeed = 15;

game.spaceDown = false;
game.escDown = false;
window.onkeydown = function(e) {

  if (e.key.toLowerCase() == "w") {
    game.scrollVertical = -1;
  }
  else if (e.key.toLowerCase() == "s") {
    game.scrollVertical = 1;
  }
  else if (e.key.toLowerCase() == "a") {
    game.scrollHorizontal = -1;
  }
  else if (e.key.toLowerCase() == "d") {
    game.scrollHorizontal = 1;
  }
  else if (e.key == "Shift") {
    game.scrollSpeed = 50;
  }
  else if (e.key == "Escape") {
    if (!game.escDown) {
      game.infoOverlay = !game.infoOverlay;
      game.escDown = true;
    }
  }
  else if (e.key == " ") {
    if (!game.spaceDown) {
      game.paused = !game.paused;
      game.firstPauseFrame = true;
      game.spaceDown = true;
    }
  }
  else if (e.key == "Enter" && game.trackedCreature) {
    game.trackedCreature.tracked = false;
    game.trackedCreature = null;
  }
  
}

window.onkeyup = function(e) {

  if (e.key.toLowerCase() == "w" || e.key.toLowerCase() == "s") {
    game.scrollVertical = 0;
  }
  else if (e.key.toLowerCase() == "a" || e.key.toLowerCase() == "d") {
    game.scrollHorizontal = 0;
  }
  else if (e.key == "Shift") {
    game.scrollSpeed = 15;
  }
  else if (e.key == "Escape") {
    game.escDown = false;
  }
  else if (e.key == " ") {
    game.spaceDown = false;
  }
  
}

window.onmousedown = function(e) {

  game.mouseDown = true;
  if (game.infoOverlay) {
    if (e.clientX >= 10 && e.clientX <= 110 && e.clientY >= 10 && e.clientY <= 110) {
      game.mouseDownInMinimap = true;
      game.camerax = (e.clientX - 10) * game.mapWidth / 100 - window.innerWidth/2;
      game.cameray = (e.clientY - 10) * game.mapHeight / 100 - window.innerHeight/2;
      return;
    }
  }
  for (let i = 0; i < game.creatures.length; i++) {
    let c = game.creatures[i];
    let scx = c.x - game.camerax;
    let scy = c.y - game.cameray;
    let dist2 = (e.clientX - scx) ** 2 + (e.clientY - scy) ** 2;
    if (dist2 < 625) {
      if (game.trackedCreature) {
        game.trackedCreature.tracked = false;
      }
      c.tracked = true;
      game.trackedCreature = c;
    }
  }
}

game.zoom = 0;

window.onmouseup = function(e) {
  game.mouseDown = false;
  game.mouseDownInMinimap = false;
}

game.currentHoverInfo = { biome: "none", color: "none" };

window.onmousemove = function(e) {

  game.mouseX = e.clientX;
  game.mouseY = e.clientY;

  game.currentHoverInfo = getInfo(Math.floor((e.clientX + game.camerax)/game.tileSize), Math.floor((e.clientY + game.cameray)/game.tileSize));

  if (game.infoOverlay && game.mouseDownInMinimap) {
    let x = Math.min(Math.max(10, e.clientX), 110);
    let y = Math.min(Math.max(10, e.clientY), 110);
    game.camerax = (x - 10) * game.mapWidth / 100 - window.innerWidth/2;
    game.cameray = (y - 10) * game.mapHeight / 100 - window.innerHeight/2;
  }
  
}

window.wheel = function(e) {

  game.zoom += e.deltaY * 0.01;

  game.zoom = Math.min(Math.max(-1, game.zoom), 1);
  
}