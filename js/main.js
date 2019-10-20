const GAME_HEIGHT = 1024;
const ROAD_WIDTH = 300;
const ROAD_POSITION_LEFT = 210;
const ROAD_LINE_HEIGHT = 50;
const ROAD_LINES_INTERVAL = 100;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 100;
const START_POSITION = -100;
const ENEMIES_INTERVAl = 80;
const SHOWN_RESULTS_COUNT = 10;
const START_CAR_POSITION_X = 335;
const START_CAR_POSITION_Y = 10;
const MIN_CAR_POSITION_Y = 0;
const MAX_CAR_POSITION_X = ROAD_POSITION_LEFT + ROAD_WIDTH - CAR_WIDTH;
const CAR_CLASSNAME = 'car';
const ENEMY_CLASSNAME = 'enemy';

const gameContainer = document.querySelector('.game');
const scoreElement = document.querySelector('.score');
const pauseModal = gameContainer.querySelector('.pause');
const finishModal = document.querySelector('.finish');
const resultsTable = finishModal.querySelector('.finish-table');
const playAgainButton = finishModal.querySelector('.finish-button');
const gameHelpToStart = gameContainer.querySelector('.help');
const startPage = document.querySelector('.start');
const nameField = startPage.querySelector('.start-input');
const startButton = startPage.querySelector('.start-button');
const lifes = gameContainer.querySelectorAll('.life');

const backgroundAudio = new Audio();
backgroundAudio.src = 'sound/background.mp3';

const clickAudio = new Audio();
clickAudio.src = 'sound/click.mp3';

const clashAudio = new Audio();
clashAudio.src = 'sound/clash.wav';

const finishAudio = new Audio();
finishAudio.src = 'sound/finish.mp3';

const settings = {
	name: 'user',
	speed: 3,
	traffic: 3,
	isStarted: false,
	result: {},
	score: 0,
	lifes: [true, true, true],
	startTime: '',
	pauseTime: '',
};

const density = ENEMIES_INTERVAl * settings.traffic;

let lines = ''; // переменная, которая будет хранить линии дорожной разметки
let road = ''; // переменная, которая будет хранить дорогу
const enemies = []; // переменная, которая будет хранить вражеские машины

let usersResults = JSON.stringify([
	{
		name: 'Влад',
		score: 18
	},
	{
		name: 'Иван',
		score: 5
	},
	{
		name: 'Дима',
		score: 73
	},
	{
		name: 'Игорь',
		score: 2
	},
	{
		name: 'Кирилл',
		score: 19
	},
	{
		name: 'Лёша',
		score: 5
	},
	{
		name: 'Вася',
		score: 7
	},
	{
		name: 'Лёня',
		score: 29
	},
	{
		name: 'Руслан',
		score: 11
	},
	{
		name: 'Аслан',
		score: 13
	},
	{
		name: 'Виктор',
		score: 24
	},
	{
		name: 'Катя',
		score: 16
	},
]);

function UserCar(props) {
	this.directions = {
		up: false,
		down: false,
		left: false,
		right: false
	};
	this._speed = props.speed || 3;
	this._startPosX = props.startPosX || 335;
	this._startPosY = props.startPosY || 10;
	this._x = this._startPosX;
	this._y = this._startPosY;
	this._className = props.className || 'car';
	this._minX = props.minX || 210;
	this._minY = props.minY || 0;
	this._maxX = props.maxX || 460;
	this._maxY = props.maxY || 1024;

	this.draw = function () {
		const carImage = document.createElement('div');
		carImage.classList.add(this._className);
		gameContainer.appendChild(carImage);

		this.element = carImage;
	}

	this.ride = function () {
		if (this.directions.up) this._y += this._speed;	
		if (this.directions.down) this._y -= this._speed;
		if (this.directions.left) this._x -= this._speed;
		if (this.directions.right) this._x += this._speed;
		if (this._x < this._minX) this._x = this._minX;
		if (this._x > this._maxX) this._x = this._maxX;
		if (this._y < this._minY) this._y = this._minY;
		if (this._y > this._maxY) this._y = this._maxY;

		this.element.style.bottom = this._y + 'px';
		this.element.style.left = this._x + 'px';
	}

	this.toStart = function () {
		this._x = this._startPosX;
		this._y = this._startPosY;
		this.element.style.left = this._startPosX + 'px';
		this.element.style.bottom = this._startPosY + 'px';	
	}
}

function ObjectOnRoad(props) {
	this._speed = props.speed || 3;
	this._number = props.numberOfEnemy;
	this._className = props.className || 'enemy';
	this._minX = props.minX || 210;
	this._maxX = props.maxX || 460;
	this._minY = props.minY || 0;
	this._maxY = props.maxY || 1024;
	this._density = props.density || 240;
	this._height = props.height || 100;
	this._container = props.container || document.querySelector('.game');
	this._array = props.array;
	this._startPosY = props.startPosY || -100;

	this._getLeftPosition = function () {
		return Math.floor(Math.random() * (this._maxX - this._minX) + this._minX);
	}

	this.y = this._density * this._number;
	this.x = this._getLeftPosition();

	this.draw = function () {
		const enemyCar = document.createElement('div');

	  enemyCar.classList.add(this._className);
	  enemyCar.y = this._density * this._number;
	  enemyCar.x = this._getLeftPosition()
	  enemyCar.style.left = enemyCar.x + 'px';
	  enemyCar.style.top = enemyCar.y + 'px';

	  if (enemyCar.y < this._maxY - this._height * 2) {
	  	this._container.appendChild(enemyCar);

	  	this.element = enemyCar;
	  	this._array.push(this);
	  }
	}

	this.ride = function () {
		this.y += settings.speed / 2;

		if (this.y >= this._maxY) {
			this.y = this._startPosY;
			this.changeLeft();
		}

		this.element.style.top = this.y + 'px';
	}

	this.changeLeft = function () {
		this.element.style.left = this._getLeftPosition() + 'px';
	}

	this._getAccidentStatus = function (car) {
		const enemyCoords = this.element.getBoundingClientRect();
		const userCoords = car.element.getBoundingClientRect();

		return (userCoords.top <= enemyCoords.bottom &&
	      userCoords.bottom >= enemyCoords.top &&
	      userCoords.left <= enemyCoords.right &&
	      userCoords.right >= enemyCoords.left);
	}

	this.isAccident = function (car, callback) {
		if (this._getAccidentStatus(car) && this.y <= this._maxY - this._height * 2) callback();
	}
}

let game = '';
const car = new UserCar({
	speed: settings.speed,
	startPosX: START_CAR_POSITION_X,
	startPosY: START_CAR_POSITION_Y,
	className: CAR_CLASSNAME,
	minX: ROAD_POSITION_LEFT,
	maxX: MAX_CAR_POSITION_X,
	minY: MIN_CAR_POSITION_Y,
	maxY: GAME_HEIGHT
});

nameField.addEventListener('input', onNameFieldInput);
startButton.addEventListener('click', onStartButtonClick);
playAgainButton.addEventListener('click', onPlayAgainButtonClick);
document.addEventListener('click', onGameContainerClick);

function onGameContainerClick() {
	clickAudio.play();
}

function onPlayAgainButtonClick() {
	settings.name = nameField.value; // записываем имя пользователя в объект данных игры
	finishModal.classList.add('hidden');

	finishAudio.pause();
	finishAudio.currentTime = 0.0;

	initGame();
	car.toStart();
}

function onEscKeyDown(evt) {
	isEscEvent(evt, function () {
		gameContainer.classList.toggle('paused');
		pauseModal.classList.toggle('hidden');

		if (backgroundAudio.paused) backgroundAudio.play();
		else backgroundAudio.pause();

		if (!gameContainer.classList.contains('paused')) playGame();
	});
}

function onGameKeyDown(evt) {
	if (!gameContainer.classList.contains('paused')) {
		switch (evt.key) {
			case 'ArrowUp':
				evt.preventDefault();
				car.directions.up = true;
				startGame();
				break;
			case 'ArrowDown':
				evt.preventDefault();
				car.directions.down = true;
				startGame();
				break;
			case 'ArrowLeft':
				evt.preventDefault();
				car.directions.left = true;
				startGame();
				break;
			case 'ArrowRight':
				evt.preventDefault();
				car.directions.right = true;
				startGame();
				break;
		}
	}	
}

function onGameKeyUp(evt) {
	switch (evt.key) {
		case 'ArrowUp':
			car.directions.up = false;		
			break;
		case 'ArrowDown':
			car.directions.down = false;
			break;
		case 'ArrowLeft':
			car.directions.left = false;
			break;
		case 'ArrowRight':
			car.directions.right = false;
			break;
	}
}

function onNameFieldInput() {
	if (nameField.value !== '') startButton.removeAttribute('disabled');
	else startButton.setAttribute('disabled', true);
}

function onStartButtonClick() {
	settings.name = nameField.value;
	startPage.classList.add('hidden');
	initGame();
	car.draw();
}

function getQuantityElements(heightElement) {
  return GAME_HEIGHT / heightElement + 1;
};

function initGame() {
	gameContainer.classList.remove('hidden');

	resetGame();

	drawRoad();
	drawRoadLines();
	drawEnemies();

	lines = document.querySelectorAll('.line');

	document.addEventListener('keydown', onGameKeyDown);
	document.addEventListener('keyup', onGameKeyUp);
	document.addEventListener('keydown', onEscKeyDown);
}

function startGame() {
	if (!settings.isStarted) {
		gameHelpToStart.classList.add('hidden');
		settings.isStarted = true;

		if (!settings.startTime) settings.startTime = new Date().getTime();

		if (settings.pauseTime) {
			settings.startTime += (new Date().getTime() - settings.pauseTime);
			settings.pauseTime = '';
		}

		requestAnimationFrame(playGame);

		backgroundAudio.play();
	}
}

function playGame() {
	if (settings.isStarted && !gameContainer.classList.contains('paused')) {
		car.ride();

    drawCurrentScore();
    moveRoad();
    moveEnemies();

    if (!settings.lifes.includes(true)) {
    	settings.isStarted = false;
    	overGame();
    }

    requestAnimationFrame(playGame);
  }
}

function resetGame() {
	settings.score = 0;
	scoreElement.textContent = '00:00';

	document.querySelectorAll('.enemy').forEach(function (enemy) {
		gameContainer.removeChild(enemy);
	}); // убираем старые вражеские машины

	document.querySelectorAll('.line').forEach(function (line) {
		gameContainer.removeChild(line);
	}); // убираем старые дорожные полосы

	for (let dir in car.directions) {
		car.directions[dir] = false;
	} // убираем старые активные направления

	settings.lifes = [true, true, true];
	lifes.forEach(function (life) {
		life.classList.remove('life--dead');
	}); // восстанавливаем жизни

	clashAudio.pause();
	clashAudio.currentTime = 0.0;

	clickAudio.pause();
	clickAudio.currentTime = 0.0;
}

function overGame() {
	settings.startTime = '';
	settings.pauseTime = '';

	gameContainer.classList.add('hidden');

	backgroundAudio.pause();
	backgroundAudio.currentTime = 0.0;

	finishAudio.play();

	saveResult();
	showResults();

	document.removeEventListener('keydown', onGameKeyDown);
	document.removeEventListener('keydown', onEscKeyDown);
	document.removeEventListener('keyup', onGameKeyUp);
}

function resetResultsTable() {
	resultsTable.innerHTML = '';

	const row = document.createElement('tr');

	const nameColumn = document.createElement('th');
	nameColumn.textContent = 'Имя:';
	row.appendChild(nameColumn);

	const scoreColumn = document.createElement('th');
	scoreColumn.textContent = 'Очки (сек.):';
	row.appendChild(scoreColumn);

	resultsTable.appendChild(row);
}

function saveResult() {
	settings.result = {
		name: settings.name,
		score: settings.score
	};

	usersResults = JSON.parse(usersResults);

	const lastUserResult = usersResults.filter(function (result) {
		result.name === settings.name
	});

	if (lastUserResult.length > 0) usersResults.splice(usersResults.indexOf(lastUserResult[0]), 1);

	usersResults.push(settings.result);
}

function showResults() {
	resetResultsTable();

	const sortedResults = usersResults.sort(function (a, b) {
		return b.score - a.score
	});

	sortedResults.splice(SHOWN_RESULTS_COUNT, sortedResults.length - SHOWN_RESULTS_COUNT);
	const isUserResultInTop = sortedResults.includes(settings.result);

	if (!isUserResultInTop) sortedResults[sortedResults.length - 1] = settings.result;
	sortedResults.forEach(function (result) {
		const row = document.createElement('tr');

		const nameColumn = document.createElement('td');
		nameColumn.textContent = result.name;
		row.appendChild(nameColumn);

		const scoreColumn = document.createElement('td');
		scoreColumn.textContent = result.score;
		row.appendChild(scoreColumn);

		resultsTable.appendChild(row);
	});

	finishModal.classList.remove('hidden');		

	usersResults = JSON.stringify(usersResults);
}

function moveRoad() {
	lines.forEach(function (line) {
		line.y += settings.speed;
		line.y = line.y > GAME_HEIGHT ? START_POSITION : line.y;

		line.style.top = line.y + 'px';
	});
}

function moveEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].ride();

		enemies[i].isAccident(car, function () {
			car.toStart();

			gameHelpToStart.classList.remove('hidden');

			for (let i = 0; i < settings.lifes.length; i++) {
				if (settings.lifes[i]) {
					settings.lifes[i] = false;
					break;
				}
			}

			settings.lifes.forEach(function (life, i) {
				if (!life) lifes[i].classList.add('life--dead');
			});

			clashAudio.pause();
			clashAudio.currentTime = 0.0; // останавливаем предыдущий звук, на случай, если он не завершился
			clashAudio.play();

			backgroundAudio.pause();
			backgroundAudio.currentTime = 0.0;

			settings.isStarted = false;
			settings.pauseTime = new Date().getTime();
		});
	}
}

function drawCurrentScore() {
	let timeStr = '';

	const currentTime = Math.floor((new Date().getTime() - settings.startTime) / 1000);
	const currentTimeInMin = Math.floor(currentTime / 60);
	const currentTimeInSec = currentTime < 60 ? currentTime : currentTime - (60 * currentTimeInMin);

	settings.score = currentTime;

	timeStr += currentTimeInMin <= 9 ? '0' + currentTimeInMin + ':' : currentTimeInMin + ':';
	timeStr += currentTimeInSec <= 9 ? '0' + currentTimeInSec : currentTimeInSec;

	scoreElement.textContent = timeStr;
}

function drawRoad() {
	road = document.createElement('div');
	road.classList.add('road');
	gameContainer.appendChild(road);
}

function drawRoadLines() {
	for (let i = 0; i < getQuantityElements(ROAD_LINE_HEIGHT); i++) {
		const line = document.createElement('div');

		line.classList.add('line');
		line.y = i * ROAD_LINES_INTERVAL;
		line.style.top = line.y + 'px';

		gameContainer.appendChild(line);
	}
}

function drawEnemies() {
  for (let i = 0; i < getQuantityElements(density); i++) {
  	const enemy = new ObjectOnRoad({
  		speed: settings.speed,
  		numberOfEnemy: i,
  		className: ENEMY_CLASSNAME,
  		minX: ROAD_POSITION_LEFT,
  		maxX: MAX_CAR_POSITION_X,
  		minY: MIN_CAR_POSITION_Y,
  		maxY: GAME_HEIGHT,
  		density: density,
  		height: CAR_HEIGHT,
  		container: gameContainer,
  		array: enemies,
  		startPosY: START_POSITION
  	});

    enemy.draw();
  }
}

function isEscEvent(evt, callback) {
	evt.preventDefault();
	if (evt.key === 'Escape') callback();
}
