//Create a Pixi Application
let app = new PIXI.Application({
  width: 256,
  height: 256,
  antialias: true,
  transparent: false,
  //resolution: 1,
  autoDensity: true,
  backgroundColor: 0x800000,
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.getElementById('playfield').appendChild(app.view)
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

window.addEventListener('mousemove', updatePoints, false);
