// create a fill circle function
function fillCircle(ctx, x, y, r) {
  let c = new Path2D(); // this starts the path called c
  c.moveTo(x + r, y); // sets the start point
  c.arc(x, y, r, 0, 2 * Math.PI); // draws an arc around the start point
  ctx.fill(c); // fills the arc
}

// converts an angle in degrees to an angle in radians
function toRadians(angle) {
  return (angle / 180) * Math.PI;
}

// converts an angle in radians to an angle in degrees
function toDegrees(angle) {
  return (angle / Math.PI) * 180;
}

// gets the distance from (x, y) to (x2, y2)
// sqrt is slow so use compare distance instead where possible
function distance(x, y, x2, y2) {
  return Math.sqrt(((x - x2) * (x - x2)) + ((y - y2) * (y - y2)));
}

// returns true if the distance from (x, y) to (x2, y2) is more than dist
// doesn't use sqrt so its fast (yey!)
function compareDistance(x, y, x2, y2, dist) {
  return (x - x2) ** 2 + (y - y2) ** 2 > dist ** 2;
}

// returns the angle (in degrees) between (x, y) and (x1, y1)
// right (positive x) is 0, down (positive y) is 90, etc. values range from -180 to 180.
function getDirection(x, y, x1, y1) {
  let opp = x1 - x; // opposite side of triangle
  let adj = y1 - y; // adjacent side of triangle
  let deg = toDegrees(Math.atan2(adj, opp)); // inverse tangent
  return deg;
}

// moves a certain distance in a certain angle (in degrees) from (x, y)
// again, right is 0 degrees, down is 90 degrees, left is 180 degrees, up is 270 degrees
// also accepts negative values for distance and direction
function moveDirection(x, y, angle, distance) {
  let movex = Math.cos(toRadians(angle)) * distance;
  let movey = Math.sin(toRadians(angle)) * distance;
  let rx = x + movex;
  let ry = y + movey;
  if (isNaN(rx)) {
    console.log('NaN in moveDirection(' + x + ", " + y + ", " + angle + ", " + distance + ");");
  }
  return {
    x: rx,
    y: ry
  };
}

// fits the canvas to the window
function resizeCanvasToWindow() {
  game.canvas.width = window.innerWidth;
  game.canvas.height = window.innerHeight;
}

// blend two colors, pct 0.5 = even, pct 0 = color1, pct 1 = color2
function blendColors(color1, color2, pct) {

  // make sure inputs exist
  color1 = color1 || '#000000';
  color2 = color2 || '#000000';
  pct = pct || 0.5;

  pct = Math.min(Math.max(0, pct), 1);

  // convert colors to 6-character representation
  if (color1.length == 4) {
    color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
  }
  else {
    color1 = color1.substring(1);
  }
  if (color2.length == 4) {
    color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
  }
  else {
    color2 = color2.substring(1);
  }

  // convet colors to RGB
  color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
  color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

  // blend
  let color3 = [ 
    (1 - pct) * color1[0] + pct * color2[0], 
    (1 - pct) * color1[1] + pct * color2[1], 
    (1 - pct) * color1[2] + pct * color2[2]
  ];

  // convert to hex
  color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);

  // return output
  return color3;
}

function int_to_hex(num)
{
  var hex = Math.round(num).toString(16);
  if (hex.length == 1)
    hex = '0' + hex;
  return hex;
}

function getWidthOfText(txt, font) {
  if (getWidthOfText.canvas == undefined) {
    getWidthOfText.canvas = document.createElement("canvas");
    getWidthOfText.ctx = getWidthOfText.canvas.getContext("2d");
  }
  getWidthOfText.ctx.font = font;
  return Math.floor(getWidthOfText.ctx.measureText(txt).width);
}

function drawLoadingScreen(ctx, msg, pct) {

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  
  ctx.fillStyle = '#000000';
  ctx.font = '30px Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("Loading Simulation...", window.innerWidth/2, window.innerHeight/3);

  ctx.font = '15px Roboto, sans-serif';
  ctx.fillText(msg, window.innerWidth/2, window.innerHeight*5/12);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.fillRect(window.innerWidth/4, window.innerHeight/2, window.innerWidth/2 * pct, 20);
  ctx.strokeRect(window.innerWidth/4, window.innerHeight/2, window.innerWidth/2, 20);
  ctx.fillText(Math.floor(pct * 100) + "%", window.innerWidth/2, window.innerHeight/2 + 50);
  
}

function addRandomDetail() {

  let x = Math.floor(Math.random() * game.mapWidth);
  let y = Math.floor(Math.random() * game.mapHeight);

  addDetail(x, y);
  
}

function addDetail(x, y) {

  let b = getInfo(x / game.tileSize, y / game.tileSize).biome;

  function pickDetail(biome) {
    if (!game.mapDone) { // this is for when the game is generating stuff at the start
  
      if (biome == "ocean" || biome == "lake" || biome == "frozen_lake" || biome == "river") {
        return "nothing"; // no details in water yet
      }
      if (biome == "deciduous_forest") {
        if (Math.random() < 0.5) {
          return "oak_tree";
        }
        if (Math.random() < 0.2) {
          if (Math.random() < 0.05) return "berry_bush";
          return "bush";
        }
      }
      else if (biome == "grassland") {
        if (Math.random() < 0.01) {
          return "oak_tree";
        }
        if (Math.random() < 0.05) {
          if (Math.random() < 0.05) return "berry_bush";
          return "bush";
        }
      }
      else { // unrecognized biome
        return "nothing";
      }
      
    }
    else { // when the game is adding stuff while running
      
    }
  
    return "nothing";
  }
  let type = pickDetail(b);

  if (type !== "nothing") {
    addDetailToMap(x, y, type); 
  }
  
}

function addDetailToMap(x, y, type) {

  game.mapDetails.push({
    x: Math.floor(x),
    y: Math.floor(y),
    type: type
  });

  //updateDetailImage(x, y, type);
  
}

function getObjectsInSightCone(x, y, r, dir, width) {
  // take x, y (of the sight cone) to be the origin

  // find the distance squared, which we will compare to later
  
  let distSquared = r * r;
  let detailsInCone = [];
  let creaturesInCone = [];

  // first we calculate the directions of the edges of the sight cone

  let dir1 = dir - width/2;
  let dir2 = dir + width/2;

  // find points on the two edge lines

  let p1 = moveDirection(0, 0, dir1, 1);
  let p2 = moveDirection(0, 0, dir2, 1);

  // use the points to determine the slopes of the lines

  let slope1 = p1.y/p1.x;
  let slope2 = p2.y/p2.x;

  // determine whether the sight cone is above or below each line

  let s1 = p1.y > 0 ? true : false;
  let s2 = p2.y > 0 ? true : false;

  function isInSightCone(x1, y1) {

    if (x1*x1 + y1*y1 > distSquared) {
      return false;
    }
    if ((y1 > slope1 * x1) != s1) {
      return false;
    }
    if ((y1 > slope2 * x1) != s2) {
      return false;
    }

    return true;
    
  }

  for (let i = 0; i < game.mapDetails.length; i++) {
    let d = game.mapDetails[i];

    // translate coords because we are using (x, y) as our origin
    let dx = d.x - x;
    let dy = d.y - y;

    if (isInSightCone(dx, dy)) {
      detailsInCone.push(d);
    }
    
  }

  for (let i = 0; i < game.creatures.length; i++) {
    let c = game.creatures[i];

    // translate coords because we are using (x, y) as our origin
    let cx = c.x - x;
    let cy = c.y - y;

    if (isInSightCone(cx, cy)) {
      creaturesInCone.push(c);
    }
    
  }

  return {
    details: detailsInCone,
    creatures: creaturesInCone
  };
  
}