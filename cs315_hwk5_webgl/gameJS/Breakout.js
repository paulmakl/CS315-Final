
// game global:
var breakout;


function Breakout() {
	// GameObjects:
	//These are factors that control how the ball bounces
	//off the paddles at different points on the paddle
	this.extremeBounce = 9;
	this.normalBounce = 5;
	this.midBounce = 4;	
	// constants that control the threshold where the bounce zones are
	this.topfifths = 1.2;
	this.midfifths = 0.5;
	//this.ball = null;
	var self = this;
	this.paddle1 = null;
	this.paddle2 = null;
	//this.blockStartingPositions = [[0,0,5],[0,0,4],[0,0,3],[0,0,-5]];
	this.blockStartingPositions = [];
	this.blocks = [];
	this.balls = []; // hueh hueh hueh

	// Timers:
	this.rotTimer = 0;
	this.moveTimer = 0;
	this.dirFlipX = true;
	//this.startPos1 = [-7, 0, 5, 3, -1, -1];
	//this.startPos2 = [7, 0, 5, 3, 1, 1];
	this.startPos1 = [-7, 0, -5, 0, 1, -1];
	this.startPos2 = [7, 0, 5, 0, 1, -1];
	this.starts = [this.startPos1, this.startPos2]


	this.init = function() {
		// tell the input system we want all input events (requires inputEvent(key,evt) method)
		input.addUpdateObject(this);

		// create the ball
		for (var i=0; i<2; i++) {
			var ball = new Ball("ball" + i, "Ball", 
				this.starts[i][0], this.starts[i][1], // starting x and y coordinates
			       	this.starts[i][2], this.starts[i][3], // starting xspeed and yspeed
			       	this.starts[i][4], this.starts[i][5]); // starting xdirection and ydirection
			ball.collider = new CircleCollider(ball, 0.6); // pass in ball object and radius
			engine.addGameObject(ball);
			this.balls.push(ball);
		}
		this.balls[0].color = [1,1,0]

		// create brick pattern in the middle of the arena
		// add this to a list of starting positions for bricks
		for(var i = 5; i >= 0; i--){
			for(var j = i; j >= -i; j--){
				this.blockStartingPositions.push([i-5, 0, j]);
				if( (i - 5) < 0 ){
					this.blockStartingPositions.push([5-i, 0, j]);
				}
			}
		}
		// put each ball in gameobjects
		// 
		for (var i=0; i<this.blockStartingPositions.length; i++) {
                        var block = new GameObject("block_" + i, "FancyCube");
                        block.collider = new RectangleCollider(block, 0.6552, 0.6552);
                        block.position = [this.blockStartingPositions[i][0],
                                               this.blockStartingPositions[i][1],
                                               this.blockStartingPositions[i][2]];
                        engine.addGameObject(block);
                        this.blocks.push(block);
                }
		// create the paddles
		this.paddle1 = new GameObject("paddle1", "Paddle");
		this.paddle1.collider = new RectangleCollider(this.paddle1, 0.6552, 4.608, true);// last argument states that it is a paddle
		this.paddle1.position = [11, 0, 0];
		this.paddle1.rotation = [0, 180, 0];
		engine.addGameObject(this.paddle1);

		this.paddle2 = new GameObject("paddle2", "Paddle");
		this.paddle2.collider = new RectangleCollider(this.paddle2, 0.6552, 4.608, true);
		this.paddle2.position = [-11, 0, 0];
		engine.addGameObject(this.paddle2);

		// tell the engine we want update() to get called every frame
		engine.addUpdateObject(this);
	};


	this.inputEvent = function(key, evt) {
		//console.log(key);
		//console.log(evt);
	};
	/*
	 * removes a block from the blocks list
	 */
	this.removeBlock = function(block){
		if(block){
			var index = this.blocks.indexOf(block);
			this.blocks.splice(index, 1); 
		}
	}

	/*
	 * add a block to the list of blocks
	 */
	this.addBlock = function(block){
		this.blocks.push(block);
	}

	this.addBall = function(ball){
		console.log(ball);
		this.balls.push(ball);
	}


	this.update = function(timeSinceLastFrame) {
		// check up/down keys for player 1
		if (input.keyIsDown("M")) {
			if(this.paddle1.position[2] < 5){
				this.paddle1.position[2] += 6.5 * timeSinceLastFrame;
			}
		}
		else if (input.keyIsDown("K")) {
			if(this.paddle1.position[2] > -5){
				this.paddle1.position[2] -= 6.5 * timeSinceLastFrame;
			}
		}

		// check up/down keys for player 2
		if (input.keyIsDown("Z")) {
			if(this.paddle2.position[2] < 5){
				this.paddle2.position[2] += 6.5 * timeSinceLastFrame;
			}
		}
		else if (input.keyIsDown("A")) {
			if(this.paddle2.position[2] > -5){
				this.paddle2.position[2] -= 6.5 * timeSinceLastFrame;
			}
		}
		// test collisions for each ball
		for (var i=0; i < this.balls.length; i++) {
			var ball = this.balls[i];
			// check collisions between this ball and each block
			for (var j = this.blocks.length - 1; j >= 0; j--) {
				var block = this.blocks[j];
				var intersection = ball.collider.intersects(block.collider);
				// if the ball intersects with the block
				if (intersection) {
					engine.removeGameObject(block);// remove the block from game objects list
					this.removeBlock(block);// remove the block from the blocks list
				}
			}
			//This runs the intersection test between the two paddles and the current ball. 
			// The changing reflection of the movement vectors between the two elements is
			// already handled
			var intersection = ball.collider.intersects(this.paddle1.collider) || 
					   ball.collider.intersects(this.paddle2.collider)
		}
		//see if the two balls are colliding
		this.balls[0].collider.intersects(this.balls[1].collider)
		//update the position of all the balls	
		for (var i = this.balls.length - 1; i >= 0; i--){
			//update ball positions
			this.balls[i].position[0] += this.balls[i].xSpeed * this.balls[i].xdir * timeSinceLastFrame;
			this.balls[i].position[2] += this.balls[i].ySpeed * this.balls[i].ydir * timeSinceLastFrame;
			//check top and bottom positions
			var ymax = 5.5 
			if(this.balls[i].position[2] > ymax){
				this.balls[i].ydir = this.balls[i].ydir * -1;
				this.balls[i].position[2] = ymax;
			}else if(this.balls[i].position[2] < -ymax){
				this.balls[i].ydir = this.balls[i].ydir * -1;
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
