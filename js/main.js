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
const backgroundAudio = document.querySelector('.audio-bg');
const clickAudio = document.querySelector('.audio-click');
const clashAudio = document.querySelector('.audio-clash');
const finishAudio = document.querySelector('.audio-finish');

// объект, который хранит данные игры
let settings = {
	name: 'user',
	speed: 3,
	traffic: 3,
	isStarted: false,
	directions: {
		up: false,
		down: false,
		left: false,
		right: false
	}
};

// массив, который хранит результаты игр пользователей
let usersResults = [
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
];

// JSON-объект c результатами

let usersResultsJSON = '';

// классы
class Game {
	constructor(username) {
		this.username = username;
		this.play = this.play.bind(this);
		this._lifes = [true, true, true];
		this._currentEnemy = '';
	}

	init() {
		gameContainer.classList.remove('hidden');
		this._drawRoad();
		this._drawRoadLines();
		this._drawEnemies();

		this._lines = document.querySelectorAll('.line');
		this._enemies = document.querySelectorAll('.enemy');

		document.addEventListener('keydown', onGameKeyDown);
		document.addEventListener('keyup', onGameKeyUp);
		document.addEventListener('keydown', onEscKeyDown);
	}

	start() {
		if (!settings.isStarted) {
			gameHelpToStart.classList.add('hidden');
			settings.isStarted = true;
			requestAnimationFrame(this.play);

			backgroundAudio.loop = true;
			backgroundAudio.play();

			this._startTime = new Date().getTime();
		}
	}

	play() {
		if (settings.isStarted && !gameContainer.classList.contains('paused')) {
      this._drawCurrentScore();
      this._moveRoad();
      this._moveEnemies();

      car.ride();

      if (!this._lifes.includes(true)) {
      	settings.isStarted = false;

      	this._over();
      }

      requestAnimationFrame(this.play);
    }
	}

	changeDirection(direction) {
		this._direction = direction;
	}

	_over() {
		gameContainer.classList.add('hidden');

		backgroundAudio.pause();
		backgroundAudio.currentTime = 0.0;

		finishAudio.play();

		this._saveResult();
		this._showResults();

		document.removeEventListener('keydown', onGameKeyDown);
		document.removeEventListener('keyup', onGameKeyUp);
		document.removeEventListener('keydown', onEscKeyDown);
	}

	_saveResult() {
		this._gameResult = {
			name: this.username,
			score: this._score
		};

		if (usersResults.includes(this._gameResult)) {
			usersResults.splice(usersResults.indexOf(this._gameResult), 1);
			usersResults.push(this._gameResult);
		} else {
			usersResults.push(this._gameResult);
		}
	}

	_showResults() {
		let sortedResults = usersResults.sort((a, b) => b.score - a.score);
		sortedResults.splice(SHOWN_RESULTS_COUNT, sortedResults.length - SHOWN_RESULTS_COUNT);
		let isUserResultInTop = sortedResults.includes(this._gameResult);

		if (!isUserResultInTop) sortedResults[sortedResults.length - 1] = this._gameResult;
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

		usersResultsJSON = JSON.stringify(usersResults);
	}

	_moveRoad() {
		this._lines.forEach((line) => {
			line.y += settings.speed;
			if (line.y > GAME_HEIGHT) {
				line.y = START_POSITION;
			}
			line.style.top = line.y + 'px';
		});
	}

	_moveEnemies() {
		this._enemies.forEach((enemy) => {
			enemy.y += settings.speed / 2;
			let isAccident = this._getAccidentStatus(enemy);

			if (isAccident) {
				this._decreaseLife(enemy);
			}

			if (enemy.y >= GAME_HEIGHT) {
				this.currentEnemy = '';
				enemy.y = START_POSITION;
				enemy.style.left = this._getEnemyLeftPosition() + 'px';
			}

			enemy.style.top = enemy.y + 'px';
		});
	}

	_decreaseLife(enemy) {
		if (enemy !== this._currentEnemy) {
			for (let i = 0; i < this._lifes.length; i++) {
				if (this._lifes[i]) {
					this._lifes[i] = false;
					break;
				}
			}

			this._lifes.forEach((life, i) => {
				if (!life) {
					lifes[i].classList.add('life--dead');
				}
			});

			clashAudio.pause();
			clashAudio.currentTime = 0.0; // останавливаем предыдущий звук, на случай, если он не завершился
			clashAudio.play();

			this._currentEnemy = enemy;

			car.toStart();
		}		
	}

	_getAccidentStatus(enemy) {
		const enemyCoords = enemy.getBoundingClientRect();
		const userCoords = car.element.getBoundingClientRect();

		return (userCoords.top <= enemyCoords.bottom &&
        userCoords.bottom >= enemyCoords.top &&
        userCoords.left <= enemyCoords.right &&
        userCoords.right >= enemyCoords.left)
	}

	_drawCurrentScore() {
		let timeStr = '';
		let currentTime = Math.floor((new Date().getTime() - this._startTime) / 1000);
		let currentTimeInMin = Math.floor(currentTime / 60);
		let currentTimeInSec = currentTime < 60 ? currentTime : currentTime - (60 * currentTimeInMin);

		this._score = currentTime;

		timeStr += currentTimeInMin <= 9 ? '0' + currentTimeInMin + ':' : currentTimeInMin + ':';
		timeStr += currentTimeInSec <= 9 ? '0' + currentTimeInSec : currentTimeInSec;

		scoreElement.textContent = timeStr;
	}

	_drawRoad() {
		const road = document.createElement('div');
		road.classList.add('road');
		gameContainer.appendChild(road);
	}

	_drawRoadLines() {
		for (let i = 0; i < getQuantityElements(ROAD_LINE_HEIGHT); i++) {
			const line = document.createElement('div');

			line.classList.add('line');
			line.y = i * ROAD_LINES_INTERVAL;
			line.style.top = line.y + 'px';

			gameContainer.appendChild(line);
		}
	}

	_drawEnemies() {
		const density = ENEMIES_INTERVAl * settings.traffic;

    for (let i = 0; i < getQuantityElements(density); i++) {
      const enemyCar = document.createElement('div');

      enemyCar.classList.add('enemy');
      enemyCar.y = density * i;
      enemyCar.x = this._getEnemyLeftPosition()
      enemyCar.style.left = enemyCar.x + 'px';
      enemyCar.style.top = enemyCar.y + 'px';

      if (enemyCar.y < GAME_HEIGHT - CAR_HEIGHT * 2) gameContainer.appendChild(enemyCar);
    }
	}

	_getEnemyLeftPosition() {
		return Math.floor(Math.random() * ((ROAD_POSITION_LEFT + ROAD_WIDTH - CAR_WIDTH) - ROAD_POSITION_LEFT) + ROAD_POSITION_LEFT);
	}
}

class UserCar {
	constructor() {
		this.speed = settings.speed;
		this.x = START_CAR_POSITION_X;
		this.y = START_CAR_POSITION_Y;
	}

	draw() {
		let carImage = document.createElement('div');
		carImage.classList.add('car');
		gameContainer.appendChild(carImage);

		this.element = carImage;
	}

	ride() {
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

	toStart() {
		this.x = START_CAR_POSITION_X;
		this.y = START_CAR_POSITION_Y;
		this.element.style.left = START_CAR_POSITION_X + 'px';
		this.element.style.bottom = START_CAR_POSITION_Y + 'px';
	}
}

// создание необходимых объектов
let game = '';
const car = new UserCar();

// инициализация обработчиков событий
nameField.addEventListener('input', onNameFieldInput);
startButton.addEventListener('click', onStartButtonClick);
document.addEventListener('click', onGameContainerClick);

// обработчики событий
function onGameContainerClick() {
	clickAudio.play();
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
			game.play();

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
				game.start();
				break;
			case 'ArrowDown':
				evt.preventDefault();
				settings.directions.down = true;
				game.start();
				break;
			case 'ArrowLeft':
				evt.preventDefault();
				settings.directions.left = true;
				game.start();
				break;
			case 'ArrowRight':
				evt.preventDefault();
				settings.directions.right = true;
				game.start();
				break;
		}
	}	
}

function onGameKeyUp(evt) {
	switch (evt.key) {
		case 'ArrowUp':
			settings.directions.up = false;
			game.start();
			break;
		case 'ArrowDown':
			settings.directions.down = false;
			game.start();
			break;
		case 'ArrowLeft':
			settings.directions.left = false;
			game.start();
			break;
		case 'ArrowRight':
			settings.directions.right = false;
			game.start();
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
	game = new Game(settings.name)
	game.init();

	// отрисовка пользовательской машины
	car.draw();
}

// свободные функции
function getQuantityElements(heightElement) {
  return GAME_HEIGHT / heightElement + 1;
};
