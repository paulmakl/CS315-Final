
// game global:
var breakout;


function Breakout() {
	// GameObjects:
	//this.ball = null;
	var self = this;
	this.paddle1 = null;
	this.paddle2 = null;
	this.blocks = [];
	this.balls = []; // hueh hueh hueh

	// Timers:
	this.rotTimer = 0;
	this.moveTimer = 0;
	this.dirFlipX = true;
	this.Start1 = [-5, 0, -10, 0];
	this.Start2 = [5, 0, 10, 0];
	this.starts = [this.Start1, this.Start2]


	this.init = function() {
		// tell the input system we want all input events (requires inputEvent(key,evt) method)
		input.addUpdateObject(this);

		// create the ball
		//this.ball = new Ball("ball", "Ball", -5, 0, 10, 0);
		//this.ball.collider = new CircleCollider(this.ball);
		//engine.addGameObject(this.ball);
		//breakout.balls.push(this.ball)
		for (var i=0; i<2; i++) {
			var ball = new Ball("ball" + i, "Ball", 
					this.starts[i][0], this.starts[i][1], this.starts[i][2], this.starts[i][3]);
			ball.collider = new CircleCollider(ball);
			engine.addGameObject(ball);
			this.balls.push(ball);
		}
		//ball = new Ball("ball

		// create a block
		for (var i=0; i<2; i++) {
			var block = new GameObject("block_" + i, "FancyCube");
			block.collider = new RectangleCollider(block);
			block.position = [0, 0, i];
			engine.addGameObject(block);
			this.blocks.push(block);
		}
		this.blocks[0].position = [0, 0, -5];
		this.blocks[1].position = [0, 0, 5];

		// create the paddles
		this.paddle1 = new GameObject("paddle1", "Paddle");
		this.paddle1.collider = new RectangleCollider(this.paddle1, 0.6552, 4.608);
		this.paddle1.position = [11, 0, 0];
		this.paddle1.rotation = [0, 180, 0];
		engine.addGameObject(this.paddle1);

		this.paddle2 = new GameObject("paddle2", "Paddle");
		this.paddle2.collider = new RectangleCollider(this.paddle2, 0.6552, 4.608);
		this.paddle2.position = [-11, 0, 0];
		engine.addGameObject(this.paddle2);

		// tell the engine we want update() to get called every frame
		engine.addUpdateObject(this);
	};


	this.inputEvent = function(key, evt) {
		//console.log(key);
		//console.log(evt);
	};

	this.addBall = function(ball){
		console.log(ball);
		this.balls.push(ball);
	}


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
		// test collisions for each ball
		for (var i=0; i < this.balls.length; i++) {
			var ball = this.balls[i];
			// check collisions for each ball
			for (var j = this.blocks.length - 1; j >= 0; j--) {
				var block = this.blocks[j];

				// if the ball intersects with the block
				if (ball.collider.intersects(block.collider) ) {
					this.dirFlip = !this.dirFlip; // flip ball direction
					block.color = [0, 1, 1]; // debug: change block color for a sec
				}
				else {
					block.color = [1, 0, 0]; // debug: reset ball color
				}
			}
			if (ball.collider.intersects(this.paddle1.collider) ||
				       	ball.collider.intersects(this.paddle2.collider) ) {
				//this.dirFlipX = !this.dirFlipX; // flip ball direction
				ball.xSpeed = ball.xSpeed * -1;
			}
			else {
			}
		}
		// test collisions for each block
		/*for (var i = this.blocks.length - 1; i >= 0; i--) {
			var block = this.blocks[i];

			// if the ball intersects with the block
			if (this.ball.collider.intersects(block.collider) ) {
				this.dirFlip = !this.dirFlip; // flip ball direction
				block.color = [0, 1, 1]; // debug: change block color for a sec
			}
			else {
				block.color = [1, 0, 0]; // debug: reset ball color
			}
		}*/
		
		/*if (this.ball.collider.intersects(this.paddle1.collider) || this.ball.collider.intersects(this.paddle2.collider) ) {
			//this.dirFlipX = !this.dirFlipX; // flip ball direction
			this.ball.xSpeed = this.ball.xSpeed * -1;
		}
		else {
		}*/
		for (var i = this.balls.length - 1; i >= 0; i--){
			this.balls[i].position[0] += this.balls[i].xSpeed * timeSinceLastFrame;
		}
		//this.ball.position[0] += this.ball.xSpeed * timeSinceLastFrame;

		// move ball based on the dirFlip boolean
		/*if (this.dirFlipX == true) {
			this.ball.position[0] += 5 * timeSinceLastFrame;
		}
		else {
			this.ball.position[0] -= 5 * timeSinceLastFrame;
		}*/
		/*if(this.dirFlipY == true){
			this.ball.position[0] += this.ySpeed * timeSinceLastFrame;
		}else{
			this.ball.position[0] -= this.ySpeed * timeSinceLastFrame;
		}*/


		// put the light right above the ball
		engine.light.position[0] = 0;//this.ball.position[0];
		engine.light.position[1] = 10;//this.ball.position[1] + 10.0;
		engine.light.position[2] = 0;//this.ball.position[2];
	};
}



function BreakoutSetup() {
	breakout = new Breakout();
	breakout.init();
}
