var game = game || {};

game.allDetailTypes = [
  "berry_bush",
  "bush",
  "oak_tree"
]

function drawCreaturesAndDetails(ctx, cx, cy) {

  let w = window.innerWidth;
  let h = window.innerHeight;

  for (let ci = 0; ci < game.creatures.length; ci++) {
    let c = game.creatures[ci];

    if (c.x > cx - 10 && c.y > cy - 10 && c.x < cx + w + 10 && c.y < cy + h + 10) {
      c.drawSelf(ctx, cx, cy);
    }
    ci++;
  }

  for (let di = 0; di < game.mapDetails.length; di++) {
    let d = game.mapDetails[di];

    let fn = game.drawDetail[d.type];
    try {
      if (d.x > cx - 10 && d.y > cy - 10 && d.x < cx + w + 10 && d.y < cy + h + 10) {
        fn(ctx, d.x - cx, d.y - cy);
      }
    } catch (e) {
      console.log('failed to draw ' + d.type);
    }
    di++;
  }
  
}

function drawCreatures(ctx, cx, cy) {
  
  let w = window.innerWidth;
  let h = window.innerHeight;
  for (let i = 0; i < game.creatures.length; i++) {
    let c = game.creatures[i];
    if (c.x > cx - 10 && c.y > cy - 10 && c.x < cx + w + 10 && c.y < cy + h + 10) {
      c.drawSelf(ctx, cx, cy);
    }
  }
}

function createBerryMuncher(x, y) {

  /*
   * berry munchers are the bottom of the food chain.
   * they eat berries and leaves, and need to work together if they want to move objects.
   * they don't do well in warm, dry places, but are fine with cold temperatures.
   * they don't need much energy to survive.
   * represented by two circles.
   */

  let c = {};
  c.species = "berry_muncher";
  
  let c1 = 0;
  let c2 = 0;

  c.as1 = .5;
  c.as2 = .5;

  c.gender = Math.random < 0.5 ? "Male" : "Female";
  
  if (typeof(x) != "number" && typeof(y) != "number") {
    if (x.gender == "Male") {
      c1 = x;
      c2 = y;
    }
    else {
      c1 = y;
      c2 = x;
    }
  }
  c.ev = (c1 && c2); // sets whether the creature is evolved or not
  
  if (c.ev) {
    c.x = (c1.x + c2.x) / 2;
    c.y = (c1.y + c2.y) / 2;
    c.speed = (c1.speed + c2.speed) / 2 + Math.random() - 0.5;
    if (c.speed > 20) c.speed = 20;
    if (c.speed > 15) c.speed -= (c.speed - 15) * .25;
    if (c.speed < 3.5) c.speed = 3.5;
  }
  else {
    c.x = x;
    c.y = y;
    c.speed = 7;
  }

  c.hunger = 0;
  c.thirst = 0;
  c.energy = 5000;
  c.aenergy = 100;
  c.age = 0;

  if (c.ev && Math.random() < 0.97) {
    if (c.gender == "Male") {
      c.color = c2.color;
      c.eyeColor = c1.eyeColor;
    }
    else {
      c.color = c1.color;
      c.eyeColor = c2.eyeColor;
    }
    let red = parseInt(c.color.substring(1, 3), 16);
    let blue = parseInt(c.color.substring(3, 5), 16);
    let green = parseInt(c.color.substring(5, 7), 16);
    red += Math.floor(Math.random() * 9 - 5);
    blue += Math.floor(Math.random() * 9 - 5);
    green += Math.floor(Math.random() * 9 - 5);
    red = Math.min(Math.max(100, red), 255).toString(16);
    blue = Math.min(Math.max(0, blue), 70).toString(16);
    green = Math.min(Math.max(0, green), 70).toString(16);
    c.color = `#${red}${green}${blue}`;
    red = parseInt(c.eyeColor.substring(1, 3), 16);
    blue = parseInt(c.eyeColor.substring(3, 5), 16);
    green = parseInt(c.eyeColor.substring(5, 7), 16);
    red += Math.floor(Math.random() * 9 - 5);
    blue += Math.floor(Math.random() * 9 - 5);
    green += Math.floor(Math.random() * 9 - 5);
    red = Math.min(Math.max(0, red), 70).toString(16);
    if (c.gender == "Male") {
      blue = Math.min(Math.max(100, blue), 255).toString(16);
      green = Math.min(Math.max(0, green), 70).toString(16);
    }
    else {
      blue = Math.min(Math.max(0, blue), 70).toString(16);
      green = Math.min(Math.max(100, green), 255).toString(16);
    }
    c.eyeColor = `#${red}${green}${blue}`;
  }
  else {
    let red = Math.floor(Math.random() * 55) + 100;
    red = red.toString(16);
    while (red.length < 2) red = "0" + red;
    let blue = Math.floor(Math.random() * 70);
    blue = blue.toString(16);
    while (blue.length < 2) blue = "0" + blue;
    c.color = `#${red}${blue}${blue}`;
    if (c.gender == "Male") {
      c.eyeColor = `#${blue}bb${red}`;
    }
    else {
      c.eyeColor = `#${blue}${red}bb`;
    }
  }


  c.x2 = c.x - 14;
  c.y2 = c.y;
  c.dir = 0;

  
  c.tracked = false; // one creature can be tracked, and the game will highlight it

  c.wander = function() {

    if (Math.random() < 0.01) {
      c.as2 = Math.random();
    }

    let turn = c.as2 - 1 + c.as1;
    turn *= 10;

    c.turnAndMove(turn, c.speed/2);
    
  }

  c.sprint = function() {

    c.energy -= 1;
    c.hunger += 1;

    if (c.aenergy > 10) {
      c.move(c.speed);
      c.aenergy -= 1;
    }
    else {
      c.move(c.speed/3);
    }
    
  }

  c.eat = function() {
    for (let i = 0; i < game.mapDetails.length; i++) {
      let d = game.mapDetails[i];
      let dist2 = (d.x - c.x) ** 2 + (d.y - c.y) ** 2;
      if (dist2 < 800) {
        if (d.type == "berry_bush") {
          c.as1 += 1 / game.foodInfo.berry.eatTime;
          if (c.as1 >= 1) {
            d.type = "bush";
            d.stage = 0;
            c.hunger -= game.foodInfo.berry.foodValue * game.creatureStats.berry_muncher.foodCoefficient;
            c.thirst -= game.foodInfo.berry.waterValue * game.creatureStats.berry_muncher.foodCoefficient;
          }
          return true;
        }
      }
    }
    c.as1 = 0;
    return false;
  }

  c.sleep = function() {}

  c.allStates = [ "sleep", "wander", "sprint", "eat" ];
  
  c.update = function() {

    c.objective.strength -= 0.001;
    c.objective.strength = Math.max(c.objective.strength, -0.8);

    c.age++;

    let keys = Object.keys(c.influences);
    for (let i = 0 ; i < keys.length; i++) {
      let k = keys[i];
      c.influences[k].value -= 0.001;
      if (c.influences[k].value >= c.objective.strength) {
        c.objective.state = k;
        c.objective.strength = c.influences[k].value;
        c.objective.x = c.influences[k].x;
        c.objective.y = c.influences[k].y;
      }
      else if (c.influences[k].value < -1) {
        c.influences[k].value = -1;
      }
    }

    if (c.objective.state == "sleep") {
      c.energy += 4;
    }
    else {
      c.energy -= 1;
    }
    c.hunger += 1;
    c.aenergy += 1;
    c.thirst += 1;
    try {
      c[c.objective.state]();
    } catch(e) {
      console.log('state error: ' + e);
      console.log('state = ' + c.state);
    }
    
    if (c.energy < 100) {
      c.objective.state = "sleep";
      c.objective.strength = 1;
    }
    if (c.energy > 1700 && c.objective.state == "sleep") {
      c.objective.state = "wander";
      c.objective.strength = 0.5;
      c.aenergy = 100;
    }

    if (c.age % 10 == 0) {
      c.checkVision();
    }

    if (c.hunger > 20000) {
      //c.die();
    }
    
  }

  c.updatePos2 = function() {
    //let targetDist = 14;
    let targetDist2 = 196; // 14 squared

    let xdist = (c.x - c.x2);
    let ydist = (c.y - c.y2);

    let actualDist = xdist ** 2 + ydist ** 2;

    if (actualDist > targetDist2) {
      let coeff = 1 - targetDist2 / actualDist;
      c.x2 += xdist * coeff;
      c.y2 += ydist * coeff; // because it's squared, this technically isn't perfect, but it's close enough ._.
    }
  }

  c.turnAndMove = function(turn, move) {
    
    c.dir += turn;
    if (c.dir >= 360) c.dir -= 360;
    if (c.dir < 0) c.dir += 360;
    
    let coeff = 1;
    if (isAquaticBiome(getInfo(c.x/10, c.y/10).biome)) coeff = .25; // swimming!

    let coords = moveDirection(c.x, c.y, c.dir, move * coeff);
    if (isNaN(coords.x) || isNaN(coords.y)) {
      alert('nan at first movedir');
    }
    let translate = { x: coords.x - c.x, y: coords.y - c.y }

    let dist2 = 225; // 15 squared
    let inRange = false;
    let baseI = 0;

    let isToSkip = [];

    // this loop is written terribly but it does what it needs to do pretty fast so yay!
    for (let i = 0; i < game.mapDetails.length; i++) {

      let d = game.mapDetails[i];
      if (d.y > coords.y + 100) break;
      
      if (d.x < coords.x - 100 || d.x > coords.x + 100 || d.y < coords.y - 100 || d.y > coords.y + 100) {
        if (!inRange) {
          baseI = i;
          continue;
        }
      }
      inRange = true;

      if (!(isToSkip.includes(i)) && (d.x - coords.x) ** 2 + (d.y - coords.y) ** 2 < dist2) {
        isToSkip.push(i);
        coords = moveDirection(coords.x, coords.y, getDirection(d.x, d.y, coords.x, coords.y), 7); // change the 7
        i = baseI; // ew why am i changing the i value during a loop
      }
      
    }
    
    c.x = Math.max(0, Math.min(coords.x, game.mapWidth));
    c.y = Math.max(0, Math.min(coords.y, game.mapHeight));
    c.updatePos2();
    
  }

  c.turn = function(amt) { c.turnAndMove(amt, 0); }
  c.move = function(amt) { c.turnAndMove(0, amt); }

  c.die = function() {
    game.creatures.splice(game.creatures.indexOf(c), 1);
    c.dead = true;
  }
  
  c.drawSelf = function(ctx, cx, cy) {

    if (c.dead) return;

    if (c.tracked) {

      ctx.fillStyle = '#ffffff';
      fillCircle(ctx, c.x - cx, c.y - cy, 14);
      fillCircle(ctx, c.x2 - cx, c.y2 - cy, 12);
      
    }
    ctx.fillStyle = c.color;
    fillCircle(ctx, c.x - cx, c.y - cy, 12);
    fillCircle(ctx, c.x2 - cx, c.y2 - cy, 10);
    if (c.state == "sleep") ctx.globalAlpha = 0.4;
    ctx.fillStyle = c.eyeColor;
    let e1 = moveDirection(c.x, c.y, c.dir - 20, 8);
    let e2 = moveDirection(c.x, c.y, c.dir + 20, 8);
    fillCircle(ctx, e1.x - cx, e1.y - cy, 2);
    fillCircle(ctx, e2.x - cx, e2.y - cy, 2);
    ctx.globalAlpha = 1.0;

    /*
    if (isAquaticBiome(getInfo(c.x / 10, c.y / 10).biome)) {
      ctx.fillStyle = '#0000ff';
      let x = c.x + Math.floor(Math.random() * 21) - 11;
      let y = c.y + Math.floor(Math.random() * 21) - 11;
      ctx.fillRect(x - 1 - cx, y - 1 - cx, 2, 2);
    }*/
    
  }

  // empty arrays of coefficients to determine relative strengths of reactions to things! each number goes -1 to 1
  // a 1 means the creature will associate that thing with a very strong positive response, -1 is negative response
  // the arrays contain one value for each state the creature can be in, and those values determine how strongly the stimulus
  // makes the creature want to go into/avoid that state
  c.reactionArrays = {
    ambientSounds: { // all species have similar things in their ambient sounds array
      quietBranchSnap: [],
      mediumBranchSnap: [],
      loudBranchSnap: [],
      leafRustle: [],
      loudLeafRustle: [],
      runningWater: [],
      closeRunningWater: [],
      roar: [],
      roar2: [],
      roar3: [],
      boneCrunch: [],
      squeal: [],
      squeal2: [],
      campfire: [],
      bigFire: []
    },
    speciesSounds: { // sounds associated with this species specifically, allows communication. Other creatures may hear these sounds, but won't intereperet them differently fromm each other
      berryMuncherEat: [],
      berryMuncherSound1: [],
      berryMuncherSound2: [],
      berryMuncherSound3: [],
      berryMuncherSound4: [],
      berryMuncherSound5: [],
      berryMuncherSound6: [],
      berryMuncherSound7: []
    },
    visibleObjects: { // add to these as more things get added to sim
      berryMuncherSameSex: [],
      berryMuncherOppositeSex: [],
      bush: [],
      berryBush: [],
      oakTree: [],
      biomeColorRed: [],
      biomeColorGreen: [],
      biomeColorBlue: [],
      berryMuncherDead: []
    },
    scents: { // smells
      berryMuncher: [],
      berryBush: [],
      smoke: [],
      death: []
    },
    touch: { // things we can touch/feel
      berryBushEmpty: [],
      berryBushGrown: [],
      oakTree: [],
      berryMuncherSameSex: [],
      berryMuncherOppositeSex: [],
      water: []
    }
  };

  c.objective = {
    state: "wander",
    strength: 0.5,
    x: c.x,
    y: c.y
  };

  
  
  c.influences = {};
  for (let i = 0; i < c.allStates.length; i++) {
    c.influences[c.allStates[i]] = {
      value: 0,
      x: 0,
      y: 0
    }
  }

  let keys = Object.keys(c.reactionArrays); // populating the arrays of responses
  for (let i = 0; i < keys.length; i++) {
    let k = keys[i];
    let inKeys = Object.keys(c.reactionArrays[k])
    for (let j = 0; j < inKeys.length; j++) {
      let ik = inKeys[j];
      for (let n = 0; n < c.allStates.length; n++) { // n goes thru all the states and generates response values towards them
        if (c.ev && Math.random() < 0.999) { // if the creature is evolved, use the average of the two parents (or, rarely, mutate)
        c.reactionArrays[k][ik][n] = (c1.reactionArrays[k][ik][n] + c2.reactionArrays[k][ik][n]) / 2 + Math.random()*0.01 - 0.005;
          c.reactionArrays[k][ik][n] = Math.max(-1, Math.min(1, c.reactionArrays[k][ik][n]));
        }
        else {
          c.reactionArrays[k][ik][n] = Math.random() * 2 - 1;
        }
      }
      
    }
  }

  c.interperetStimulus = function(s) {
    let reaction = 0;
    if (c.reactionArrays[s.category] && c.reactionArrays[s.category][s.type]) {
      reaction = c.reactionArrays[s.category][s.type];
    }
    for (let i = 0; i < reaction.length; i++) {
      c.influences[c.allStates[i]].value += reaction[i];
      //c.influences[c.allStates[i]].x = s.x;
      //c.influences[c.allStates[i]].y = s.y;
    }
    return reaction;
  }

  c.previousVisionScores = [];

  c.checkVision = function() {

    for (let i = 0; i < c.allStates.length; i++) {
      let ps = c.previousVisionScores[i];
      if (ps) {
        c.influences[c.allStates[i]].value -= c.previousVisionScores[i];
      }
    }

    c.previousVisionScores = [];

    let cstats = game.creatureStats.berry_muncher;
    let visibleThings = getObjectsInSightCone(c.x, c.y, cstats.sightRange, c.dir, cstats.sightWidth);

    let vdetails = visibleThings.details;
    let vcreatures = visibleThings.creatures;

    for (let i = 0; i < vdetails.length; i++) {
      let d = vdetails[i];
      let reaction = c.interperetStimulus({
        category: 'visibleObjects',
        type: d.type,
        x: d.x,
        y: d.y
      });

      for (let i = 0; i < c.allStates.length; i++) {
        if (c.previousVisionScores[i]) {
          c.previousVisionScores[i] += reaction[i];
        }
        else {
          c.previousVisionScores[i] = reaction[i];
        }
      }
    }

    for (let i = 0; i < vcreatures.length; i++) {
      let vc = vcreatures[i];
      let reaction = c.interperetStimulus({
        category: 'visibleObjects',
        type: vc.gender == c.gender ? "berryMuncherSameSex" : "berryMuncherOppositeSex",
        x: vc.x,
        y: vc.y
      });

      for (let i = 0; i < c.allStates.length; i++) {
        if (c.previousVisionScores[i]) {
          c.previousVisionScores[i] += reaction[i];
        }
        else {
          c.previousVisionScores[i] = reaction[i];
        }
      }
    }
    
  }

  return c;
  
}

game.foodInfo = {
  berry: {
    foodValue: 100,
    waterValue: 7,
    eatTime: 10,
    category: "plant"
  }
};

// how many times the base energy each creature type receives for eating
game.foodCoefficients = {
  berry_muncher: 30
};

game.creatureStats = {
  berry_muncher: {
    foodCoefficient: 30,
    speed: 1,
    sightRange: 100,
    sightWidth: Math.PI/3
  }
}