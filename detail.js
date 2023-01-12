var game = game || {};

// all functions to draw details should go here!


function redrawDetailImage() {

  let cctx = game.mapImageDetail.getContext("2d");
  for (let i = 0; i < game.mapDetails.length; i++) {
    let d = game.mapDetails[i];
    //alert(d.type);
    try {
      game.drawDetail[d.type](cctx, d.x, d.y); 
    } catch(e) {
      
    }
  }
}

function sortDetails() {

  game.mapDetails.sort( (a, b) => { return (a.y - b.y); } );
  
}

function drawDetails(ctx, cx, cy) {
  let w = window.innerWidth;
  let h = window.innerHeight;
  for (let i = 0; i < game.mapDetails.length; i++) {
    let d = game.mapDetails[i];
    if (d.x > cx - 10 && d.y > cy - 10 && d.x < cx + w + 10 && d.y < cy + h + 10) {
      let fn = game.drawDetail[d.type];
      try {
        fn(ctx, d.x - cx, d.y - cy);
      } catch (e) {
        
      }
    }
  }
}

function updateDetailImage(x, y, type) {

  let cctx = game.mapImageDetail.getContext("2d");
  game.drawDetail[type](cctx, x, y);
  
}

function drawOakTree(ctx, x, y) {

  
  game.images = game.images || {};

  if (!game.images.oak_tree) {
    game.images.oak_tree = new Image();
    game.images.oak_tree.src = "./detail_images/oak_tree_2.png";
  }

  ctx.drawImage(game.images.oak_tree, x - 25, y - 45, 50, 50);

}

function drawBush(ctx, x, y) {


  game.images = game.images || {};

  if (!game.images.bush) {
    game.images.bush = new Image();
    game.images.bush.src = "./detail_images/bush_1.png";
  }

  ctx.drawImage(game.images.bush, x - 18, y - 31, 36, 36);
  
}

function drawBerryBush(ctx, x, y) {


  game.images = game.images || {};

  if (!game.images.berry_bush) {
    game.images.berry_bush = new Image();
    game.images.berry_bush.src = "./detail_images/berry_bush_1.png";
  }

  ctx.drawImage(game.images.berry_bush, x - 18, y - 31, 36, 36);
  
}

game.drawDetail = {

  oak_tree: drawOakTree,
  bush: drawBush,
  berry_bush: drawBerryBush
  
};