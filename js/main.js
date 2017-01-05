'use strict';

// Window and canvas
var can = document.getElementById('game');
var ctx = can.getContext('2d');

var debugCan = document.getElementById('debug-canvas'); // __debug
var debugCtx = debugCan.getContext('2d'); // __debug

window.onresize = handleWindowResize;

function handleWindowResize() {
	can.width = window.innerWidth;
	can.height = window.innerHeight;
	debugCan.width = window.innerWidth;
	debugCan.height = window.innerHeight;
}
handleWindowResize();

var game = new Game(ctx);
game.start();
