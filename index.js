/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable max-statements */
/* eslint-disable complexity */

var clientw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var clienth = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var clientm = Math.min(clientw, clienth)


//Create a Pixi Application
let app = new PIXI.Application({
  width: (clientm * 0.90),
  height: (clientm * 0.90),
  antialias: true,
  transparent: false,
  autoDensity: true,
  backgroundColor: 0x1B4F72
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById('playfield').appendChild(app.view)

let gameSpeedPlayer = 1.00 * clientw / 1000;
let gameSpeedParticles = 2.00 * clientw / 1000;
let gameScoreBorder = {}
let gameScoreBackground = {}
let gameScoreText = {}
let gameScore = 0
const gameScoreLimit = 1000
let gameDirection = -1
let gameDirectionSteps = 0
const gameDirectionStepsLimit = 20

const particles = []
const particlesCount = 16
const particlesSpawnCounterLimit = 30;
let particlesSpawnCounter = 0

let player = {}
let playerTexC = [
  PIXI.Texture.from('Player100.png'),
  PIXI.Texture.from('Player101.png'),
  PIXI.Texture.from('Player102.png'),
  PIXI.Texture.from('Player101.png')
]

let playerTexD = 0
let playerAnimationLimit = 10 * clientw / 1000
let playerAnimationCounter = 0

let radiusFactor = 0.9375
let playerFactor = 1.0
let particleFactor = 1.0

let radiusSize = 1
let particleSize = 1
let playerSize = 1


function reset() {

  // visual metrics
  const vm = getVisualMetrics();

  gameSpeedPlayer = 1.00;
  gameSpeedParticles = 2.00;
  gameScore = 0
  gameDirection = -1
  particlesSpawnCounter = 0

  playerTexD = 0
  playerAnimationLimit = 10
  playerAnimationCounter = 0

  // remove all particles from view
  for (let index = 0; index < particles.length; index++) {

    // create an alias
    const particle = particles[index]

    // remove the particle
    if (particle.parent !== null) {
      app.stage.removeChild(particle)
    }
  }

  // reset the player
  player.x = vm.xmin + (vm.xmax - vm.xmin) / 2
  player.y = vm.xmin + (vm.ymax - vm.ymin) / 2
  player.rotation = 0
  player.vx = 0
  player.vy = 0
  playerTexD = 0
  player.texture = playerTexC[playerTexD]
  {
    const newSpriteSize = 128
    const newSpriteScale = playerSize / newSpriteSize;
    player.scale.x = newSpriteScale
    player.scale.y = newSpriteScale
  }
}

function setup() {

  // visual metrics
  const vm = getVisualMetrics();

  // calculate the radius size
  radiusSize = radiusFactor * Math.min((vm.height), (vm.width)) / 2

  // playfield
  {
    let circle = new PIXI.Graphics();
    circle.lineStyle(Math.max(1, radiusSize / 64), 0xffffff, 1);
    circle.beginFill(0x000000);
    //    circle.beginFill(0x17202a);
    circle.drawCircle(vm.xmin + (vm.xmax - vm.xmin) / 2, vm.ymin + (vm.ymax - vm.ymin) / 2, radiusSize);
    circle.endFill();
    app.stage.addChild(circle);
  }

  // button 1
  {
    // button 1 metrics
    const bm = getButton1Metrics();

    let circle = new PIXI.Graphics();
    circle.beginFill(0xffffff);
    circle.drawCircle(bm.borderOrigin[0], bm.borderOrigin[1], bm.borderRadius);
    circle.endFill();
    app.stage.addChild(circle);
  }

  // button 1
  {
    // button 1 metrics
    const bm = getButton1Metrics();

    let circle = new PIXI.Graphics();
    circle.beginFill(0xE74C3C);
    circle.drawCircle(bm.borderOrigin[0], bm.borderOrigin[1], bm.buttonRadius);
    circle.endFill();
    app.stage.addChild(circle);
  }

  // button 2
  {
    // button 2 metrics
    const bm = getButton2Metrics();

    gameScoreBorder = new PIXI.Graphics();
    gameScoreBorder.beginFill(0xffffff);
    gameScoreBorder.drawCircle(bm.borderOrigin[0], bm.borderOrigin[1], bm.borderRadius);
    gameScoreBorder.endFill();
    app.stage.addChild(gameScoreBorder);
  }

  // button 2
  {
    // button 2 metrics
    const bm = getButton2Metrics();

    let gameScoreBackground = new PIXI.Graphics();
    gameScoreBackground.beginFill(0x000000);
    gameScoreBackground.drawCircle(bm.borderOrigin[0], bm.borderOrigin[1], bm.buttonRadius);
    gameScoreBackground.endFill();
    app.stage.addChild(gameScoreBackground);
  }

  // score
  {
    // button 2 metrics
    const bm = getButton2Metrics();

    let style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 3 * bm.borderRadius / 4,
      fill: "#e8f8f5",
      stroke: '#c0392b',
      strokeThickness: 0,
      dropShadow: false,
    })

    gameScoreText = new PIXI.Text(gameScore, style);
    gameScoreText.x = bm.borderOrigin[0]
    gameScoreText.y = bm.borderOrigin[1]
    gameScoreText.anchor.x = 0.5
    gameScoreText.anchor.y = 0.5
    app.stage.addChild(gameScoreText);

  }

  // calculate the particle size
  particleSize = (radiusSize * 2) / 30

  // calculate the player size
  playerSize = (radiusSize * 2) / 5

  // setup particles
  for (let index = 0; index < particlesCount; index++) {
    const newSprite = new PIXI.Sprite.from('Particle100.png');
    // unable to query the texture size as it may not be loaded yet
    // sprite size is known to be 32x32 => use hard coded value
    const newSpriteSize = 32
    const newSpriteScale = particleSize / newSpriteSize;
    newSprite.anchor.x = 0.5
    newSprite.anchor.y = 0.5
    newSprite.scale.x = newSpriteScale
    newSprite.scale.y = newSpriteScale
    newSprite.vx = 0
    newSprite.vy = 0
    particles[index] = newSprite;
  }

  // setup player
  {
    const newSprite = new PIXI.Sprite.from(playerTexC[playerTexD]);
    // unable to query the texture size as it may not be loaded yet
    // sprite size is known to be 128x128 => use hard coded value
    const newSpriteSize = 128
    const newSpriteScale = playerSize / newSpriteSize;
    newSprite.anchor.x = 0.5
    newSprite.anchor.y = 0.5
    newSprite.scale.x = newSpriteScale
    newSprite.scale.y = newSpriteScale
    newSprite.vx = 0
    newSprite.vy = 0
    newSprite.x = vm.xmin + (vm.xmax - vm.xmin) / 2
    newSprite.y = vm.xmin + (vm.ymax - vm.ymin) / 2

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

    // this is a workaround to enforce z ordering
    // the player should be rendered above all particles
    // remove the player
    // add the player
    app.stage.removeChild(player);
    app.stage.addChild(player);

    // move the player
    movePlayer(stepSizePlayer)

    // collision detection
    collision();
  }

  // update the score
  gameScoreText.text = gameScore
}

function spawnParticles() {

  // disable spawning of particles until player moves
  if (player.vx === 0.0 && player.vy === 0) {
    return;
  }

  // slow down spawning of particles based on frame count
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

      // visual metrics
      const vm = getVisualMetrics();

      // setup this particle

      let pstart = []
      let pend = []

      if (0.5 <= Math.random()) {

        // x axis
        if (0.5 <= Math.random()) {
          pstart[0] = vm.xmin
          pend[0] = vm.xmax
        } else {
          pstart[0] = vm.xmax
          pend[0] = vm.xmin
        }

        pstart[1] = vm.ymin + (vm.ymax - vm.ymin) * Math.random()
        pend[1] = vm.ymin + (vm.ymax - vm.ymin) * Math.random()

      } else {

        // y axis
        if (0.5 <= Math.random()) {
          pstart[1] = vm.ymin
          pend[1] = vm.ymax
        } else {
          pstart[1] = vm.ymax
          pend[1] = vm.ymin
        }

        pstart[0] = vm.xmin + (vm.xmax - vm.xmin) * Math.random()
        pend[0] = vm.xmin + (vm.xmax - vm.xmin) * Math.random()

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
      const vm = getVisualMetrics();

      // check for boundary collision
      if (particle.parent !== null && (particle.x < vm.xmin || vm.xmax < particle.x)) {
        app.stage.removeChild(particle)
      }

      // check for boundary collision
      if (particle.parent !== null && (particle.y < vm.ymin || vm.ymax < particle.y)) {
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

  // check for player boundary collision
  boundaryCheckPlayer(true);
}

function boundaryCheckPlayer(bounce) {

  // visual metrics
  const vm = getVisualMetrics();

  // check for boundary collision

  // calculate distance of player from origin of playfield
  // calculate radius boundary from origin of playfield
  const pv = [player.x, player.y]
  const ov = [vm.xmin + (vm.xmax - vm.xmin) / 2, vm.ymin + (vm.ymax - vm.ymin) / 2]
  const distancev = vec2Direction(ov, pv)
  const distance = vec2Magnitude(distancev) + (player.width / 2)
  const radius = radiusFactor * Math.min((vm.xmax - vm.xmin) / 2, (vm.ymax - vm.ymin) / 2)

  if (distance >= radius) {

    const nv = vec2Normalize(vec2Direction(pv, ov))
    const dv = vec2Normalize([player.vx, player.vy])

    // bounce the player off the playfield boundary
    if (bounce === true) {

      // formula to calculate reflection vector
      // r = d - 2(d.n)n
      const temp1 = 2 * vec2Dot(dv, nv)
      const temp2 = [temp1 * nv[0], temp1 * nv[1]]
      const temp3 = [dv[0] - temp2[0], dv[1] - temp2[1]]

      aimSprite(player, temp3)
    }

    // move the player back to the playfield
    const adjust = distance - radius;
    player.x = player.x + nv[0] * adjust;
    player.y = player.y + nv[1] * adjust;

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

        // positive collision

        // remvove the particle
        app.stage.removeChild(particle)

        // increase the score
        gameScore = (gameScore + 1) % gameScoreLimit

        // process game direction logic
        if (0 > gameDirection) {
          gameSpeedPlayer *= 1.10;
          gameSpeedParticles *= 1.05;
          player.scale.x *= 1 / 1.10;
          player.scale.y *= 1 / 1.10;
        } else {
          gameSpeedPlayer *= 1 / 1.10;
          gameSpeedParticles *= 1 / 1.05;
          player.scale.x *= 1.10;
          player.scale.y *= 1.10;
        }

        // process game direction change logic
        gameDirectionSteps++;
        if (gameDirectionSteps >= gameDirectionStepsLimit) {
          gameDirectionSteps -= gameDirectionStepsLimit
          gameDirection = -gameDirection
        }

        // increasing the player size may violate the playfield boundary
        // => handle this condition
        boundaryCheckPlayer(true);
      }
    }
  }
}

//--------------------------------------------------
// helper functions
//--------------------------------------------------

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

function getButton1Metrics() {

  // visual metrics
  const vm = getVisualMetrics();
  const playfieldDiameter = radiusFactor * Math.min((vm.height), (vm.width))

  const borderMargin = (vm.height - playfieldDiameter) / 2;
  const borderRadius = playfieldDiameter / 16;
  const borderOrigin = [
    vm.xmin + borderMargin + borderRadius,
    vm.ymax - borderMargin - borderRadius
  ]

  const buttonRadius = borderRadius * 0.9;

  return {
    borderMargin,
    borderRadius,
    borderOrigin,
    buttonRadius
  }
}

function getButton2Metrics() {

  // visual metrics
  const vm = getVisualMetrics();
  const playfieldDiameter = radiusFactor * Math.min((vm.height), (vm.width))

  const borderMargin = (vm.height - playfieldDiameter) / 2;
  const borderRadius = playfieldDiameter / 16;
  const borderOrigin = [
    vm.xmax - borderMargin - borderRadius,
    vm.ymax - borderMargin - borderRadius
  ]

  const buttonRadius = borderRadius * 0.9;

  return {
    borderMargin,
    borderRadius,
    borderOrigin,
    buttonRadius
  }
}

function aimSprite(sprite, nv) {
  const pr = vec2Rotation(nv)
  sprite.rotation = pr;
  sprite.vx = nv[0]
  sprite.vy = nv[1]
}

//--------------------------------------------------
// vector functions
//--------------------------------------------------

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

//--------------------------------------------------
// control input
//--------------------------------------------------

window.addEventListener('mousedown', playfieldMouseDown, false);
window.addEventListener('touchstart', playfieldTouch, false);

function playfieldMouseDown(event) {

  // get the input location
  const p = new PIXI.Point()
  app.renderer.plugins.interaction.mapPositionToPoint(p, event.x, event.y)

  // process in the input
  processInput(p);
}

function playfieldTouch(event) {

  // get the input location
  const p = new PIXI.Point()
  app.renderer.plugins.interaction.mapPositionToPoint(
    p, event.touches[0].clientX, event.touches[0].clientY
  )

  // process in the input
  processInput(p);
}

function processInput(p) {

  // visual metrics
  const vm = getVisualMetrics();

  // check for a click on the playfield
  {
    // construct a vector from the playfield origin to the point
    const ov = [(vm.xmin + (vm.xmax - vm.xmin) / 2) - p.x, (vm.ymin + (vm.ymax - vm.ymin) / 2) - p.y]
    const om = vec2Magnitude(ov)

    if (om <= radiusSize) {

      // construct a vector from the player origin to the point
      const pv = [p.x - player.x, p.y - player.y]

      // aim the player
      aimSprite(player, vec2Normalize(pv))
    }
  }

  // check for a click on button 1
  {
    // button metrics
    const bm = getButton1Metrics();

    // construct a vector from the button origin to the point
    const ov = [bm.borderOrigin[0] - p.x, bm.borderOrigin[1] - p.y]
    const om = vec2Magnitude(ov)
    if (om <= bm.buttonRadius) {
      // reset the game
      reset();
    }
  }
}

//--------------------------------------------------
// run the game setup
//--------------------------------------------------
setup();

