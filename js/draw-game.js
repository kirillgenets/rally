'use strict';

(function () {

	var CANVAS_WIDTH = 1024;
	var CANVAS_HEIGHT = 720;
	var ROAD_WIDTH = 350;
	var ROAD_POS_X = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
	var ROAD_IMAGE_SRC = 'img/asphalt.jpg';
	var GRASS_IMAGE_SRC = 'img/grass.jpg';
	var USER_CAR_SRC = 'img/car.png';
	var CAR_WIDTH = 76;
	var CAR_HEIGHT = 152;
	var USER_CAR_SPEED = 3;
	var INTERVAL_STEP = 10;
	var ENEMY_CAR_SRC = 'img/enemy.png';
	var ENEMY_SPEED = 1;
	var ENEMIES_GAP = 100;
	var ENEMIES_POSITIONS = [
		{
			x: ROAD_POS_X,
			y: 0
		},
		{
			x: ROAD_POS_X + ENEMIES_GAP,
			y: 0
		},
		{
			x: ROAD_POS_X + ROAD_WIDTH - CAR_WIDTH,
			y: 0
		},
		{
			x: ROAD_POS_X + ROAD_WIDTH - CAR_WIDTH - ENEMIES_GAP,
			y: 0
		},
	];

	var canvasWrapper = document.querySelector('.game-wrapper');
	var pauseModal = document.querySelector('.pause');
	var startModal = canvasWrapper.querySelector('.start-modal');
	var nameInput = startModal.querySelector('.start-modal-input');
	var startButton = startModal.querySelector('.start-modal-button');
	var canvas = canvasWrapper.querySelector('.game');
	var ctx = canvas.getContext('2d');

	// формируем ландшафт
	var grass = new Image();
	grass.src = GRASS_IMAGE_SRC;

	// формируем дорогу
	var road = new Image();
	road.src = ROAD_IMAGE_SRC;

	// формируем машину пользователя
	var userCar = new Image();
	userCar.src = USER_CAR_SRC;

	// формируем вражескую машину
	var enemyCar = new Image();
	enemyCar.src = ENEMY_CAR_SRC;

	// массив, который содержит координаты текущих врагов

	var enemies = [getRandomEnemyPosition()];

	// объект, который содержит текущую позицию машины пользователя
	var userCarPos = {
		x: (CANVAS_WIDTH - CAR_WIDTH) / 2,
		y: CANVAS_HEIGHT - CAR_HEIGHT
	};

  // переменная, содержащая время игры пользователя (очки)
	var userTime;

	// переменная, в которой находится скорость движения машины
	var currentSpeed = 0;

	// переменная, в которой находится текущее направление движения
	var direction = '';

	startButton.addEventListener('click', onStartButtonClick);
	nameInput.addEventListener('change', onNameInputChange);

	function onNameInputChange() {
		if (nameInput.value !== '') {
			startButton.removeAttribute('disabled');
		} else {
			startButton.setAttribute('disabled');
		}
	}

	function onStartButtonClick() {		
		hideStartModal();

		window.drawGameInterval = setInterval(drawGame, INTERVAL_STEP);
		userTime = new Date().getTime();

		document.addEventListener('keydown', onGameKeyDown);
		document.addEventListener('keyup', onGameKeyUp);
	}

	function onGameKeyDown(evt) {
		window.util.isArrowUpEvent(evt, onGameArrowUpKeyDown);
		window.util.isArrowLeftEvent(evt, onGameArrowLeftKeyDown);
		window.util.isArrowRightEvent(evt, onGameArrowRightKeyDown);
		window.util.isArrowDownEvent(evt, onGameArrowDownKeyDown);
		window.util.isEscEvent(evt, onGameEscKeyDown);
	}

	function onGameKeyUp(evt) {
		window.util.isArrowUpEvent(evt, onGameArrowUpKeyUp);
		window.util.isArrowLeftEvent(evt, onGameArrowLeftKeyUp);
		window.util.isArrowRightEvent(evt, onGameArrowRightKeyUp);
		window.util.isArrowDownEvent(evt, onGameArrowDownKeyUp);
	}

	function onGameEscKeyDown() {
		if (canvas.classList.contains('paused')) {
			clearInterval(window.drawGameInterval);
			window.drawGameInterval = setInterval(drawGame, INTERVAL_STEP);
			canvas.classList.remove('paused');
			pauseModal.classList.add('hidden');
		} else {
			clearInterval(window.drawGameInterval);
			pauseModal.classList.remove('hidden');
			canvas.classList.add('paused');
		}
	}

	function onGameArrowUpKeyDown() {
		currentSpeed = - USER_CAR_SPEED;
	}

	function onGameArrowLeftKeyDown() {
		direction = 'left';
	}

	function onGameArrowRightKeyDown() {
		direction = 'right';
	}

	function onGameArrowDownKeyDown() {
		currentSpeed = USER_CAR_SPEED;
	}

	function onGameArrowUpKeyUp() {
		currentSpeed = 0;
	}

	function onGameArrowLeftKeyUp() {
		direction = '';
	}

	function onGameArrowRightKeyUp() {
		direction = '';
	}

	function onGameArrowDownKeyUp() {
		currentSpeed = 0;
	}

	function hideStartModal() {
		startModal.classList.add('hidden');
		startButton.removeEventListener('click', onStartButtonClick);
	}

	function getRandomEnemyPosition() {
		return ENEMIES_POSITIONS[Math.floor(Math.random() * (ENEMIES_POSITIONS.length - 1))]; 
	}

	function drawGame() {
		ctx.drawImage(grass, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		ctx.drawImage(road, ROAD_POS_X, 0, ROAD_WIDTH, CANVAS_HEIGHT);
		ctx.drawImage(userCar, userCarPos.x, userCarPos.y, CAR_WIDTH, CAR_HEIGHT);

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, 180, 70);

		drawCurrentScore();

		enemies.forEach(function (enemy, i) {
			ctx.drawImage(enemyCar, enemies[i].x, enemies[i].y, CAR_WIDTH, CAR_HEIGHT);
			enemies[i].y += ENEMY_SPEED;

			if (enemies[enemies.length - 1].y == CAR_HEIGHT) {
				enemies.push(getRandomEnemyPosition());
				if (enemies[enemies.length - 1].y > 0 && enemies[enemies.length - 1].y !== enemies[i] && enemies[enemies.length - 1].y !== enemies[i - 1]) {
					enemies[enemies.length - 1].y = 0;
				}
			}

			if (enemies[i].y == CANVAS_HEIGHT) {
				enemies.shift();
			}
		});

		userCarPos.y += currentSpeed;

		if (userCarPos.y < 0) {
			userCarPos.y = 0;
		} else if (userCarPos.y > CANVAS_HEIGHT - CAR_HEIGHT) {
			userCarPos.y = CANVAS_HEIGHT - CAR_HEIGHT;
		}

		if (userCarPos.x < ROAD_POS_X) {
			userCarPos.x = ROAD_POS_X;
		} else if (userCarPos.x > ROAD_POS_X + ROAD_WIDTH - CAR_WIDTH) {
			userCarPos.x = ROAD_POS_X + ROAD_WIDTH - CAR_WIDTH;
		}

		switch (direction) {
			case 'left':
				userCarPos.x -= USER_CAR_SPEED;
				break;
			case 'right':
				userCarPos.x += USER_CAR_SPEED;
				break;
		}

		function drawCurrentScore() {
			var timeStr = '';
			var currentTime = Math.floor((new Date().getTime() - userTime) / 1000);
			var currentTimeInMin = Math.floor(currentTime / 60);
			var currentTimeInSec = currentTime < 60 ? currentTime : currentTime - (60 * currentTimeInMin);

			timeStr += currentTimeInMin <= 9 ? '0' + currentTimeInMin + ':' : currentTimeInMin + ':';
			timeStr += currentTimeInSec <= 9 ? '0' + currentTimeInSec : currentTimeInSec;

			ctx.fillStyle = 'white';
			ctx.font = '50px Tahoma';
			ctx.fillText(timeStr, 30, 50);
		}
	}

})();