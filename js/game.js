'use strict';

// Game constants
// A unit of time is a second - [s]
// A unit of distance is a pixel - [px]
// Velocity is measured in pixels per second [px / s]
// Acceleration / friction is measured in pixels per square second [px / s^2]

// Min / max velocity
// Minimum velocity exists to prevent calculation of negligible forces
const MIN_VEL = 2;
const MAX_VEL = 500;
// Friction (should be less than acceleration)
// const FRICTION = 300; // ice-type floor
// const FRICTION_COLLIDING = 800; // ice-type floor
const FRICTION = 3000;
const FRICTION_COLLIDING = 6000;
// Acceleration
const ACCEL = 8000;
// Used for shiftng the camera depending on mouse position
const MOUSE_REACH = 150;
// "Smoothness" of camera
const CAMERA_LERP = 0.7;
// Player dimensions
const PLAYER_WIDTH = 39.5;
const PLAYER_HEIGHT = 39.5;
// Quadtree constants
const MAX_OBJECTS = 4;
const MAX_LEVELS = 10;
// Map size
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 1000;

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
		self.camera.pos = self.camera.pos.lerp(destPos, CAMERA_LERP);

		// Mouse position
		var x = Util.map(self.mouse.pos.x, 0, self.ctx.canvas.width, -MOUSE_REACH, MOUSE_REACH);
		var y = Util.map(self.mouse.pos.y, 0, self.ctx.canvas.height, -MOUSE_REACH, MOUSE_REACH);
		self.camera.clientPos = self.camera.pos.add(new Vector(x, y));
	};

	// Time and framerate
	var lastTime = Date.now();
	var deltaTime;
	var fps, frameCount = 0, frameTimer = 0;

	// Reason for 39.5 in ../NOTES.md
	var player = new Player((MAP_WIDTH - PLAYER_WIDTH) / 2, (MAP_HEIGHT - PLAYER_HEIGHT) / 2, PLAYER_WIDTH, PLAYER_HEIGHT, ctx);

	var quadTree = new Quadtree(new Box(0, 0, MAP_WIDTH, MAP_HEIGHT));

	function addEntity(e) {
		entities.push(e);
		quadTree.insert(e);
	}

	var entities = [];
	// Test entities
	for(var y = 0; y < 10; y++) {
		for(var x = 0; x < 10; x++) {
			if(x === 0 || y === 0 || x === 9 || y === 9) {
				addEntity(new Box(x * 100, y * 100, 90, 90, ctx));
			}
		}
	}

	// Test map
	var b = [
		{x: 130, y: 130}, {x: 800, y: 130}, {x: 130, y: 800}, {x: 800, y: 800},
		{x: 130, y: 530}, {x: 800, y: 530}, {x: 130, y: 400}, {x: 800, y: 400},
		{x: 200, y: 400}, {x: 730, y: 400}, {x: 200, y: 530}, {x: 730, y: 530}
	];
	for(var i in b) {
		addEntity(new Box(b[i].x, b[i].y, 60, 60, ctx));
	}
		
	for(var x = 1; x < 7; x++) {
		addEntity(new Box(100 + x * 100, 130, 90, 60, ctx));
		addEntity(new Box(100 + x * 100, 800, 90, 60, ctx));
		if(x !== 3 && x !== 4) {	
			addEntity(new Box(130, 100 + x * 100, 60, 90, ctx));
			addEntity(new Box(800, 100 + x * 100, 60, 90, ctx));
		}
	}

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
		for(var i in entities) {
			entities[i].check = false;
		}
		// var toCheck = quadTree.retrieve(broadphaseBox(player, player.vel.multiply(1.1)));
		var toCheck = quadTree.retrieve(broadphaseBox(player, player.vel));
		for(var i in toCheck) {
			toCheck[i].check = true;
		}

		player.update(dt, toCheck);
		self.camera.update(dt);
	};

	// Main loop
	this.tick = function() {
		var now = Date.now();
		deltaTime = now - lastTime;
		lastTime += deltaTime;

		frameCount++;
		frameTimer += deltaTime;
		if(frameTimer > 500) {
			fps = Math.floor(frameCount / frameTimer * 1000);
			frameTimer = 0;
			frameCount = 0;
		}

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

		ctx.beginPath();
		ctx.rect(0, 0, 200, ctx.canvas.height);
		ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
		ctx.fill();
		ctx.closePath();

		ctx.font = '20px Arial';
		ctx.textAlign = 'left';
		ctx.fillStyle = '#fff';
		// Framerate
		ctx.fillText('f: ' + (fps || 0), 10, 30);
		// Position
		ctx.fillText('x: ' + Math.round(player.pos.x), 10, 60);
		ctx.fillText('y: ' + Math.round(player.pos.y), 10, 90);
		// Speed
		ctx.fillText('v: ' + Math.abs(Math.round(player.vel.length())), 10, 120);

		ctx.textAlign = 'center';
		debugKey(ctx, player.moving_up,    'W', 130, 45);
		debugKey(ctx, player.moving_down,  'S', 130, 75);
		debugKey(ctx, player.moving_left,  'A', 100, 75);
		debugKey(ctx, player.moving_right, 'D', 160, 75);

		// debugCamera(ctx);
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
		ctx.rect(ctx.canvas.width / 2 - MOUSE_REACH, ctx.canvas.height / 2  - MOUSE_REACH, 2 * MOUSE_REACH, 2 * MOUSE_REACH);
		ctx.strokeStyle = 'rgba(255, 120, 120, 0.8)';
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 10, 0, 2 * Math.PI);
		ctx.strokeStyle = 'rgba(255, 120, 120, 0.8)';
		ctx.stroke();
		ctx.closePath();
	}

	function debugTree(node, off) {
		self.ctx.strokeStyle = 'rgba(127, 127, 127, 1.0)';
		self.ctx.strokeRect(node.bounds.pos.x - off.x, node.bounds.pos.y - off.y, node.bounds.width, node.bounds.height);

		if(node.nodes.length > 0) {
			for(var i in node.nodes)
				debugTree(node.nodes[i], off);
		}
	}

}