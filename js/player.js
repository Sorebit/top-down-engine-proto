'use strict';

function Player(ctx, x, y, width, height) {
	this.ctx = ctx;
	this.pos = {
		x: x,
		y, y
	};
	this.width  = width;
	this.height = height;

	this.vel = new Vector(0, 0);

	// Constants are not part of player objects
	// A unit of time is a second - [s]
	// A unit of distance is a pixel - [px]
	// Velocity is measured in pixels per second [px / s]
	// Acceleration / friction is measured in pixels per square second [px / s^2]

	// Min / max velocity
	// Minimum velocity exists to prevent calculation of negligible forces
	var minVel = 2;
	var maxVel = 500;
	// Friction (should be less than acceleration)
	var fri = 3000;
	// Acceleration
	var acc = 8000;

	var self = this;

	// Apply force (Vector(x, y))
	this.addForce = function(v) {
		if(v.length() > 0)
			self.vel.add(v);
	}

	// Render
	this.draw = function(debug_flag) {
		self.ctx.beginPath();
		self.ctx.rect(self.pos.x, self.pos.y, self.width, self.height);
		self.ctx.fillStyle = debug_flag ? 'rgba(255, 100, 100, 0.7)' : 'rgba(255, 255, 255, 0.7)';
		self.ctx.fill();
		self.ctx.closePath();

	}

	// Update forces and position (deltaTime in ms)
	this.update = function(dt, entityList) {
		// Force to apply (should not be greater when moving diagonally)
		var accelerationForce = new Vector(0, 0);
		if(self.moving_up && !self.moving_down)
			accelerationForce.add(new Vector(0, -acc));
		if(self.moving_down && !self.moving_up)
			accelerationForce.add(new Vector(0, acc));
		if(self.moving_right && !self.moving_left)
			accelerationForce.add(new Vector(acc, 0));
		if(self.moving_left && !self.moving_right)
			accelerationForce.add(new Vector(-acc, 0));

		// I'm not sure if I should scale every force
		accelerationForce = accelerationForce.scale(acc * dt / 1000);
		self.addForce(accelerationForce);

		// Deceleration from friction
		var frictionForce = self.vel.scale(fri).multiply(dt / 1000);
		if(self.vel.length() > frictionForce.length())
			self.vel.sub(frictionForce);
		else
			self.vel = self.vel.multiply(0);
		
		// Multiply forces by delta time to run smooth
		var mulVel = self.vel.multiply(dt / 1000);
		var finalVel = mulVel;

		// First colision 
		var firstCol = {
			entryTime: Infinity,
			normalx: 0,
			normaly: 0
		}
		// Broadphase box to not check objects you can't possibly collide at this frame 
		var bfb = broadphaseBox(self, finalVel);

		// Find a collision that occurs first
		for(var i in entityList) {
			if(!AABBCheck(bfb, entityList[i])) {
				continue;
			}
			var ecol = SweptAABB(self, entityList[i], finalVel);
			if(firstCol.entryTime > ecol.entryTime) {
				firstCol = ecol;
				firstCol.id = i;
			}
		}

		// If any collision occured
		if(firstCol.entryTime != Infinity)
			finalVel = finalVel.multiply(firstCol.entryTime);

		// New position and dot product vector for sliding
		var x = self.pos.x + finalVel.x;
		var y = self.pos.y + finalVel.y;
		var remainingtime = 1.0 - firstCol.entryTime;
		var dotprod = (mulVel.x * firstCol.normaly + mulVel.y * firstCol.normalx) * remainingtime;
		var nv = new Vector(dotprod * firstCol.normaly, dotprod * firstCol.normalx);

		// Second collision
		if(firstCol.entryTime != Infinity && (firstCol.normalx || firstCol.normaly)) {
			var temp = new Box(self.ctx, self.pos.x + finalVel.x, self.pos.y + finalVel.y, self.width, self.height);
			
			// Broadphase box to not check objects you can't possibly collide at this frame 
			var bfb = broadphaseBox(temp, nv);

			var secondCol = {
				entryTime: Infinity,
				normaly: 0,
				normalx: 0
			}

			for(var i in entityList) {
				if(i == firstCol.id) {
					continue
				}
				if(!AABBCheck(bfb, entityList[i])) {
					continue;
				}
				var scol = SweptAABB(temp, entityList[i], nv);
				if(scol.entryTime < 1.0 && ((firstCol.normalx && scol.normaly) || (firstCol.normaly && scol.normalx)) ){
					if(scol.entryTime < secondCol.entryTime) {
						secondCol = scol;
						scol.id = i;
					}
				}
			}

			// Calcute final velocity
			if(firstCol.entryTime != Infinity) {
				finalVel = finalVel.multiply(firstCol.entryTime);
			}
			if(secondCol.entryTime != Infinity) {
				nv = nv.multiply(secondCol.entryTime);
			}

			finalVel.add(nv);
		}

		// New position
		var npos = {
			x: self.pos.x + finalVel.x,
			y: self.pos.y + finalVel.y,
		}

		self.pos = npos;

		// Don't calcute negligible forces
		if(self.vel.length() < minVel)
			self.vel = new Vector(0, 0);

		self.vel = self.vel.limit(maxVel);
	}
}