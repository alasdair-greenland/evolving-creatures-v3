var game = game || {};

function getNoise(x, y, type) {
  let n = game[type].noise.simplex2(x, y); // [-1, 1]
  return (n/2) + 0.5; // scale to [0, 1];
}

function getInfo(x, y) {

  let biome = "";
  let color = "";
  
  let mapInTiles = game.mapWidth / game.tileSize;
  if (x <= 5 || x >= mapInTiles - 5 || y <= 5 || y >= mapInTiles - 5) return { biome: "ocean", color: '#003399' };
  
  let temperature = getNoise(x/300, y/300, "temperature");
  temperature = temperature / 2 + .25; // [ .25, .75 ]
  temperature += (y - mapInTiles/2) / (mapInTiles/2) * .25; // make temperature depend on north/south location
  let moisture = getNoise(x/150, y/150, "moisture");
  let elevation = getNoise(x/240, y/240, "elevation");
  let nx = 2 * x / mapInTiles - 1; // distance calculations
  let ny = 2 * y / mapInTiles - 1; // this is so we can make the map an island
  let d = 1 - (1 - nx ** 2) * (1 - ny ** 2);
  elevation = (elevation + (1 - d))/2;
  let variance = getNoise(x/500, y/500, "variance");

  let t = temperature;
  let m = moisture;
  let e = elevation;
  let v = variance;


  if (e < 0.47) return { biome: "ocean", color: '#003399' };

  if (Math.abs(v - 0.4) < 0.008) {
    return { biome: "river", color: '#003399' };
  }
  /*
  if (Math.abs(v - 0.4) < 0.008 && e < 0.8) {
    if (t < 0.85 && t > 0) return { biome: "river", color: '#003399' };
    else if (t >= 0.85) return { biome: "dry_riverbed", color: '#967506' };
  }*/
  
  if (e < 0.5) return { biome: "beach", color: '#ffc640' };

  if (m - e > 0.2) {
    if (t < 0.33) return { biome: "frozen_lake", color: '#9bebdc' };
    else if (t < 0.7) return { biome: "lake", color: '#003399' };
  }

  
  if (!game.mapDone) { 
    color = calcColor(e, t, m);
  }
  else {
    color = '#000000'; // color doesn't matter once map is drawn
  }

  /*
  if (e - t > 0.35) {
    if (m < 0.2) return { biome: "scorched_hilltop", color: color };
    if (m < 0.4) return { biome: "bare_hilltop", color: color };
    if (m < 0.7) return { biome: "tundra", color: color };
    return { biome: "snow", color: color };
  }*/
  if (e - t > 0.25) {
    if (m < 0.33) return { biome: "desert", color: color };
    if (m < 0.67) return { biome: "bushland", color: color };
    return { biome: "taiga", color: color };
  }
  if (e - t > 0) {
    if (m < 0.15) return { biome: "desert", color: color };
    if (m < 0.6) return { biome: "grassland", color: color };
    if (m < 0.8) return { biome: "deciduous_forest", color: color };
    return { biome: "rainforest", color: color };
  }
  else {
    if (m < 0.35) return { biome: "desert", color: color };
    if (m < 0.5) return { biome: "grassland", color: color };
    if (m < 0.65) return { biome: "deciduous_forest", color: color };
    return { biome: "rainforest", color: color };
  }
  
  return { biome: "grassland", color: "#00ee33" };
  
}




function calcColor(e, t, m) {

  let x = ((e-t) + 1) * 99.99999;
  let y = m * 99.99999;

  x = Math.floor(x);
  y = Math.floor(y);

  return game.colorFinder[x][y];

}

function averageColorMap(lst) {

  let out = [];

  for (let i = 0; i < lst.length; i++) {
    for (let j = 0; j < lst[i].length; j++) {
      if (!out[i]) {
        out[i] = [];
      }
      if (i == 0 || j == 0 || i == lst.length - 1 || j == lst[i].length - 1) {
        out[i][j] = lst[i][j];
      }
      else {
        let c1 = lst[i - 1][j];
        let c2 = lst[i + 1][j];
        let c3 = lst[i][j - 1];
        let c4 = lst[i][j + 1];
        let b1 = blendColors(c1, c2, 0.5);
        let b2 = blendColors(c3, c4, 0.5);
        out[i][j] = blendColors(b1, b2, 0.5);
      }
    }
  }

  return out;
  
}

function colorFinderValues(i, j) {

  /*
  if (i > 135) {
    if (j < 20) return { biome: "scorched_hilltop", color: '#ffcccc' };
    if (j < 40) return { biome: "bare_hilltop", color: '#cccccc' };
    if (j < 70) return { biome: "tundra", color: '#d8d8d8' };
    return { biome: "snow", color: '#ffffff' };
  }*/
  if (i > 125) {
    if (j < 33) return { biome: "desert", color: '#ffbb29' };
    if (j < 67) return { biome: "bushland", color: '#b88e11' };
    return { biome: "taiga", color: '#ddffdd' };
  }
  if (i > 100) {
    if (j < 15) return { biome: "desert", color: '#ffbb29' };
    if (j < 60) return { biome: "grassland", color: "#00ee33" };
    if (j < 80) return { biome: "deciduous_forest", color: '#12a120' };
    return { biome: "rainforest", color: "#0d7507" };
  }
  else {
    if (j < 35) return { biome: "desert", color: '#ffbb29' };
    if (j < 50) return { biome: "grassland", color: "#00ee33" };
    if (j < 65) return { biome: "deciduous_forest", color: '#12a120' };
    return { biome: "rainforest", color: "#0d7507" };
  }
}

function isAquaticBiome(b) {
  return [ "river", "lake", "ocean" ].includes(b);
}