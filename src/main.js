import { Application, Assets, Container, Sprite, Graphics, Text, UPDATE_PRIORITY } from 'pixi.js';

const LABELS = {
	LOWER_TUBE: 0,
	UPPER_TUBE: 1,
	DEBUG_BOUNDS: 2,
	BIRD_SPRITE: 3
}
let acceleration = 0
let timer = 5000;

const app = new Application();
await app.init({background: '#1099bb', height:window.innerHeight});

const tubeTexture = await Assets.load('assets/tube.png');
const birdTexture = await Assets.load('assets/bird.png');
const speed = 100;
const newGameButton = document.getElementById("new-game");
const startGameButton = document.getElementById("start-game");
const scoreBoard = createScoreBoard();
const bird = createBird();
const tubePairs = [];
const delay = timer;



document.body.appendChild(app.canvas);
app.ticker.stop()

function createGameObject(texture, lable, scaleX, scaleY, shape){
	const sprite = new Sprite(texture);
	const container =  new Container();

	createCollider(sprite, shape);
	sprite.label = lable;
	sprite.scale.set(scaleX, scaleY);
	container.addChild(sprite);

	return container;
}

function updateTube(dt){
	// try{
	this.position.x -= speed*(dt.elapsedMS/1000)
	if (this.position.x+this.width<0){
		app.ticker.remove(updateTube, this);
		this.destroy({Children: true});
		tubePairs.shift();
	}
	// }
	// catch(e){
	// 	console.log(e)
	// }
}

function updateBird(dt){
    acceleration += 15 * (dt.elapsedMS/1000)
    bird.position.y += acceleration;
    if (bird.position.y > window.innerHeight){
        bird.position.y=0
    } 
}

function createTube(label){
	const tube = createGameObject(tubeTexture, label, 0.5, 0.5, "rect")
	// app.ticker.add(checkCollision, tube);

	tube.destroy = args => {
		// app.ticker.remove(checkCollision(), tube)
		tube.destroy(args)
	}

	return tube;
}


function createTubePair(){
	const tubePair = new Container();
	app.stage.addChildAt(tubePair, 0);
	const lowerTube = createTube(LABELS.LOWER_TUBE);
	const upperTube = createTube(LABELS.UPPER_TUBE);
	const lowerTubeSprite = lowerTube.getChildByLabel(LABELS.LOWER_TUBE);
	lowerTubeSprite.rotation = Math.PI 
	lowerTube.position.y += 1050
	lowerTube.position.x += lowerTube.width
	upperTube.position.y -= 150
	upperTube.label = LABELS.UPPER_TUBE;
	lowerTube.label = LABELS.LOWER_TUBE;
	tubePair.addChild(upperTube, lowerTube);
	

	tubePair.position.x += app.canvas.width+100
	tubePair.position.y += -60 + randInt(-70, 70)
	tubePairs.push(tubePair);

	return tubePair
}

function createBird(){
	const bird = createGameObject(birdTexture, LABELS.BIRD_SPRITE, 0.27, 0.27, "circle");
	bird.x = app.screen.width / 2 - 200;
	bird.y = 0;
	app.stage.addChild(bird);

	return bird
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function birdCollidesWithTubeSide(axis, birdBounds, tubeBounds){
	axis = axis.toUpperCase();
	const minPosName = "min"+axis;
	const maxPosName = "max"+axis;
	const birdCenterPos = (birdBounds[minPosName] + birdBounds[maxPosName]) / 2;
	const tubeMinPos = tubeBounds[minPosName];
	const tubeMaxPos = tubeBounds[maxPosName];
	const birdIsBetweenMinAndMax = birdCenterPos < tubeMaxPos && birdCenterPos > tubeMinPos;
	if (birdIsBetweenMinAndMax){
		const opositeAxis = axis === "X" ? "Y": "X";
		const minOpositePosName = "min"+opositeAxis;
		const maxOpositePosName = "max"+opositeAxis;
		const birdOpositeCenterPos = (birdBounds[minOpositePosName] + birdBounds[maxOpositePosName]) / 2;
		const tubeOpositeMinPos = tubeBounds[minOpositePosName];
		const tubeOpositeMaxPos = tubeBounds[maxOpositePosName];
		const minSideDistance = Math.abs(tubeOpositeMinPos - birdOpositeCenterPos);
		const maxSideDistance = Math.abs(tubeOpositeMaxPos - birdOpositeCenterPos); 
		// console.log(minSideDistance, maxSideDistance)
		const closerSideDistance = Math.min(minSideDistance, maxSideDistance);
		const birdRadius = Math.abs(birdBounds[minOpositePosName] - birdOpositeCenterPos);

		return closerSideDistance < birdRadius;
	}
	return false;
}
class Point{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
	get magnitude(){
		return (this.x**2 + this.y**2)**0.5
	}
}
function birdCollidesWithTubeCorner(birdBounds, tubeBounds){
	const birdCenterX = (birdBounds.minX + birdBounds.maxX)/2;
	const birdCenterY = (birdBounds.minY + birdBounds.maxY)/2;
	const birdRadius = Math.abs(birdBounds.maxX - birdCenterX);


	const leftLowerCorner = new Point(
		tubeBounds.minX - birdCenterX, 
		tubeBounds.maxY - birdCenterY
	);
	const rightLowerCorner = new Point(
		tubeBounds.maxX - birdCenterX, 
		tubeBounds.maxY - birdCenterY,
	);
	const leftUpperCorner = new Point(
		tubeBounds.minX - birdCenterX, 
		tubeBounds.minY - birdCenterY
	);
	const rightUpperCorner = new Point(
		tubeBounds.maxX - birdCenterX, 
		tubeBounds.minY - birdCenterY,
	);
	return ( 
		rightLowerCorner.magnitude < birdRadius || 
		leftLowerCorner.magnitude < birdRadius ||
		rightUpperCorner.magnitude < birdRadius ||
		leftUpperCorner.magnitude < birdRadius
	);
}
function startCollisionCheck(){
	// if (!tubePairs.length){
	
	let tubePair;
	let upperTube;
	let lowerTube;
	let birdBounds;
	let checkedTubePair;
	function checkCollision(td){
		const tubeBounds = this.getBounds();
		if ( birdCollidesWithTubeSide("X", birdBounds, tubeBounds) ||
			birdCollidesWithTubeSide("Y", birdBounds, tubeBounds) ||
			birdCollidesWithTubeCorner(birdBounds, tubeBounds) || 
			birdBounds.maxY > window.innerHeight - 25
		) {
			gameOver()
		}
	}

	function updateCurrentTubePair(){
		console.log(!tubePair)
		if( !tubePair || tubePair !== tubePairs[0] ){
			tubePair = tubePairs[0];
			upperTube = tubePair.getChildByLabel(LABELS.UPPER_TUBE);
			lowerTube = tubePair.getChildByLabel(LABELS.LOWER_TUBE);
			app.ticker.add(checkCollision, upperTube, UPDATE_PRIORITY.LOW);
			app.ticker.add(checkCollision, lowerTube, UPDATE_PRIORITY.LOW);
		}
	}
	// app.ticker.add(checkBirdPassesTubes, undefined, UPDATE_PRIORITY.LOW);
	return () => {
		// console.log(!!tubePair && tubePair.getBounds().maxX)
		// console.log(!!tubePair&& tubePair.getBounds().maxX < bird.position.x)
		// console.log(tubePairs)
		updateCurrentTubePair();
		birdBounds = bird
			.getChildByLabel(LABELS.BIRD_SPRITE)
			.getChildByLabel(LABELS.DEBUG_BOUNDS)
			.getBounds();
		if (!!tubePair){
			const tubePairBounds =  tubePair.getBounds();
			if (tubePairBounds.maxX  < birdBounds.minX){
				tubePair = undefined;
				app.ticker.remove(checkCollision, upperTube);
				app.ticker.remove(checkCollision, lowerTube);
			} else if (tubePairBounds.minX < birdBounds.maxX && tubePair !== checkedTubePair){
				checkedTubePair = tubePair;
				updateScoreBoard();
			}
		// } else if (tubePairs.length !== 0){
		// 	updateCurrentTubePair()
		// }
		}
	}
}

function createCollider(obj, shape){
	let graphicsBox;
  	let bounds = obj.getBounds().rectangle;

	if (shape === "rect"){
		graphicsBox = new Graphics().rect(0, 0, 100, 100).stroke({ color: 0xff0000, pixelLine: true });
	}
	else if (shape === "circle"){
		graphicsBox = new Graphics().circle(bounds.width/10,  bounds.height/10, 35).stroke({ color: 0x00FF00, pixelLine: true });
	}
	else {
		throw `${shape} - This shape does not exist`
	}
	// let pivotPoint = new Graphics().rect(0, 0, 10, 10).stroke({ width: 10, color: 0x0000FF, pixelLine: true });
	graphicsBox.label = LABELS.DEBUG_BOUNDS;
	graphicsBox.scale.set(bounds.width/100, bounds.height/100);
	obj.addChild(graphicsBox);
}
// TODO update score when the bird passes through tubes
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
}


function gameOver(){
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
app.ticker.add(startCollisionCheck(), undefined, UPDATE_PRIORITY.LOW);
app.ticker.add(
	(dt) => {
		// if (gameIsRunning){
		updateBird(dt)
		timer += dt.elapsedMS;
		if (timer >= delay){
			timer = 0; 
			// updateScoreBoard();
			const tubePair = createTubePair();
			// console.log(app.stage.children);
			app.ticker.add(updateTube, tubePair)	
		}
		// }
	}, 
	undefined,
	UPDATE_PRIORITY.HIGH
);


