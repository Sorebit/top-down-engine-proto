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
	this.draw = function(debug_flag) {
		self.ctx.beginPath();
		self.ctx.rect(self.pos.x, self.pos.y, self.width, self.height);
		self.ctx.fillStyle = debug_flag ? 'rgba(240, 240, 240, 0.7)' : 'rgba(180, 180, 180, 0.7)';
		self.ctx.fill();
		self.ctx.closePath();

		// self.ctx.beginPath(); // __debug
		// self.ctx.rect(self.pos.x, self.pos.y, 4, 4); // __debug
		// self.ctx.rect(self.pos.x + self.width - 4, self.pos.y + self.height - 4, 4, 4); // __debug
		// self.ctx.fillStyle = 'rgba(255, 0, 0, 1)'; // __debug
		// self.ctx.fill(); // __debug
		// self.ctx.closePath(); // __debug
	}

}