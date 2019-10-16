// константы
const GAME_HEIGHT = 1024;
const START_CAR_POSITION_X = 335;
const START_CAR_POSITION_Y = 10;
const ROAD_WIDTH = 300;
const ROAD_POSITION_LEFT = 210;
const ROAD_LINE_HEIGHT = 50;
const ROAD_LINES_INTERVAL = 100;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 100;
const START_POSITION = -100;
const ENEMIES_INTERVAl = 80;
const SHOWN_RESULTS_COUNT = 10;

// переменные, содержащие необходимые DOM-элементы
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

// переменные с DOM-элементами звуков
const backgroundAudio = new Audio();
backgroundAudio.src = 'sound/background.mp3';

const clickAudio = new Audio();
clickAudio.src = 'sound/click.mp3';

const clashAudio = new Audio();
clashAudio.src = 'sound/clash.wav';

const finishAudio = new Audio();
finishAudio.src = 'sound/finish.mp3';

// объект, который хранит данные игры
let settings = {
	name: 'user',
	speed: 3,
	traffic: 3,
	isStarted: false,
	result: {},
	score: 0,
	lifes: [true, true, true],
	startTime: '',
	directions: {
		up: false,
		down: false,
		left: false,
		right: false
	}
};

let lines = ''; // переменная, которая будет хранить линии дорожной разметки
let enemies = ''; // переменная, которая будет хранить вражеские машины

// массив, который хранит результаты игр пользователей
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

// классы

// класс пользовательской машины
function UserCar() {
	this.speed = settings.speed;
	this.x = START_CAR_POSITION_X;
	this.y = START_CAR_POSITION_Y;
}

UserCar.prototype.draw = function() {
	let carImage = document.createElement('div');
	carImage.classList.add('car');
	gameContainer.appendChild(carImage);

	this.element = carImage;
}

UserCar.prototype.ride = function() {
	if (settings.directions.up) {
		this.y += settings.speed;
	}
	
	if (settings.directions.down) {
		this.y -= settings.speed;
	}

	if (settings.directions.left) {
		this.x -= settings.speed;
	}

	if (settings.directions.right) {
		this.x += settings.speed;
	}

	if (this.x < ROAD_POSITION_LEFT) this.x = ROAD_POSITION_LEFT;
	if (this.x > ROAD_POSITION_LEFT + ROAD_WIDTH - CAR_WIDTH) this.x = ROAD_POSITION_LEFT + ROAD_WIDTH - CAR_WIDTH;
	if (this.y < 0) this.y = 0;
	if (this.y > GAME_HEIGHT - CAR_HEIGHT) this.y = GAME_HEIGHT - CAR_HEIGHT;

	this.element.style.bottom = this.y + 'px';
	this.element.style.left = this.x + 'px';
}

UserCar.prototype.toStart = function() {
	this.x = START_CAR_POSITION_X;
	this.y = START_CAR_POSITION_Y;
	this.element.style.left = START_CAR_POSITION_X + 'px';
	this.element.style.bottom = START_CAR_POSITION_Y + 'px';	
}
// конец класса пользовательской машины

// создание необходимых объектов
let game = '';
const car = new UserCar();

// инициализация обработчиков событий
nameField.addEventListener('input', onNameFieldInput);
startButton.addEventListener('click', onStartButtonClick);
playAgainButton.addEventListener('click', onPlayAgainButtonClick);
document.addEventListener('click', onGameContainerClick);

// обработчики событий
function onGameContainerClick() {
	clickAudio.play();
}

function onPlayAgainButtonClick() {
	settings.name = nameField.value; // записываем имя пользователя в объект данных игры
	finishModal.classList.add('hidden');

	finishAudio.pause();
	finishAudio.currentTime = 0.0;

	// отрисовка игры
	initGame();

	// отрисовка пользовательской машины
	car.toStart();
}

function onEscKeyDown(evt) {
	if (evt.key === 'Escape') {
		if (!gameContainer.classList.contains('paused')) {
			gameContainer.classList.add('paused');
			pauseModal.classList.remove('hidden');

			backgroundAudio.pause();
		} else {
			gameContainer.classList.remove('paused');
			pauseModal.classList.add('hidden');
			playGame();

			backgroundAudio.play();
		}		
	}	
}

function onGameKeyDown(evt) {
	if (!gameContainer.classList.contains('paused')) {
		switch (evt.key) {
			case 'ArrowUp':
				evt.preventDefault();
				settings.directions.up = true;
				startGame();
				break;
			case 'ArrowDown':
				evt.preventDefault();
				settings.directions.down = true;
				startGame();
				break;
			case 'ArrowLeft':
				evt.preventDefault();
				settings.directions.left = true;
				startGame();
				break;
			case 'ArrowRight':
				evt.preventDefault();
				settings.directions.right = true;
				startGame();
				break;
		}
	}	
}

function onGameKeyUp(evt) {
	switch (evt.key) {
		case 'ArrowUp':
			settings.directions.up = false;
			startGame();
			break;
		case 'ArrowDown':
			settings.directions.down = false;
			startGame();
			break;
		case 'ArrowLeft':
			settings.directions.left = false;
			startGame();
			break;
		case 'ArrowRight':
			settings.directions.right = false;
			startGame();
			break;
	}
}

function onNameFieldInput() {
	if (nameField.value !== '') {
		startButton.removeAttribute('disabled');
	} else {
		startButton.setAttribute('disabled', true);
	}
}

function onStartButtonClick() {
	settings.name = nameField.value; // записываем имя пользователя в объект данных игры
	startPage.classList.add('hidden');

	// отрисовка игры
	initGame();

	// отрисовка пользовательской машины
	car.draw();
}

// функции для работы игры
function getQuantityElements(heightElement) {
  return GAME_HEIGHT / heightElement + 1;
};

let initGame = function() {
	gameContainer.classList.remove('hidden');

	resetGame();

	drawRoad();
	drawRoadLines();
	drawEnemies();

	lines = document.querySelectorAll('.line');
	enemies = document.querySelectorAll('.enemy');

	document.addEventListener('keydown', onGameKeyDown);
	document.addEventListener('keyup', onGameKeyUp);
	document.addEventListener('keydown', onEscKeyDown);
}

let startGame = function() {
	if (!settings.isStarted) {
		gameHelpToStart.classList.add('hidden');
		settings.isStarted = true;
		requestAnimationFrame(playGame);

		backgroundAudio.play();

		settings.startTime = new Date().getTime();
	}
}

let playGame = function() {
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

let resetGame = function() {
	settings.score = 0;
	scoreElement.textContent = '00:00';

	document.querySelectorAll('.enemy').forEach((enemy) => {
		gameContainer.removeChild(enemy);
	}); // убираем старые вражеские машины

	document.querySelectorAll('.line').forEach((line) => {
		gameContainer.removeChild(line);
	}); // убираем старые дорожные полосы

	for (let dir in settings.directions) {
		settings.directions[dir] = false;
	} // убираем старые активные направления

	settings.lifes = [true, true, true];
	lifes.forEach((life) => {
		life.classList.remove('life--dead');
	}); // восстанавливаем жизни

	clashAudio.pause();
	clashAudio.currentTime = 0.0;

	clickAudio.pause();
	clickAudio.currentTime = 0.0;
}

let overGame = function() {
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

let resetResultsTable = function() {
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

let saveResult = function() {
	settings.result = {
		name: settings.name,
		score: settings.score
	};

	usersResults = JSON.parse(usersResults);

	let lastUserResult = usersResults.filter((result) => result.name === settings.name);

	if (lastUserResult.length > 0) {
		usersResults.splice(usersResults.indexOf(lastUserResult[0]), 1);
	}

	usersResults.push(settings.result);
}

let showResults = function() {
	resetResultsTable();

	let sortedResults = usersResults.sort((a, b) => b.score - a.score);
	sortedResults.splice(SHOWN_RESULTS_COUNT, sortedResults.length - SHOWN_RESULTS_COUNT);
	let isUserResultInTop = sortedResults.includes(settings.result);

	if (!isUserResultInTop) sortedResults[sortedResults.length - 1] = settings.result;
	sortedResults.forEach((result) => {
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

let moveRoad = function() {
	lines.forEach((line) => {
		line.y += settings.speed;
		if (line.y > GAME_HEIGHT) {
			line.y = START_POSITION;
		}
		line.style.top = line.y + 'px';
	});
}

let moveEnemies = function() {
	enemies.forEach((enemy) => {
		enemy.y += settings.speed / 2;

		if (enemy.y >= GAME_HEIGHT) {
			enemy.y = START_POSITION;
			enemy.style.left = getEnemyLeftPosition() + 'px';
		}

		enemy.style.top = enemy.y + 'px';

		let isAccident = getAccidentStatus(enemy);

		if (isAccident) {
			if (enemy.y <= GAME_HEIGHT - CAR_HEIGHT) {
				car.toStart();

				for (let i = 0; i < settings.lifes.length; i++) {
					if (settings.lifes[i]) {
						settings.lifes[i] = false;
						break;
					}
				}

				settings.lifes.forEach((life, i) => {
					if (!life) {
						lifes[i].classList.add('life--dead');
					}
				});

				clashAudio.pause();
				clashAudio.currentTime = 0.0; // останавливаем предыдущий звук, на случай, если он не завершился
				clashAudio.play();
			}
		}
	});
}

let getAccidentStatus = function(enemy) {
	const enemyCoords = enemy.getBoundingClientRect();
	const userCoords = car.element.getBoundingClientRect();

	return (userCoords.top <= enemyCoords.bottom &&
      userCoords.bottom >= enemyCoords.top &&
      userCoords.left <= enemyCoords.right &&
      userCoords.right >= enemyCoords.left);
}

let drawCurrentScore = function() {
	let timeStr = '';
	let currentTime = Math.floor((new Date().getTime() - settings.startTime) / 1000);
	let currentTimeInMin = Math.floor(currentTime / 60);
	let currentTimeInSec = currentTime < 60 ? currentTime : currentTime - (60 * currentTimeInMin);

	settings.score = currentTime;

	timeStr += currentTimeInMin <= 9 ? '0' + currentTimeInMin + ':' : currentTimeInMin + ':';
	timeStr += currentTimeInSec <= 9 ? '0' + currentTimeInSec : currentTimeInSec;

	scoreElement.textContent = timeStr;
}

let drawRoad = function() {
	const road = document.createElement('div');
	road.classList.add('road');
	gameContainer.appendChild(road);
}

let drawRoadLines = function() {
	for (let i = 0; i < getQuantityElements(ROAD_LINE_HEIGHT); i++) {
		const line = document.createElement('div');

		line.classList.add('line');
		line.y = i * ROAD_LINES_INTERVAL;
		line.style.top = line.y + 'px';

		gameContainer.appendChild(line);
	}
}

let drawEnemies = function() {
	const density = ENEMIES_INTERVAl * settings.traffic;

  for (let i = 0; i < getQuantityElements(density); i++) {
    const enemyCar = document.createElement('div');

    enemyCar.classList.add('enemy');
    enemyCar.y = density * i;
    enemyCar.x = getEnemyLeftPosition()
    enemyCar.style.left = enemyCar.x + 'px';
    enemyCar.style.top = enemyCar.y + 'px';

    if (enemyCar.y < GAME_HEIGHT - CAR_HEIGHT * 2) gameContainer.appendChild(enemyCar);
  }
}

let getEnemyLeftPosition = function() {
	return Math.floor(Math.random() * ((ROAD_POSITION_LEFT + ROAD_WIDTH - CAR_WIDTH) - ROAD_POSITION_LEFT) + ROAD_POSITION_LEFT);
}
