import { Application, Assets, Container, Sprite, Graphics } from 'pixi.js';

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
const s = 0.2
// Listen for animate update
app.ticker.add((dt) => {

	updateBird(dt)
	
	timer += dt.elapsedMS;
	if (timer >= 2000){
		timer = 0;
		const tube = createTube();

		app.ticker.add(updateTube, tube)
	}
});


function updateTube(dt){
	this.position.x -= s*dt.elapsedMS
	// updateDebugBounds(this.getChildByLabel(LABELS.LOWER_TUBE));
	// updateDebugBounds(this.getChildByLabel(LABELS.UPPER_TUBE));
	if (this.position.x+this.width<0 +100){
		app.ticker.remove(updateTube, this)
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
	const upperTube = new Sprite(tubeTexture);
	const lowerTube = new Sprite(tubeTexture);
	createDebugBounds(upperTube);
	createDebugBounds(lowerTube);
	app.ticker.add(checkCollision, upperTube);
	upperTube.label = LABELS.UPPER_TUBE;
	lowerTube.label = LABELS.LOWER_TUBE;
	const tubeContainer = new Container();
	app.stage.addChild(tubeContainer);
	lowerTube.pivot.set(lowerTube.width, lowerTube.height)
	lowerTube.rotation = Math.PI 
	upperTube.position.y += 0
	lowerTube.position.y += 700
	upperTube.scale.set(0.4, 0.4)
	lowerTube.scale.set(0.4, 0.4)
	tubeContainer.addChild(upperTube, lowerTube);
	tubeContainer.position.x += app.canvas.width+100
	tubeContainer.position.y += -60 + randInt(-60, 60)


	return tubeContainer
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkCollision(){
	// const tubeSprite = this.getChildByLabel("upperTube") 
	const tubePos = this.position;
	const tubeWidth = tubePos.x+ this.width;

	const birdPos = birdSprite.position;
	const birdWidth = birdPos.x + birdSprite.width;
	if ( birdPos.x < tubeWidth && birdPos.x > tubePos.x ) {
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
