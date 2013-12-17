
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
	this.startPos1 = [-5, 0, -5, -2];
	this.startPos2 = [5, 0, 5, 2];
	this.starts = [this.startPos1, this.startPos2]


	this.init = function() {
		// tell the input system we want all input events (requires inputEvent(key,evt) method)
		input.addUpdateObject(this);

		// create the ball
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
				var intersection = ball.collider.intersects(block.collider);
				// if the ball intersects with the block
				if (intersection) {
					block.color = [0, 1, 1]; // debug: change block color for a sec
				}
				else {
					block.color = [1, 0, 0]; // debug: reset ball color
				}
			}
			var intersection = ball.collider.intersects(this.paddle1.collider) || ball.collider.intersects(this.paddle2.collider)
			if (intersection){	
				//this.dirFlipX = !this.dirFlipX; // flip ball direction
				ball.xSpeed = ball.xSpeed * -1;
			}
			else {
			}
		}
		//update the position of all the balls	
		for (var i = this.balls.length - 1; i >= 0; i--){
			//update ball positions
			this.balls[i].position[0] += this.balls[i].xSpeed * timeSinceLastFrame;
			this.balls[i].position[2] += this.balls[i].ySpeed * timeSinceLastFrame;
			//check top and bottom positions
			var ymax = 5.5 
			if(this.balls[i].position[2] > ymax){
				this.balls[i].ySpeed = this.balls[i].ySpeed * -1;
				this.balls[i].position[2] = ymax;
			}else if(this.balls[i].position[2] < -ymax){
				this.balls[i].ySpeed = this.balls[i].ySpeed * -1;
				this.balls[i].position[2] = -ymax;
			}
		}
		//check top and bootom boundries
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
