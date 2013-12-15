
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
		// tell the input system we want all input events (requires inputEvent(key,evt) method)
		input.addUpdateObject(this);

		// create the ball
		this.ball = new GameObject("ball", "ball");
		this.ball.collider = new CircleCollider(this.ball);
		this.ball.position = [0, 0, 0];
		engine.addGameObject(this.ball);

		// create a block
		for (var i=0; i<2; i++) {
			var block = new GameObject("block_" + i, "fancycube");
			block.collider = new RectangleCollider(block);
			block.position = [0, 0, i];
			engine.addGameObject(block);
			this.blocks.push(block);
		}
		this.blocks[0].position = [0, 0, -5];
		this.blocks[1].position = [0, 0, 5];

		// create the paddles
		this.paddle1 = new GameObject("paddle1", "paddle");
		this.paddle1.position = [6, 0, 0];
		//this.paddle1.scale = [1, 1, 1];
		engine.addGameObject(this.paddle1);

		this.paddle2 = new GameObject("paddle2", "paddle");
		this.paddle2.position = [-6, 0, 0];
		//this.paddle2.scale = [1, 1, 1];
		engine.addGameObject(this.paddle2);

		// tell the engine we want update() to get called every frame
		engine.addUpdateObject(this);
	};


	this.inputEvent = function(key, evt) {
		//console.log(key);
		//console.log(evt);
	};


	this.update = function(timeSinceLastFrame) {
		//TODO: bounds check. range seems to be roughly 3 to -5 for now.
		// check up/down keys for player 1
		if (input.keyIsDown("M")) {
			this.paddle1.position[2] += 6.5 * timeSinceLastFrame;
		}
		else if (input.keyIsDown("K")) {
			this.paddle1.position[2] -= 6.5 * timeSinceLastFrame;
		}

		// check up/down keys for player 2
		if (input.keyIsDown("Z")) {
			this.paddle2.position[2] += 6.5 * timeSinceLastFrame;
		}
		else if (input.keyIsDown("A")) {
			this.paddle2.position[2] -= 6.5 * timeSinceLastFrame;
		}

		// test collisions for each block
		for (var i = this.blocks.length - 1; i >= 0; i--) {
			var block = this.blocks[i];

			// if the ball intersects with the block
			if (this.ball.collider.intersects(block.collider)) {
				this.dirFlip = !this.dirFlip; // flip ball direction
				block.color = [0, 1, 1]; // debug: change block color for a sec
			}
			else {
				block.color = [1, 0, 0]; // debug: reset ball color
			}
		}

		// move ball based on the dirFlip boolean
		if (this.dirFlip == true) {
			this.ball.position[2] += 5 * timeSinceLastFrame;
		}
		else {
			this.ball.position[2] -= 5 * timeSinceLastFrame;
		}

	};
}



function BreakoutSetup() {
	breakout = new Breakout();
	breakout.init();
}
