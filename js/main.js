'use strict';

// Window and canvas
var can = document.getElementById('game');
var ctx = can.getContext('2d');

window.onresize = handleWindowResize;

function handleWindowResize() {
	can.width = window.innerWidth;
	can.height = window.innerHeight;
}
handleWindowResize();

var game = new Game(ctx);
game.start();