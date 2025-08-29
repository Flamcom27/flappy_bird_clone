import { Application, Assets, Container, Sprite, Graphics, BitmapText, UPDATE_PRIORITY } from 'pixi.js';

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


function updateTube(dt){
	try{
		this.position.x -= speed*dt.elapsedMS
		if (this.position.x+this.width<0){
			app.ticker.remove(updateTube, this);
			// app.ticker.remove(checkCollision, this.getChildByLabel(LABELS.UPPER_TUBE));
			// app.ticker.remove(checkCollision, this.getChildByLabel(LABELS.LOWER_TUBE));
			this.destroy({Children: true})
		}
	}
	catch(e){
		console.log(e)
	}
}

function updateBird(dt){
    acceleration += 0.3 * dt.deltaTime
    bird.position.y += acceleration;
    if (bird.position.y > window.innerHeight){
        bird.position.y=0
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

	tube.destroy = ()=>{
		app.ticker.remove(checkCollision, tube)
		tube.destroy({Children: true})
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
		gameOver()
	}
}


function createDebugBounds(obj){
  	let bounds = obj.getBounds().rectangle;
	const graphicsBox = new Graphics().rect(0, 0, 100, 100).stroke({ color: 0xff0000, pixelLine: true });
	graphicsBox.label = LABELS.DEBUG_BOUNDS;
	graphicsBox.scale.set(bounds.width/100, bounds.height/100);
	obj.addChild(graphicsBox);
}

function createScoreBoard(){
	const text = new BitmapText({
		text: 0,
		style: {
			fontFamily: 'impact',
			fontSize: 60,
			fill: '#ffffffff',
		},
	});
	text.pivot.set(text.width/2, text.height/2);
	text.position.set(app.canvas.width/2, 50);
	app.stage.addChildAt(text, app.stage.children.length);
	return text;
}
function updateScoreBoard(){
	scoreBoard.text = 10000 + new Number(scoreBoard.text);
	scoreBoard.pivot.x = scoreBoard.width/2;
}

// function startNewGame(){
// 	app.ticker.start()
// 	app.stage.children.forEach(node => node.destroy({Children: true}))
// 	scoreBoard = createScoreBoard();
// 	bird = createBird();
// 	gameIsRunning = true;
// 	timer = 0;
// 	score = 0;
// 	acceleration = 0;
// }

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


