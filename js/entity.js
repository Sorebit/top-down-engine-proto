'use strict';

// Rectangular entity
function Box(x, y, width, height, ctx, color) {
	this.ctx = ctx || null;

	this.pos = {
		x: x,
		y: y
	};

	this.width  = width;
	this.height = height;

	this.color = color || 'rgba(180, 180, 180, 0.7)';

	this.colliding = false;
	this.check = false;

	var self = this;

	// Render
	this.draw = function(offset) {
		if(!self.ctx)
			return;
		var x = self.pos.x - offset.x;
		var y = self.pos.y - offset.y;

		// Outside of screen
		if(x < -self.width || y < -self.height || x > self.ctx.canvas.width || y > self.ctx.canvas.height)
			return;

		self.ctx.beginPath();
		self.ctx.rect(x, y, self.width, self.height);
		self.ctx.fillStyle = self.color;
		self.ctx.fill();
		self.ctx.closePath();
	};

}