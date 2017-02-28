### Player size and whole numbers
I use 39.5 instead of 40 because When a player of size 40 entries a tunnel of size 40
the engine calculates slightly off and thinks the player is inside a tunnel piece,
which leads to passing through the tunnel piece.
It works, but a general rule of thumb is to not create tunnels of player's size.
I will take this in mind when writing a map generator to always take positions and sizes as whole numbers

### Quadtrees and slides
I think sliding may lead to some passing through objects.
There could be a slide which leads to another node in the quadtree that wasn't retrieved from broadphaseBox 
because velocity has changed. (Game.update)
