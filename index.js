/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable max-statements */
/* eslint-disable complexity */

//Create a Pixi Application
let app = new PIXI.Application({
  width: 1280,
  height: 720,
  antialias: true,
  transparent: false,
  //resolution: 1,
  autoDensity: true,
  backgroundColor: 0x0e6251,
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById('playfield').appendChild(app.view)

let gameSpeedPlayer = 1.00;
let gameSpeedParticles = 2.00;

const particles = []
const particlesCount = 16
const particlesSpawnCounterLimit = 30;
let particlesSpawnCounter = 0

let player = {}
let playerTexC = [
  PIXI.Texture.from('Player01.png'),
  PIXI.Texture.from('Player02.png'),
  PIXI.Texture.from('Player03.png'),
  PIXI.Texture.from('Player02.png')
]

let playerTexD = 0
let playerAnimationLimit = 10
let playerAnimationCounter = 0

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
    circle.beginFill(0x17202a);
    circle.drawCircle(xmin + (xmax - xmin) / 2, ymin + (ymax - ymin) / 2, radius);
    circle.endFill();
    app.stage.addChild(circle);
  }

  // setup particles
  for (let index = 0; index < particlesCount; index++) {
    const newSprite = new PIXI.Sprite.from('Particle03.png');
    newSprite.anchor.x = 0.5
    newSprite.anchor.y = 0.5
    newSprite.scale.x = 0.50
    newSprite.scale.y = 0.50
    newSprite.vx = 0
    newSprite.vy = 0
    particles[index] = newSprite;
  }

  // setup player
  {
    const newSprite = new PIXI.Sprite.from(playerTexC[playerTexD]);
    newSprite.anchor.x = 0.5
    newSprite.anchor.y = 0.5
    newSprite.scale.x = 4.0
    newSprite.scale.y = 4.0
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

  const stepIterations = Math.ceil(Math.max(gameSpeedPlayer, gameSpeedParticles))
  const stepSizeParticles = gameSpeedParticles / stepIterations;
  const stepSizePlayer = gameSpeedPlayer / stepIterations

  for (let index = 0; index < stepIterations; index++) {

    // move the particles
    moveParticles(stepSizeParticles)

    // move the player
    movePlayer(stepSizePlayer)

    // collision detection
    collision();
  }

  /*
    // collision detection
    collision();
  */
}

function spawnParticles() {

  // disable spawning of particles until player moves
  if (player.vx === 0.0 && player.vy === 0) {
    return;
  }

  // disable spawning of particles before frame count
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

      // aim particle
      aimSprite(particle, pvelocity)

      // add to container
      app.stage.addChild(particle)

      // we're done
      break;
    }
  }
}

function moveParticles(step) {

  for (let index = 0; index < particlesCount; index++) {

    // create an alias
    const particle = particles[index]

    // move particle
    if (particle.parent !== null) {
      particle.x = particle.x + (particle.vx * step)
      particle.y = particle.y + (particle.vy * step)

      // visual metrics
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

function movePlayer(step) {

  // disable animation of player until player moves
  if (player.vx === 0 && player.vy === 0) {
    return;
  }

  // animation
  playerAnimationCounter += step;
  while (playerAnimationCounter >= playerAnimationLimit) {
    playerAnimationCounter -= playerAnimationLimit;
    playerTexD = (playerTexD + 1) % playerTexC.length
    player.texture = playerTexC[playerTexD]
  }

  // move
  player.x = player.x + (player.vx * step)
  player.y = player.y + (player.vy * step)

  // visual metrics
  const vm = getVisualMetrics();

  // check for boundary collision

  // calculate distance of player from origin of playfield
  // calculate radius boundary from origin of playfield
  const pv = [player.x, player.y]
  const ov = [vm.xmin + (vm.xmax - vm.xmin) / 2, vm.ymin + (vm.ymax - vm.ymin) / 2]
  const distancev = vec2Direction(ov, pv)
  const distance = vec2Magnitude(distancev)
  const radius = radiusFactor * Math.min((vm.xmax - vm.xmin) / 2, (vm.ymax - vm.ymin) / 2)

  if (distance >= radius) {

    // bounce the player off the playfield boundary

    const nv = vec2Normalize(vec2Direction(pv, ov))
    const dv = vec2Normalize([player.vx, player.vy])

    // formula to calculate reflection vector
    // r = d - 2(d.n)n
    const temp1 = 2 * vec2Dot(dv, nv)
    const temp2 = [temp1 * nv[0], temp1 * nv[1]]
    const temp3 = [dv[0] - temp2[0], dv[1] - temp2[1]]

    aimSprite(player, temp3)
  }
}

function collision() {

  // visual metrics
  const vm = getVisualMetrics();

  const playerRadius = Math.min(player.width, player.height) / 2
  const playerOrigin = [player.x, player.y]

  for (let index = 0; index < particlesCount; index++) {

    // create an alias
    const particle = particles[index]

    if (particle.parent !== null) {
      const particleRadius = Math.min(particle.width, particle.height) / 2;
      const particleOrigin = [particle.x, particle.y]
      const dv = vec2Direction(particleOrigin, playerOrigin)
      const distance = vec2Magnitude(dv)
      const collisionDistance = Math.max(playerRadius, particleRadius)

      if (distance < collisionDistance) {
        app.stage.removeChild(particle)
        gameSpeedPlayer *= 1.10;
        gameSpeedParticles *= 1.05;
        player.scale.x /= 1.10;
        player.scale.y /= 1.10;
        //playerAnimationLimit *= 0.9;
      }
    }
  }
}

function getVisualMetrics() {
  return {
    height: app.renderer.height,
    width: app.renderer.width,
    xmin: 0,
    xmax: app.renderer.width - 1,
    ymin: 0,
    ymax: app.renderer.height - 1,
  }
}

function aimSprite(sprite, nv) {
  const pr = vec2Rotation(nv)
  sprite.rotation = pr;
  sprite.vx = nv[0]
  sprite.vy = nv[1]
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
window.addEventListener('touchstart', playfieldTouch, false);

function playfieldClick(event) {

  const p = new PIXI.Point()
  app.renderer.plugins.interaction.mapPositionToPoint(p, event.x, event.y)

  // construct a vector from the sprite to the point
  const pv = [p.x - player.x, p.y - player.y]
  const pn = vec2Normalize(pv)

  // aim the player
  aimSprite(player, pn)
}

function playfieldTouch(event) {
  const p = new PIXI.Point()
  app.renderer.plugins.interaction.mapPositionToPoint(
    p,
    event.touches[0].clientX,
    event.touches[0].clientY)

  // construct a vector from the sprite to the point
  const pv = [p.x - player.x, p.y - player.y]
  const pn = vec2Normalize(pv)

  // aim the player
  aimSprite(player, pn)
}
