'use strict';

var can = document.getElementById('game');
var ctx = can.getContext('2d');

window.onresize = handleWindowResize;

function handleWindowResize() {
	can.width = window.innerWidth;
	can.height = window.innerHeight;
}

handleWindowResize();

function Game(ctx) {	
	this.ctx = ctx;

	var lastTime = Date.now();
	var deltaTime;

	// var player = new Player(ctx, 100, 100, 40, 40);
	this.player = new Player(ctx, 100, 100, 40, 40); // __debug

	var self = this;

	this.draw = function() {
		this.ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		// player.draw();
		this.player.draw(); // __debug
	}

	this.update = function(dt) {
		// player.update();
		this.player.update(dt); // __debug
	}

	this.tick = function() {
		deltaTime = Date.now() - lastTime;
		lastTime += deltaTime;

		self.update(deltaTime);
		self.draw();

		requestAnimationFrame(self.tick);
	}

	this.start = function() {
		console.log("Game started");
		self.tick();
	}
}

var game = new Game(ctx);
game.start();