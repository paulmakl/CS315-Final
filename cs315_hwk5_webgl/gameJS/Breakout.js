
// game global:
var breakout;


function Breakout() {
	// GameObjects:
	this.ball = null;
	this.paddle1 = null;
	this.paddle2 = null;
	this.blocks = [];

	// Timers:
	this.rotTimer = 0;
	this.moveTimer = 0;
	this.dirFlip = true;


	this.init = function() {
		// create the ball
		this.ball = new GameObject("ball", "ball");
		this.ball.collider = new CircleCollider(this.ball);
		this.ball.position = [0, 0, 0];
		engine.addGameObject(this.ball);

		// create a block
		var block = new GameObject("block", "fancycube");
		block.collider = new RectangleCollider(block);
		block.position = [0, 0, 0];
		engine.addGameObject(block);

		this.blocks.push(block);

		// create the paddles
		this.paddle1 = new GameObject("paddle1", "fancycube");
		this.paddle1.position = [6, 0, 0];
		this.paddle1.scale = [0.5, 0.5, 5];
		engine.addGameObject(this.paddle1);

		this.paddle2 = new GameObject("paddle2", "fancycube");
		this.paddle2.position = [-6, 0, 0];
		this.paddle2.scale = [0.5, 0.5, 5];
		engine.addGameObject(this.paddle2);

		// tell the engine we want update() to get called every frame
		engine.addUpdateObject(this);
	}


	this.update = function(timeSinceLastFrame) {
		//
		// calculate smooth rotation
		//
		//this.rotTimer += timeSinceLastFrame;
		//var angleInDegrees = (this.rotTimer * 20) % 360.0;
		//this.paddle1.rotation[1] = angleInDegrees;

		//
		// calculate movement
		//
		if (this.moveTimer > 1.0) {
			this.moveTimer = 0;
			this.dirFlip = !this.dirFlip; // toggle depth direction
		}
		else
			this.moveTimer += timeSinceLastFrame;

		if (this.dirFlip == true)
			vec3.lerp(this.ball.position, [0, 0, 3], [0, 0, -3], (-this.moveTimer) + 1.0);
		else
			vec3.lerp(this.ball.position, [0, 0, 3], [0, 0, -3], this.moveTimer);

		// test collisions
		if (this.blocks.length > 0) {
			var block = this.blocks[0];
			if (this.ball.collider.intersects(block.collider)) {
				block.color = [0, 1, 1];
			}
			else {
				block.color = [1, 0, 0];
			}
		}
	}
}



function BreakoutSetup() {
	breakout = new Breakout();
	breakout.init();
}
