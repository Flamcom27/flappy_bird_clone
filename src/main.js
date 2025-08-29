import { Application, Assets, Container, Sprite, Graphics } from 'pixi.js';

const LABELS = {
	LOWER_TUBE: 0,
	UPPER_TUBE: 1,
	DEBUG_BOUNDS: 2,
	BIRD_SPRITE: 3
}

const app = new Application();
await app.init({background: '#1099bb', height:window.innerHeight});

const tubeTexture = await Assets.load('assets/tube.png');
const birdTexture = await Assets.load('assets/bird.png');
const bird = createBird();
const speed = 0.1

let acceleration = 0
let timer = 0;

document.body.appendChild(app.canvas);


function updateTube(dt){
	this.position.x -= speed*dt.elapsedMS
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
    if (bird.position.y > window.innerHeight){
        bird.position.y =0
    } 
}

function createTube(label){
	const tubeSprite = new Sprite(tubeTexture);
	const tube =  new Container();

	createDebugBounds(tubeSprite);
	tubeSprite.label = label;
	tubeSprite.scale.set(0.5, 0.5);
	tube.addChild(tubeSprite);
	app.ticker.add(checkCollision, tube);

	return tube;
}


function createGroupTubes(){

	const tubes = new Container();
	app.stage.addChild(tubes);
	const lowerTube = createTube(LABELS.LOWER_TUBE);
	const upperTube = createTube(LABELS.UPPER_TUBE);
	const lowerTubeSprite = lowerTube.getChildByLabel(LABELS.LOWER_TUBE);
	lowerTubeSprite.rotation = Math.PI 
	lowerTube.position.y += 1050
	lowerTube.position.x += lowerTube.width
	upperTube.position.y -= 150
	tubes.addChild(upperTube, lowerTube);
	
	
	tubes.position.x += app.canvas.width+100
	tubes.position.y += -60 + randInt(-70, 70)
	app.ticker.add(checkCollision, upperTube);
	app.ticker.add(checkCollision, lowerTube);


	return tubes
}

function createBird(){
	const bird = new Container();
	const birdSprite = new Sprite(birdTexture);

	app.stage.addChild(bird);
	birdSprite.label = LABELS.BIRD_SPRITE;
	bird.addChild(birdSprite);
	birdSprite.scale.set(0.27, 0.27)

	bird.x = app.screen.width / 2 - 200;
	bird.y = 0;
	createDebugBounds(bird)

	return bird
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkCollision(){
	const tubeBounds = this.getBounds();
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


document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        acceleration = -10
  }
});

app.ticker.add((dt) => {

	updateBird(dt)
	
	timer += dt.elapsedMS;
	if (timer >= 5000){
		timer = 0;
		const tube = createGroupTubes();

		app.ticker.add(updateTube, tube)
	}
});


