function Vector(x, y) {
	this.x = x;
	this.y = y;

	var self = this;

	this.add = function(v) {
		this.x += v.x;
		this.y += v.y;
	}

	this.sub = function(v) {
		this.x -= v.x;
		this.y -= v.y;
	}

	this.multiply = function(d) {
		var r = new Vector(this.x, this.y);
		r.x *= d;
		r.y *= d;
		return r;
	}

	this.length = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	this.scale = function(d) {
		var r = new Vector(this.x, this.y);
		var l = r.length();
		if(l > 0) {
			r = r.multiply(d/l);
		}
		return r;
	}

	this.limit = function(d) {
		var r = new Vector(this.x, this.y);
		var l = r.length();
		if(l > d) {
			r = r.multiply(d/l);
		}
		return r;
	}
}


