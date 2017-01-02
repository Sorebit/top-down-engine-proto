'use strict';

function Game(ctx) {
	var self = this;

	this.ctx = ctx;

	// Keyboard and mouse
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);

	// Keycodes
	const KEY_A = 65;
	const KEY_D = 68;
	const KEY_S = 83;
	const KEY_W = 87;

	function keyDownHandler(e) {
		// Movement
		switch(e.keyCode) {
			case KEY_W: player.moving_up = true; break;
			case KEY_D: player.moving_right = true; break;
			case KEY_S: player.moving_down = true; break;
			case KEY_A: player.moving_left = true; break;
		}
	}

	function keyUpHandler(e) {
		// Movement
		switch(e.keyCode) {
			case KEY_W: player.moving_up = false; break;
			case KEY_D: player.moving_right = false; break;
			case KEY_S: player.moving_down = false; break;
			case KEY_A: player.moving_left = false; break;
		}
	}

	// Time and framerate
	var lastTime = Date.now();
	var deltaTime;

	var player = new Player(ctx, 120, 120, 40, 40);
	var entities = [];
	entities.push(new Box(ctx, 300, 200, 60, 60));
	entities.push(new Box(ctx, 270, 270, 120, 120));
	entities.push(new Box(ctx, 210, 180, 80, 80));
	entities.push(new Box(ctx, 210, 90, 80, 80));
	entities.push(new Box(ctx, 480, 150, 2, 200));
	entities.push(new Box(ctx, 480, 150, 200, 2));

	// Render
	this.draw = function() {
		self.ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		for(var i in entities) {
			entities[i].draw();
		}

		player.draw();
		// Debug
		debugText();
	}

	// Physics update
	this.update = function(dt) {
		player.update(dt, entities);
	}

	// Main loop
	this.tick = function() {
		deltaTime = Date.now() - lastTime;
		lastTime += deltaTime;

		self.update(deltaTime);
		self.draw();

		requestAnimationFrame(self.tick);
	}

	// Begin main loop
	this.start = function() {
		console.log("Game started");
		self.tick();
	}

	// Debug
	function debugText() {
		self.ctx.font = "20px Arial";
		self.ctx.textAlign = 'left';
		self.ctx.fillStyle = '#fff';
		// Speed
		self.ctx.fillText('x: ' + Math.round(player.pos.x), 10, 30);
		self.ctx.fillText('y: ' + Math.round(player.pos.y), 10, 60);
		self.ctx.fillText('v: ' + Math.abs(Math.round(player.vel.length())), 10, 90);

		self.ctx.textAlign = 'center';
		debugKey(player.moving_up,    'W', 130, 45);
		debugKey(player.moving_down,  'S', 130, 75);
		debugKey(player.moving_left,  'A', 100, 75);
		debugKey(player.moving_right, 'D', 160, 75);
	}

	function debugKey(flag, text, x, y) {
		self.ctx.fillStyle = '#777';
		if(flag)
			self.ctx.fillStyle = '#fff';
		self.ctx.fillText(text, x, y);
		self.ctx.fillStyle = '#777';
	}
}