function Player(ctx, x, y, w, h) {
	this.ctx = ctx;
	this.x = x;
	this.y = y;
	this.width  = w;
	this.height = h;

	this.vel = new Vector(0, 0);

	this.minVel = 5;
	this.maxVel = 200;

	var self = this;

	this.addForce = function(v) {
		if(v.length() > 0)
			this.vel.add(v);
		this.vel = this.vel.limit(this.maxVel);
	}

	this.draw = function() {
		this.ctx.beginPath();
		this.ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
		this.ctx.fillStyle = '#fff';
		this.ctx.fill();
		this.ctx.closePath();
	}

	this.update = function(dt) {
		// var f = this.vel.scale(this.vel, dt/1000);
		if(this.vel.length() < this.minVel)
			this.vel = new Vector(0, 0);
		var f = this.vel.multiply(dt/1000);
		this.x += f.x;
		this.y += f.y;
	}
}