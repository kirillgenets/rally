'use strict';

(function () {

	window.util = {
		isArrowUpEvent: isArrowUpEvent,
		isArrowLeftEvent: isArrowLeftEvent,
		isArrowRightEvent: isArrowRightEvent,
    isArrowDownEvent: isArrowDownEvent,
    isEscEvent: isEscEvent
	}

	function isArrowUpEvent(evt, callback) {
    if (evt.key === 'ArrowUp') {
      evt.preventDefault();
      callback(evt);
    }
  }

  function isArrowLeftEvent(evt, callback) {
    if (evt.key === 'ArrowLeft') {
      evt.preventDefault();
      callback(evt);
    }
  }

  function isArrowRightEvent(evt, callback) {
    if (evt.key === 'ArrowRight') {
      evt.preventDefault();
      callback(evt);
    }
  }

  function isArrowDownEvent(evt, callback) {
    if (evt.key === 'ArrowDown') {
      evt.preventDefault();
      callback(evt);
    }
  }

  function isEscEvent(evt, callback) {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      callback(evt);
    }
  }

})();