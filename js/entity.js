// Rectangular entity
function Box(ctx, x, y, width, height) {
	this.ctx = ctx;

	this.pos = {
		x: x,
		y, y
	};
	this.width  = width;
	this.height = height;

	var self = this;

	// Render
	this.draw = function() {
		self.ctx.beginPath();
		self.ctx.rect(self.pos.x, self.pos.y, self.width, self.height);
		self.ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
		self.ctx.fill();
		self.ctx.closePath();

	}

}