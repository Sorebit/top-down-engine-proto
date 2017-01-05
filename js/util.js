'use strict';

/* Vectors */

function Vector(x, y) {
	this.x = x;
	this.y = y;

	// Add vector v
	this.add = function(v) {
		this.x += v.x;
		this.y += v.y;
	}

	// Subtract vector v
	this.sub = function(v) {
		this.x -= v.x;
		this.y -= v.y;
	}

	// Muliplies the vector by d
	this.multiply = function(d) {
		var r = new Vector(this.x, this.y);
		r.x *= d;
		r.y *= d;
		return r;
	}

	// Returns length of vector
	this.length = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	// Scales a vector to length d
	this.scale = function(d) {
		var r = new Vector(this.x, this.y);
		var l = r.length();
		if(l > 0) {
			return r.multiply(d/l);
		}
		return r;
	}

	// Limits vector's length to d
	this.limit = function(d) {
		var r = new Vector(this.x, this.y);
		var l = r.length();
		if(l > d) {
			return r.multiply(d/l);
		}
		return r;
	}

	// Returns a copy of this
	this.copy = function() {
		return new Vector(this.x, this.y);
	}
}


/* Collision */

// Static rectangle collision check
// Returns true when boxes overlap
function AABBCheck(a, b) {
	return !(a.pos.x + a.width <= b.pos.x || a.pos.x >= b.pos.x + b.width || a.pos.y + a.height <= b.pos.y || a.pos.y >= b.pos.y + b.height);
}

// Static rectangle collision
// Returns closest position where the collision happens
function AABB(b1, b2) {
	var moveX = 0.0;
	var moveY = 0.0;

	var l = b2.pos.x - ( b1.pos.x + b1.width );
	var r = ( b2.pos.x + b2.width ) - b1.pos.x;
	var t = b2.pos.y - ( b1.pos.y + b1.height );
	var b = ( b2.pos.y + b2.height ) - b1.pos.y;

	// check that there was a collision
	if (l > 0 || r < 0 || t > 0 || b < 0) {	
		return {
			collision: false
		};
	}

	// find the offset of both sides
	moveX = Math.abs(l) < r ? l : r;
	moveY = Math.abs(t) < b ? t : b;

	// only use whichever offset is the smallest
	if (Math.abs(moveX) < Math.abs(moveY))
		moveY = 0.0;
	else
		moveX = 0.0;

	return {
		collision: true,
		x: moveX,
		y: moveY
	};

}

// Broadphase box
// Returns a box spanning box b from starting position
// to position after moving it by velocity vel
function broadphaseBox(b, vel)
{
	var box = new Box(0.0, 0.0, 0.0, 0.0);

	box.pos.x = vel.x > 0 ? b.pos.x : b.pos.x + vel.x;
	box.pos.y = vel.y > 0 ? b.pos.y : b.pos.y + vel.y;
	box.width = vel.x > 0 ? vel.x + b.width : b.width - vel.x;
	box.height = vel.y > 0 ? vel.y + b.height : b.height - vel.y;

	return box;
}

// Collision detection on moving box b1 and static box b2
// returns time [0, 1] (0 is beginning of motion, 1 is destination)
// returns the time that the collision occured (where 0 is the start of the movement and 1 is the destination)
// normalx and normaly return the normal of the collided surface (this can be used to do a response)

function SweptAABB(b1, b2, vel, debctx)
{
	var xInvEntry, yInvEntry;
	var xInvExit, yInvExit;

	// find the distance between the objects on the near and far sides for both x and y
	if(vel.x >= 0.0) {
		xInvEntry = b2.pos.x - (b1.pos.x + b1.width);
		xInvExit = (b2.pos.x + b2.width) - b1.pos.x;
	} else {
		xInvEntry = (b2.pos.x + b2.width) - b1.pos.x;
		xInvExit = b2.pos.x - (b1.pos.x + b1.width);
	}

	if(vel.y >= 0.0) {
		yInvEntry = b2.pos.y - (b1.pos.y + b1.height);
		yInvExit = (b2.pos.y + b2.height) - b1.pos.y;
	} else {
		yInvEntry = (b2.pos.y + b2.height) - b1.pos.y;
		yInvExit = b2.pos.y - (b1.pos.y + b1.height);
	}
	
	// find time of collision and time of leaving for each axis (if statement is to prevent divide by zero)
	var xEntry, yEntry;
	var xExit, yExit;

	if (vel.x == 0.0) {
		xEntry = -Infinity;
		xExit = Infinity;
	} else {
		xEntry = xInvEntry / vel.x;
		xExit = xInvExit / vel.x;
	}

	if (vel.y == 0.0) {
		yEntry = -Infinity;
		yExit = Infinity;
	} else {
		yEntry = yInvEntry / vel.y;
		yExit = yInvExit / vel.y;
	}
	
	// Find the earliest/latest times of collision
	var entryTime = Math.max(xEntry, yEntry);
	var exitTime = Math.min(xExit, yExit);
	
	// If there was no collision
	var normalx, normaly;
	if (entryTime > exitTime || xEntry < 0.0 && yEntry < 0.0 || xEntry > 1.0 || yEntry > 1.0) {
		normalx = 0.0;
		normaly = 0.0;
		return {
			entryTime: 1.0
		}
	} else {
		// If there was a collision 
		// Calculate normal of collided surface
		if (xEntry > yEntry) {
			if (xInvEntry < 0.0) {
				normalx = 1.0;
				normaly = 0.0;
			} else {
				normalx = -1.0;
				normaly = 0.0;
			}
		}
		else {
			if (yInvEntry < 0.0) {
				normalx = 0.0;
				normaly = 1.0;
			} else {
				normalx = 0.0;
				normaly = -1.0;
			}
		}

		// return the time of collision and normal
		return {
			entryTime: entryTime,
			normalx: normalx,
			normaly: normaly
		}
	}
}