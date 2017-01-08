'use strict';

// Game constants
// A unit of time is a second - [s]
// A unit of distance is a pixel - [px]
// Velocity is measured in pixels per second [px / s]
// Acceleration / friction is measured in pixels per square second [px / s^2]

// Min / max velocity
// Minimum velocity exists to prevent calculation of negligible forces
const MINVEL = 2;
const MAXVEL = 500;
// Friction (should be less than acceleration)
const FRICTION = 3000;
// Acceleration
const ACCEL = 8000;
// Used for shiftng the camera depending on mouse position
const MOUSEREACH = 100;
// "Smoothness" of camera
const CAMERALERP = 0.3;

function Game(ctx) {
	var self = this;

	this.ctx = ctx;

	// Keyboard and mouse
	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);

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

	// Mouse
	document.addEventListener('mousemove', mouseMoveHandler, false);
	document.addEventListener('mousedown', mouseDownHandler, false);
	document.addEventListener('mouseup', mouseUpHandler, false);

	this.mouse = {
		pos: new Vector(null, null),
		curorRadius: 4,
		pressed: false
	};

	this.mouse.draw = function() {
		var x = self.mouse.pos.x;
		var y = self.mouse.pos.y;
		var r = self.mouse.curorRadius;
		if(!isFinite(x) || !isFinite(y) || isNaN(x) || isNaN(y))
			return;
		self.ctx.beginPath();
		self.ctx.arc(x, y, r, 0, 2 * Math.PI);
		self.ctx.fillStyle = (self.mouse.pressed) ? 'rgba(220, 220, 220, 0.9)' : 'rgba(255, 255, 255, 0.9)';
		self.ctx.fill();
		self.ctx.closePath();
	};

	function mouseMoveHandler(e) {
		self.mouse.pos.x = e.clientX;
		self.mouse.pos.y = e.clientY;
	}

	function mouseDownHandler(e) {
		self.mouse.pressed = true;
	}

	function mouseUpHandler(e) {
		self.mouse.pressed = false;
	}

	// Camera
	this.camera = {
		pos: new Vector(0, 0),
		clientPos: new Vector(0, 0)
	};

	this.camera.set = function(x, y) {
		self.camera.pos.x = x;
		self.camera.pos.y = y;
	};

	// How to calcute this within deltaTime?
	this.camera.update = function(dt) {
		// Shift the camera depending on:

		// Player position
		var destPos = new Vector(player.pos.x, player.pos.y);
		// self.camera.pos = destPos;
		self.camera.pos = self.camera.pos.lerp(destPos, CAMERALERP);

		// Mouse position
		var x = Util.map(0, self.ctx.canvas.width, -MOUSEREACH, MOUSEREACH, self.mouse.pos.x);
		var y = Util.map(0, self.ctx.canvas.height, -MOUSEREACH, MOUSEREACH, self.mouse.pos.y);
		self.camera.clientPos = self.camera.pos.add(new Vector(x, y));
	};

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

		var offset = {
 			x: self.camera.clientPos.x - self.ctx.canvas.width / 2 + player.width / 2,
 			y: self.camera.clientPos.y - self.ctx.canvas.height / 2 + player.height / 2,
		}

		for(var i in entities) {

			entities[i].draw(offset);
		}

		player.draw(offset);
		self.mouse.draw();
		// Debug
		debugText(debugCtx, true);
	};

	// Physics update
	this.update = function(dt) {
		player.update(dt, entities);
		self.camera.update(dt);
	};

	// Main loop
	this.tick = function() {
		deltaTime = Date.now() - lastTime;
		lastTime += deltaTime;

		self.update(deltaTime);
		self.draw();

		requestAnimationFrame(self.tick);
	};

	// Begin main loop
	this.start = function() {
		console.log('Game started');
		self.camera.set(player.pos.x, player.pos.y);
		self.tick();
	};

	// Debug
	function debugText(ctx, clear) {
		if(clear)
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.font = '20px Arial';
		ctx.textAlign = 'left';
		ctx.fillStyle = '#fff';
		// Speed
		ctx.fillText('x: ' + Math.round(player.pos.x), 10, 30);
		ctx.fillText('y: ' + Math.round(player.pos.y), 10, 60);
		ctx.fillText('v: ' + Math.abs(Math.round(player.vel.length())), 10, 90);

		ctx.textAlign = 'center';
		debugKey(ctx, player.moving_up,    'W', 130, 45);
		debugKey(ctx, player.moving_down,  'S', 130, 75);
		debugKey(ctx, player.moving_left,  'A', 100, 75);
		debugKey(ctx, player.moving_right, 'D', 160, 75);

		// debugCamera(ctx);

		debugFPS(ctx);
	}

	function debugKey(ctx, flag, text, x, y) {
		ctx.fillStyle = '#777';
		if(flag)
			ctx.fillStyle = '#fff';
		ctx.fillText(text, x, y);
		ctx.fillStyle = '#777';
	}

	function debugCamera(ctx) {
		// Mouse reach (I still think it's twice too big)
		ctx.beginPath();
		ctx.rect(ctx.canvas.width / 2 - MOUSEREACH, ctx.canvas.height / 2  - MOUSEREACH, 2 * MOUSEREACH, 2 * MOUSEREACH);
		ctx.strokeStyle = 'rgba(255, 120, 120, 0.8)';
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 10, 0, 2 * Math.PI);
		ctx.strokeStyle = 'rgba(255, 120, 120, 0.8)';
		ctx.stroke();
		ctx.closePath();
	}

	function debugFPS(ctx) {

	}
}