# Top down engine prototype
It's soon to be a top down shooter

### Preview
![preview](/assets/preview.png)

### Features
- Basic controls and physics (acceleration, velocity, friction)
- Collision (static and moving rectangles)
	- Quadtree
	- Utility functions for further calculations (points and lines)
- Camera (lerping with player's velocity) and aiming (affects camera a bit)

### Future features (sorted by priority)
- Advance the whole thing to multiplayer
	- Procedurally generated maps
	- Protocol fast enough to actually be deployed on a server
- Weapon system (configurable)
	- Patterns and shapes
	- Bullets, rockets etc.
	- Inaccuracy and spread (to be considered)
- Advanced controls (dashing etc.)