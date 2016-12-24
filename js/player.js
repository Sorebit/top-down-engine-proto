'use strict';

function Player(ctx, x, y, w, h) {
	this.ctx = ctx;
	this.x = x;
	this.y = y;
	this.width  = w;
	this.height = h;

	this.vel = new Vector(0, 0);

	// Constants are not part of player objects
	// A unit of time is a second - [s]
	// A unit of distance is a pixel - [px]
	// Velocity is measured in pixels per second [px / s]
	// Acceleration / friction is measured in pixels per square second [px / s^2]

	// Min / max velocity
	// Minimum velocity exists to prevent calculation of negligible forces
	var minVel = 5;
	var maxVel = 400;
	// Friction (should be less than acceleration)
	var fri = 1000;
	// Acceleration
	var acc = 8000;

	var self = this;

	// Apply force (Vector(x, y))
	this.addForce = function(v) {
		if(v.length() > 0)
			self.vel.add(v);
	}

	// Render
	this.draw = function() {
		self.ctx.beginPath();
		self.ctx.rect(self.x - self.width / 2, self.y - self.height / 2, self.width, self.height);
		self.ctx.fillStyle = '#e0e0e0';
		self.ctx.fill();
		self.ctx.closePath();
	}

	// Update forces and position (deltaTime in ms)
	this.update = function(dt) {
		// Force to apply (should not be greater when moving diagonally)
		var af = new Vector(0, 0);
		if(self.moving_up && !self.moving_down)
			af.add(new Vector(0, -acc));
		if(self.moving_down && !self.moving_up)
			af.add(new Vector(0, acc));
		if(self.moving_right && !self.moving_left)
			af.add(new Vector(acc, 0));
		if(self.moving_left && !self.moving_right)
			af.add(new Vector(-acc, 0));

		// I'm not sure if I should scale every force
		af = af.scale(acc * dt / 1000);
		self.addForce(af);

		// Deceleration from friction
		var ff = self.vel.scale(fri).multiply(dt / 1000);
		if(self.vel.length() > ff.length())
			self.vel.sub(ff);
		else
			self.vel = self.vel.multiply(0);
		
		// Multiply forces by delta time to run smooth
		var f = self.vel.multiply(dt / 1000);
		self.x += f.x;
		self.y += f.y;

		// Don't calcute negligible forces
		if(self.vel.length() < minVel)
			self.vel = new Vector(0, 0);

		self.vel = self.vel.limit(maxVel);
	}
}