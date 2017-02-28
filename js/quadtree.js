// Javascript rework of https://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374

// I don't like how I use an additional rectangle here

'use strict';

function Quadtree(bounds, maxObjects, maxLevels, level) {

	const MAX_OBJECTS = 4;
	const MAX_LEVELS = 10;

	// Utility rectangle class
	function Rectangle(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	var self = this;

	self.bounds = bounds;
	self.maxObjects = maxObjects || MAX_OBJECTS;
	self.maxLevels = maxLevels || MAX_LEVELS; 
	self.level = level || 0;
	self.objects = [];
	self.nodes = []

	// Splits the node into 4 subnodes
	self.split = function() {
		var subWidth = Math.floor(self.bounds.width / 2);
		var subHeight = Math.floor(self.bounds.height / 2);
		var x = Math.floor(self.bounds.pos.x);
		var y = Math.floor(self.bounds.pos.y);
		var nextLevel = self.level + 1;

		self.nodes[0] = new Quadtree(new Box(x + subWidth, y, subWidth, subHeight), self.maxObjects, self.maxLevels, nextLevel);
		self.nodes[1] = new Quadtree(new Box(x, y, subWidth, subHeight), self.maxObjects, self.maxLevels, nextLevel);
		self.nodes[2] = new Quadtree(new Box(x, y + subHeight, subWidth, subHeight), self.maxObjects, self.maxLevels, nextLevel);
		self.nodes[3] = new Quadtree(new Box(x + subWidth, y + subHeight, subWidth, subHeight), self.maxObjects, self.maxLevels, nextLevel);
	}

	
	// Determine which node the object belongs to. -1 means
	// object cannot completely fit within a child node and is part
	// of the parent node
	self.getIndex = function(rect) {
		var index = -1;
		var verticalMidpoint = self.bounds.pos.x + (self.bounds.width / 2);
		var horizontalMidpoint = self.bounds.pos.y + (self.bounds.height / 2);

		// Object can completely fit within the top quadrants
		var topQuadrant = (rect.pos.y < horizontalMidpoint && rect.pos.y + rect.height < horizontalMidpoint);
		// Object can completely fit within the bottom quadrants
		var bottomQuadrant = (rect.pos.y > horizontalMidpoint);

		// Object can completely fit within the left quadrants
		if(rect.pos.x < verticalMidpoint && rect.pos.x + rect.width < verticalMidpoint) {
			if(topQuadrant) {
				index = 1;
			} else if(bottomQuadrant) {
				index = 2;
			}
		} else if(rect.pos.x > verticalMidpoint) {
		// Object can completely fit within the right quadrants 
			if(topQuadrant) {
				index = 0;
			} else if(bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	}

	// Insert the object into the quadtree. If the node
	// exceeds the capacity, it will split and add all
	// objects to their corresponding self.nodes.
	self.insert = function(rect) {
		var i = 0, index;
		
		// If we have subnodes
		if(typeof self.nodes[0] !== 'undefined') {
			index = self.getIndex(rect);

			if(index !== -1) {
				self.nodes[index].insert(rect);
				return;
			}
		}

		self.objects.push(rect);
		
		if(self.objects.length > MAX_OBJECTS && self.level < MAX_LEVELS) {
			// Split if we don't already have subnodes
			if(typeof self.nodes[0] === 'undefined') {
				self.split();
			}
			
			// Add all objects to there corresponding subnodes
			while(i < self.objects.length) {
				
				index = self.getIndex(self.objects[ i ]);
				
				if(index !== -1) {					
					self.nodes[index].insert(self.objects.splice(i, 1)[0]);
				} else {
					i++;
				}
			}
		}
	};

	// Return all objects that could collide with the given object
	self.retrieve = function(rect) {
		
		var index = self.getIndex(rect);
		var returnObjects = self.objects;
			
		// If we have subnodes
		if(typeof self.nodes[0] !== 'undefined') {
			
			// If rect fits into a subnode
			if(index !== -1) {
				returnObjects = returnObjects.concat(self.nodes[index].retrieve(rect));
				
			// If rect does not fit into a subnode, check it against all subnodes
			} else {
				for(var i in self.nodes) {
					returnObjects = returnObjects.concat(self.nodes[i].retrieve(rect));
				}
			}
		}
	
		return returnObjects;
	};

	self.clear = function() {
		self.objects = [];

		for(var i in self.nodes) {
			if(typeof self.nodes[i] !== 'undefined') {
				self.nodes[i].clear();
			}
		}

		self.nodes = [];
	}
}