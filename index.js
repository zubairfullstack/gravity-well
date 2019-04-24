
//Create a Pixi Application
let app = new PIXI.Application({
  width: 480,
  height: 270,
  antialias: true,
  transparent: false,
  //resolution: 1,
  autoDensity: true,
  backgroundColor: 0x800000,
});


//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById('playfield').appendChild(app.view)

let sprite = new PIXI.Sprite.from('cat.png');
sprite.anchor.x = 0.5
sprite.anchor.y = 0.5

function setup() {

  const height = app.renderer.height;
  const width = app.renderer.width;

  sprite.x = width / 2
  sprite.y = height / 2
  sprite.vx = 0;
  sprite.vy = 0;

  app.stage.addChild(sprite);

  //Start the game loop by adding the `gameLoop` function to
  //Pixi's `ticker` and providing it with a `delta` argument.
  app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {


  const height = app.renderer.height;
  const width = app.renderer.width;

  sprite.x += sprite.vx * delta;
  sprite.y += sprite.vy * delta;

  if (sprite.x < 0 || sprite.x > width) {
    sprite.vx = -sprite.vx;
    const rotation = vec2Rotation([sprite.vx, -sprite.vy])
    sprite.rotation = rotation;
  }

  if (sprite.y < 0 || sprite.y > height) {
    sprite.vy = -sprite.vy;
    const rotation = vec2Rotation([sprite.vx, -sprite.vy])
    sprite.rotation = rotation;
  }
}

function vec2Normalize(p) {
  const mag = Math.sqrt((p[0] * p[0]) + (p[1] * p[1]));
  const r = []
  r[0] = p[0] / mag;
  r[1] = p[1] / mag;

  return r;
}

function vec2Dot(p1, p2) {
  const r = p1[0] * p2[0] + p1[1] * p2[1]
  return r;
}

function vec2Rotation(p1) {
  const pnorth = [0, 1]
  const pnorm = vec2Normalize(p1)
  const pdot = vec2Dot(pnorth, pnorm)
  const prot = Math.acos(pdot)
  const result = (0 <= p1[0]) ? prot : (Math.PI) + (Math.PI - prot)
  return result
}


// run the game setup
setup();

window.addEventListener('click', playfieldClick, false);

function playfieldClick(event) {

  const p = new PIXI.Point()
  app.renderer.plugins.interaction.mapPositionToPoint(p, event.x, event.y)

  // construct a vector from the sprite to the point
  const pv = [p.x - sprite.x, -(p.y - sprite.y)]
  const pvn = vec2Normalize(pv)
  const pr = vec2Rotation(pv)
  console.log(pr);
  sprite.rotation = pr;
  sprite.vx = pvn[0] * 4
  sprite.vy = -pvn[1] * 4
}

/*
const sprites = {};

const loader = PIXI.Loader.shared
loader.add('cat', 'cat.png')
loader.load((loader, resources) => {
  sprites.cat = new PIXI.Sprite(resources.cat.texture);
})
*/
//app.stage.x = 128
//app.stage.y = 128
/*
let sprite = new PIXI.Sprite.from('cat.png');
sprite.anchor.set(0.5); // This will set the origin to center. (0.5) is same as (0.5, 0.5).
sprite.x = 0;
sprite.y = 0;
app.stage.addChild(sprite);


const updatePoints = (event) => {
  const p = new PIXI.Point()
  app.renderer.plugins.interaction.mapPositionToPoint(p, event.x, event.y)
  sprite.x = p.x
  sprite.y = p.y
}

*/
