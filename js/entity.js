// Rectangular entity
function Box(ctx, x, y, width, height) {
	this.ctx = ctx;

	this.pos = {
		x: x,
		y: y
	};
	this.width  = width;
	this.height = height;

	var self = this;

	// Render
	this.draw = function(offset) {
		var x = self.pos.x - offset.x;
		var y = self.pos.y - offset.y;

		// Outside of screen
		if(x < -self.width || y < -self.height || x > self.ctx.canvas.width || y > self.ctx.canvas.height)
			return;

		self.ctx.beginPath();
		self.ctx.rect(x, y, self.width, self.height);
		self.ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
		self.ctx.fill();
		self.ctx.closePath();
	};

}