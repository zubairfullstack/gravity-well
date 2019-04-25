/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable max-statements */
/* eslint-disable complexity */

//Create a Pixi Application
let app = new PIXI.Application({
  width: 640,
  height: 640,
  antialias: true,
  transparent: false,
  //resolution: 1,
  autoDensity: true,
  backgroundColor: 0x800000,
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById('playfield').appendChild(app.view)

const particles = []
const particlesCount = 4
const particlesSpeed = 2.0
const particlesSpawnCounterLimit = 60;
let particlesSpawnCounter = 0

let player = {}
let playerSpeed = 2.0;

let radiusFactor = 0.9375

function setup() {

  const height = app.renderer.height;
  const width = app.renderer.width;

  const xmin = 0
  const xmax = width - 1
  const ymin = 0
  const ymax = height - 1

  {
    const radius = radiusFactor * Math.min((xmax - xmin) / 2, (ymax - ymin) / 2)
    let circle = new PIXI.Graphics();
    circle.beginFill(0x000000);
    circle.drawCircle(xmin + (xmax - xmin) / 2, ymin + (ymax - ymin) / 2, radius);
    circle.endFill();
    app.stage.addChild(circle);
  }

  // setup particles
  for (let index = 0; index < particlesCount; index++) {
    const newSprite = new PIXI.Sprite.from('cat.png');
    newSprite.anchor.x = 0.5
    newSprite.anchor.y = 0.5
    newSprite.scale.x = 0.25
    newSprite.scale.y = 0.25
    newSprite.vx = 0
    newSprite.vy = 0
    particles[index] = newSprite;
  }

  // setup player
  {
    const newSprite = new PIXI.Sprite.from('cat.png');
    newSprite.anchor.x = 0.5
    newSprite.anchor.y = 0.5
    newSprite.scale.x = 0.5
    newSprite.scale.y = 0.5
    newSprite.vx = 0
    newSprite.vy = 0
    newSprite.x = xmin + (xmax - xmin) / 2
    newSprite.y = xmin + (ymax - ymin) / 2

    player = newSprite
    app.stage.addChild(player);
  }

  //Start the game loop by adding the `gameLoop` function to
  //Pixi's `ticker` and providing it with a `delta` argument.
  app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {

  // spawn the particles
  spawnParticles();

  // move the particles
  moveParticles(1.0)

  // move the player
  movePlayer(1.0)

  // collision detection
  collision();
}

function spawnParticles() {

  particlesSpawnCounter += 1
  if (particlesSpawnCounter < particlesSpawnCounterLimit) {
    return;
  } else {
    particlesSpawnCounter = 0;
  }

  for (let index = 0; index < particlesCount; index++) {

    // create an alias
    const particle = particles[index]

    if (particle.parent === null) {

      const height = app.renderer.height;
      const width = app.renderer.width;

      const xmin = 0
      const xmax = width - 1
      const ymin = 0
      const ymax = height - 1

      // setup this particle

      let pstart = []
      let pend = []

      if (0.5 <= Math.random()) {

        // x axis
        if (0.5 <= Math.random()) {
          pstart[0] = xmin
          pend[0] = xmax
        } else {
          pstart[0] = xmax
          pend[0] = xmin
        }

        pstart[1] = ymin + (ymax - ymin) * Math.random()
        pend[1] = ymin + (ymax - ymin) * Math.random()

      } else {

        // y axis
        if (0.5 <= Math.random()) {
          pstart[1] = ymin
          pend[1] = ymax
        } else {
          pstart[1] = ymax
          pend[1] = ymin
        }

        pstart[0] = xmin + (xmax - xmin) * Math.random()
        pend[0] = xmin + (xmax - xmin) * Math.random()

      }

      const pvelocity = vec2Normalize(vec2Direction(pstart, pend))

      particle.x = pstart[0];
      particle.y = pstart[1];

      particle.vx = pvelocity[0];
      particle.vy = pvelocity[1];

      // add to container
      app.stage.addChild(particle)

      // we're done
      break;
    }
  }
}

function moveParticles(delta) {
  for (let index = 0; index < particlesCount; index++) {

    // create an alias
    const particle = particles[index]

    // move particle
    if (particle.parent !== null) {
      particle.x = particle.x + (particle.vx * particlesSpeed) * delta
      particle.y = particle.y + (particle.vy * particlesSpeed) * delta

      const height = app.renderer.height;
      const width = app.renderer.width;

      const xmin = 0
      const xmax = width - 1
      const ymin = 0
      const ymax = height - 1

      // check for boundary collision
      if (particle.parent !== null && (particle.x < xmin || xmax < particle.x)) {
        app.stage.removeChild(particle)
      }

      // check for boundary collision
      if (particle.parent !== null && (particle.y < ymin || ymax < particle.y)) {
        app.stage.removeChild(particle)
      }
    }
  }
}

function movePlayer(delta) {

  const height = app.renderer.height;
  const width = app.renderer.width;

  const xmin = 0
  const xmax = width - 1
  const ymin = 0
  const ymax = height - 1

  player.x = player.x + (player.vx * playerSpeed) * delta;
  player.y = player.y + (player.vy * playerSpeed) * delta;

  // check for boundary collision
  const pv = [player.x, player.y]
  const ov = [xmin + (xmax - xmin) / 2, ymin + (ymax - ymin) / 2]
  //debugger;
  const distancev = vec2Direction(ov, pv)
  const distance = vec2Magnitude(distancev)
  const radius = radiusFactor * Math.min((xmax - xmin) / 2, (ymax - ymin) / 2)

  if (distance >= radius) {

    const nv = vec2Normalize(vec2Direction(pv, ov))
    const dv = vec2Normalize([player.vx, player.vy])

    // r = d - 2(d.n)n
    const temp1 = 2 * vec2Dot(dv, nv)
    const temp2 = [temp1 * nv[0], temp1 * nv[1]]
    const temp3 = [dv[0] - temp2[0], dv[1] - temp2[1]]

    aimPlayer(temp3)
  }
}

function collision() {

  const height = app.renderer.height;
  const width = app.renderer.width;

  const xmin = 0
  const xmax = width - 1
  const ymin = 0
  const ymax = height - 1

  const playerRadius = Math.min(player.width, player.height) / 2

  const playerv = [player.x, player.y]


  for (let index = 0; index < particlesCount; index++) {

    // create an alias
    const particle = particles[index]

    if (particle.parent !== null) {
      const particleRadius = Math.min(particle.width, particle.height) / 2;
      const particlev = [particle.x, particle.y]
      const dv = vec2Direction(particlev, playerv)
      const distance = vec2Magnitude(dv)
      const collisionDistance = playerRadius;

      if (distance < collisionDistance) {
        app.stage.removeChild(particle)
      }
    }
  }
}

function aimPlayer(nv) {
  const pr = vec2Rotation(nv)
  player.rotation = pr;
  player.vx = nv[0]
  player.vy = nv[1]
}

function vec2Direction(s, e) {
  const result = [e[0] - s[0], e[1] - s[1]]
  return result
}

function vec2Magnitude(p) {
  const result = Math.sqrt((p[0] * p[0]) + (p[1] * p[1]));
  return result
}

function vec2Normalize(p) {
  const mag = vec2Magnitude(p);
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
  const pnorth = [0, -1]
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
  const pv = [p.x - player.x, p.y - player.y]
  const pn = vec2Normalize(pv)
  aimPlayer(pn)
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
