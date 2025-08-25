import { Application, Assets, Container, Sprite, Ticker } from 'pixi.js';

// (async () => {
// Create a new application
const app = new Application();
let timer = 0;
// Initialize the application
await app.init({ background: '#1099bb',height:window.innerHeight});

// Append the application canvas to the document body
document.body.appendChild(app.canvas);

// Create and add a container to the stage
const container = new Container();

app.stage.addChild(container);

// Load the bunny texture
const texture = await Assets.load('assets/bird.png');

// Create a 5x5 grid of bunnies in the container
const bunny = new Sprite(texture);

// bunny.x = app.screen.width / 2;
// bunny.y = app.screen.height / 2;
container.addChild(bunny);
bunny.scale.set(0.2, 0.2)
// Move the container to the center
container.x = app.screen.width / 2 - 200;
container.y = 0;

// Center the bunny sprites in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

let a = 0








// Create a 5x5 grid of bunnies in the container
const tubeTexture = await Assets.load('assets/tube.png')

// console.log(tubeContainer.position)
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        a = -10
    // Your code to execute when spacebar is pressed
  }
});
const s = 1
// Listen for animate update
app.ticker.add((dt) => {
// Continuously rotate the container!
// * use delta to create frame-independent transform *

	updateBird(dt)
  	// updateTube(dt)
	

});

app.ticker.add((dt) => {
	timer += dt.elapsedMS;
	console.log(`timer: ${timer}`)
	if (timer >= 3000){
		timer = 0;
		const tube = createTube();

		let ticker = app.ticker.add(updateTube, tube)
	}
});

function updateTube(dt){
	this.position.x -= s*dt.deltaTime
	if (this.position.x+this.width<0 +100){
		app.ticker.remove(updateTube, this)
	}
		
	
}

function updateBird(dt){
    a += 0.3 * dt.deltaTime
    container.position.y += a;
    if (container.position.y > window.innerHeight){
        container.position.y =0
    } 
}

function createTube(){
	const upperTube = new Sprite(tubeTexture);
	const lowerTube = new Sprite(tubeTexture);
	const tubeContainer = new Container();
	app.stage.addChild(tubeContainer);
	upperTube.pivot.set(upperTube.width /2, upperTube.height /2)
	lowerTube.pivot.set(lowerTube.width /2, lowerTube.height /2)
	lowerTube.rotation = Math.PI 
	upperTube.position.y += 50
	lowerTube.position.y += 700
	upperTube.scale.set(0.4, 0.4)
	lowerTube.scale.set(0.4, 0.4)
	tubeContainer.addChild(upperTube);
	tubeContainer.addChild(lowerTube)
	tubeContainer.position.x += app.canvas.width+100
	tubeContainer.position.y += 50
	// ticker.add(updateTube, tubeContainer)

	return tubeContainer
}
// })();

