import { Application, Assets, Container, Sprite, Graphics, Point, loadBasisOnWorker } from 'pixi.js';

const LABELS = {
	LOWER_TUBE: 0,
	UPPER_TUBE: 1,
	DEBUG_BOUNDS: 2,
}

const app = new Application();



let timer = 0;

// Initialize the application
await app.init({background: '#1099bb', height:window.innerHeight});

// Append the application canvas to the document body
document.body.appendChild(app.canvas);

// Create and add a container to the stage
const bird = new Container();

app.stage.addChild(bird);
// app.stage.addChild(graphicsBox);

// Load the bunny texture
const birdTexture = await Assets.load('assets/bird.png');

// Create a 5x5 grid of bunnies in the container
const birdSprite = new Sprite(birdTexture);
birdSprite.label = "birdSprite"
// bunny.x = app.screen.width / 2;
// bunny.y = app.screen.height / 2;
bird.addChild(birdSprite);
birdSprite.scale.set(0.27, 0.27)
// Move the container to the center
bird.x = app.screen.width / 2 - 200;
bird.y = 0;

// Center the bunny sprites in local container coordinates
// bird.pivot.x = bird.width / 2;
// bird.pivot.y = bird.height / 2;

let acceleration = 0
createDebugBounds(bird)
const tubeTexture = await Assets.load('assets/tube.png')

// console.log(tubeContainer.position)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        acceleration = -10
    // Your code to execute when spacebar is pressed
  }
});
const s = 0.05
// Listen for animate update
app.ticker.add((dt) => {

	updateBird(dt)
	
	timer += dt.elapsedMS;
	if (timer >= 13000){
		timer = 0;
		const tube = createTube();

		app.ticker.add(updateTube, tube)
	}
});


function updateTube(dt){
	this.position.x -= s*dt.elapsedMS
	// updateDebugBounds(this.getChildByLabel(LABELS.LOWER_TUBE));
	// updateDebugBounds(this.getChildByLabel(LABELS.UPPER_TUBE));
	if (this.position.x+this.width<0){
		app.ticker.remove(updateTube, this);
		app.ticker.remove(checkCollision, this.getChildByLabel(LABELS.UPPER_TUBE));
		app.ticker.remove(checkCollision, this.getChildByLabel(LABELS.LOWER_TUBE));
		this.destroy({Children: true})
	}
		
	
}

function updateBird(dt){
    acceleration += 0.3 * dt.deltaTime
    bird.position.y += acceleration;
	// updateDebugBounds(bird) 
    if (bird.position.y > window.innerHeight){
        bird.position.y =0
    } 

}

function createTube(){
	const upperTubeSprite = new Sprite(tubeTexture);
	const lowerTubeSprite = new Sprite(tubeTexture);


	createDebugBounds(upperTubeSprite);
	createDebugBounds(lowerTubeSprite);
	
	upperTubeSprite.label = LABELS.UPPER_TUBE;
	lowerTubeSprite.label = LABELS.LOWER_TUBE;

	const tubes = new Container();
	app.stage.addChild(tubes);
	
	lowerTubeSprite.pivot.set(lowerTubeSprite.width, lowerTubeSprite.height);
	lowerTubeSprite.rotation = Math.PI 
	// lowerTubeSprite.anchor.set(1, 1) 
	
	// lowerTub
	// lowerTubeSprite.position.x += lowerTubeSprite.width  /2 
	// upperTubeSprite.position.y += 0
	lowerTubeSprite.position.y += 700
	upperTubeSprite.scale.set(0.4, 0.4)
	lowerTubeSprite.scale.set(0.4, 0.4)
	const lowerTube = new Container();
	const upperTube = new Container();
	lowerTube.addChild(lowerTubeSprite)
	upperTube.addChild(upperTubeSprite)
	tubes.addChild(upperTube, lowerTube);
	// lowerTubeSprite.pivot.set(0,  0)
	
	
	tubes.position.x += app.canvas.width+100
	tubes.position.y += -60 + randInt(-60, 60)
	app.ticker.add(checkCollision, upperTube);
	app.ticker.add(checkCollision, lowerTube);


	return tubes
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkCollision(){
	// const tubeSprite = this.getChildByLabel("upperTube") 

	const tubeBounds = this.getBounds();
	const tubeGlobalPos = this.toGlobal(new Point(0,0))
	// const tubeWidth = tubePos.x+ this.width;
	// console.log(tubeBounds);
	// const birdBounds = bird.getBounds();
	// console.log(tubeBounds)
	// console.log(`tube  min x: ${tubeBounds.minX}`);
	// console.log(`tube x: ${tubeGlobalPos.x}`);
	// console.log(`bird y: ${bird.y}`);
	
	// console.log(birdBounds)
	if ( bird.x < tubeBounds.minX + tubeBounds.width && 
		bird.x + bird.width > tubeBounds.minX && 
		bird.y < tubeBounds.minY + tubeBounds.height &&
		bird.y + bird.height > tubeBounds.minY
	) {
		console.log("Collision!")
	}
}


function createDebugBounds(obj){
  	let bounds = obj.getBounds().rectangle;
	const graphicsBox = new Graphics().rect(0, 0, 100, 100).stroke({ color: 0xff0000, pixelLine: true });
	graphicsBox.label = LABELS.DEBUG_BOUNDS;
	graphicsBox.scale.set(bounds.width/100, bounds.height/100);
	graphicsBox.scale.set(bounds.width/100, bounds.height/100);
	obj.addChild(graphicsBox);
}
