import { Application, Assets, Container, Sprite, Graphics, Text, UPDATE_PRIORITY } from 'pixi.js';

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
const speed = 0.1
const newGameButton = document.getElementById("new-game");
const startGameButton = document.getElementById("start-game");
const scoreBoard = createScoreBoard();
const bird = createBird();

let acceleration = 0
let timer = 0;
let score = 0;
let gameIsRunning = false;


document.body.appendChild(app.canvas);
app.ticker.stop()

function createGameObject(texture, lable, scaleX, scaleY, shape){
	const sprite = new Sprite(texture);
	const container =  new Container();

	createDebugBounds(sprite, shape);
	sprite.label = lable;
	sprite.scale.set(scaleX, scaleY);
	container.addChild(sprite);

	return container;
}

function updateTube(dt){
	// try{
	this.position.x -= speed*dt.elapsedMS
	if (this.position.x+this.width<0){
		app.ticker.remove(updateTube, this);
		this.destroy({Children: true})
	}
	// }
	// catch(e){
	// 	console.log(e)
	// }
}

function updateBird(dt){
    acceleration += 0.3 * dt.deltaTime
    bird.position.y += acceleration;
    if (bird.position.y > window.innerHeight){
        bird.position.y=0
    } 
}

function createTube(label){
	const tube = createGameObject(tubeTexture, label, 0.5, 0.5, "rect")
	app.ticker.add(checkCollision, tube);

	tube.destroy = args => {
		app.ticker.remove(checkCollision, tube)
		tube.destroy(args)
	}

	return tube;
}


function createGroupTubes(){
	const tubes = new Container();
	app.stage.addChildAt(tubes, 0);
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


	return tubes
}

function createBird(){
	const bird = createGameObject(birdTexture, LABELS.BIRD_SPRITE, 0.27, 0.27, "circle");
	bird.x = app.screen.width / 2 - 200;
	bird.y = 0;
	app.stage.addChild(bird);
	// createDebugBounds(bird, 'circle')

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
		gameOver()
	}
}


function createDebugBounds(obj, shape){
	let graphicsBox;
  	let bounds = obj.getBounds().rectangle;
	console.log(bounds)
	console.log(obj.width)
	if (shape === "rect"){
		graphicsBox = new Graphics().rect(0, 0, 100, 100).stroke({ color: 0xff0000, pixelLine: true });
		
	}
	else if (shape === "circle"){
		graphicsBox = new Graphics().circle(bounds.width/10,  bounds.height/10, 50).stroke({ color: 0x00FF00, pixelLine: true });


	}
	else {
		throw `${shape} - This shape does not exist`
	}
	let pivotPoint = new Graphics().rect(0, 0, 10, 10).stroke({ width: 10, color: 0x0000FF, pixelLine: true });
	graphicsBox.label = LABELS.DEBUG_BOUNDS;
	graphicsBox.scale.set(bounds.width/100, bounds.height/100);
	obj.addChild(graphicsBox, pivotPoint);
}

function createScoreBoard(){
	const text = new Text({
		text: 0,
		style: {
			fontFamily: 'Times New Roman',
			fontSize: 72,
			fill: '#ffffffff',
		},
	});
	text.pivot.set(text.width/2, text.height/2);
	text.position.set(app.canvas.width/2, 50);
	app.stage.addChildAt(text, app.stage.children.length);
	return text;
}
function updateScoreBoard(){
	scoreBoard.text = (1 + Number(scoreBoard.text)).toString();
	scoreBoard.pivot.x = scoreBoard.width/2;
	console.log(scoreBoard.text);
}


function gameOver(){
	gameIsRunning = false;
	newGameButton.style.visibility = "visible";
	app.ticker.stop();
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        acceleration = -10
  }
});

newGameButton.addEventListener('click', () => {
	// startNewGame()
	// newGameButton.style.visibility = "hidden"
	window.location.reload();
})
startGameButton.addEventListener('click', () => {
	app.ticker.start();
	// gameIsRunning = true;
	startGameButton.style.visibility = "hidden";
})
app.ticker.add(
	(dt) => {
		// if (gameIsRunning){
			updateBird(dt)
			timer += dt.elapsedMS;
			if (timer >= 5000){
				timer = 0;
				updateScoreBoard();
				const tube = createGroupTubes();
				// console.log(app.stage.children);
				app.ticker.add(updateTube, tube)	
			}
		// }
	}, 
	undefined,
	UPDATE_PRIORITY.HIGH
);


