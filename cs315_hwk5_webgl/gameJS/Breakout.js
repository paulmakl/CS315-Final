"use strict";

// game global:
var breakout;


// http://colorschemedesigner.com/#3r31Tuup9w0wV
var Color = {
	p1: {
		main: [0x0B, 0xC7, 0x7E, 0xFF],
		desat: [0x1E, 0x4B, 0x5F, 0xFF],
		dark: [0x04, 0x3A, 0x52, 0xFF],
		light: [0x3E, 0x99, 0xC0, 0xFF],
		light_desat: [0x62, 0xA4, 0xC0, 0xFF]
	},
	p2: {
		main: [0xC8, 0x92, 0x0A, 0xFF],
		desat: [0x96, 0x78, 0x2B, 0xFF],
		dark: [0x82, 0x5E, 0x03, 0xFF],
		light: [0xE4, 0xB7, 0x43, 0xFF],
		light_desat: [0xE4, 0xC3, 0x70, 0xFF]
	},
	bg: {
		main: [0xC8, 0x2E, 0x0A, 0xFF],
		desat: [0x96, 0x3F, 0x2B, 0xFF],
		dark: [0x82, 0x1B, 0x03, 0xFF],
		light: [0xE4, 0x62, 0x43, 0xFF],
		light_desat: [0xE4, 0x86, 0x70, 0xFF]
	},
	/* helper method to clone the color array and convert to the right values */
	get: function(type, variation) {
		// copy the array so we don't change anything
		var col = vec4.clone(this[type][variation]);
		// convert from 0..255 to 0..1
		for (var i = col.length - 1; i >= 0; i--) col[i] = col[i] / 0xFF;
		return col;
	}
};


function Breakout() {
	var self = this; // hold on to a reference to the current instance in case 'this' gets overwritten

	this.started = false;
	this.paused = false;
	this.movingLight = false;

	// GameObjects:
	this.paddle1Score = 0;
	this.paddle2Score = 0;
	this.scoreboard = []; // scoreboard digits
	this.deco = []; // decoration models
	this.menuball = null;

	this.ballRotationSpeed = 200;

	// gameplay variables
	this.paddleSpeed = 8.5;
	this.ballSpeed = 1.0; // multiplier

	//These are factors that control how the ball bounces
	//off the paddles at different points on the paddle
	this.extremeBounce = 9;
	this.normalBounce = 5;
	this.midBounce = 4;	
	// constants that control the threshold where the bounce zones are
	this.topfifths = 1.2;
	this.midfifths = 0.5;
	//this.ball = null;
	this.paddle1 = null;
	this.paddle2 = null;
	this.blockStartingPositions = [];
	this.blocks = [];
	this.balls = []; // hueh hueh hueh

	// Timers:
	this.zLightInc = 0.1;
	this.xLightInc = 0.3;
	this.moveTimer = 0;
	this.ballRotationTimer = 0;
	this.dirFlipX = true;
	this.startPos1 = [-7, 0, 5, 0, -1, -1];
	this.startPos2 = [7, 0, 5, 0, 1, -1];
	this.starts = [this.startPos1, this.startPos2]


	this.init = function() {
		// tell the input system we want all input events (requires inputEvent(key,evt) method)
		input.addUpdateObject(this);

		// set up the scoreboard
		this.updateScoreboard(this.paddle2Score, this.paddle1Score);

		// initial camera setup
		engine.camera.position[2] = 5.8;
		engine.camera.lookAt[2] = -1.4;
		engine.camera.recalculate();

		// setup the main light
		engine.light.position = [0, 10, 0];

		// place decoration meshes
		var table = this.createDecoration("table", "PlayingField", [0, 0, 0]);
		table.diffuse = Color.get("bg", "dark");
		table.specular = Color.get("bg", "desat");
		table.shininess = 100;

		this.menuball = this.createDecoration("menuball", "Ball", [0, 5.5, 0], Color.get("bg", "main"));
		this.menuball.scale = [8, 8, 8];

		// create the ball
		for (var i=0; i<2; i++) {
			var ball = new Ball("ball" + i, "Ball", 
				this.starts[i][0], this.starts[i][1], // starting x and y coordinates
			       	this.starts[i][2], this.starts[i][3], // starting xspeed and yspeed
			       	this.starts[i][4], this.starts[i][5]); // starting xdirection and ydirection
			ball.collider = new CircleCollider(ball, 0.4); // pass in ball object and radius
			engine.addGameObject(ball);
			this.balls.push(ball);
		}
		this.balls[0].diffuse = Color.get("p1", "main");
		this.balls[1].diffuse = Color.get("p2", "main");

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
                        block.collider = new RectangleCollider(block, 1, 1, false);
                        block.position = [this.blockStartingPositions[i][0],
                                               this.blockStartingPositions[i][1],
                                               this.blockStartingPositions[i][2]];
                        block.diffuse = Color.get("bg", "light");
                        engine.addGameObject(block);
                        this.blocks.push(block);
                }
		// create the paddles
		this.paddle1 = new GameObject("paddle1", "Paddle");
		this.paddle1.collider = new RectangleCollider(this.paddle1, 0.6552, 4.608, true);
		this.paddle1.position = [-11, 0, 0];
		this.paddle1.diffuse = Color.get("p1", "main");
		engine.addGameObject(this.paddle1);

		this.paddle2 = new GameObject("paddle2", "Paddle");
		this.paddle2.collider = new RectangleCollider(this.paddle2, 0.6552, 4.608, true);// last argument states that it is a paddle
		this.paddle2.position = [11, 0, 0];
		this.paddle2.rotation = [0, 180, 0];
		this.paddle2.diffuse = Color.get("p2", "main");
		engine.addGameObject(this.paddle2);

		// tell the engine we want our update() method to get called every frame
		engine.addUpdateObject(this);
	};


	/*
	 * Stops displaying menu stuff and starts the game
	 */
	this.startGame = function() {
		var i = this.deco.indexOf(this.menuball);
		if (i > -1) this.deco.splice(i, 1);
		engine.removeGameObject(this.menuball);
		this.started = true;
	};


	/*
	 * Helper method for creating decorative GameObjects (ones without collision)
	 */
	this.createDecoration = function(name, model, pos, color) {
		var obj = new GameObject(name, model);
		obj.position = vec3.clone(pos);
		if (color == null) {
			obj.diffuse = Color.get("bg", "dark");
		}
		this.deco.push(obj);
		engine.addGameObject(obj);
		return obj;
	};


	/*
	 * Update the scores with the specified values
	 */
	this.updateScoreboard = function(p1score, p2score) {
		// scoreboard positions per player
		var p1pos = [-5, 3, -6];
		var p2pos = [5, 3, -6];

		// clear the current scoreboard
		for (var i = this.scoreboard.length - 1; i >= 0; i--) {
			engine.removeGameObject(this.scoreboard[i]);
		};
		this.scoreboard = []; // clear array

		// helper function to split an int into a array of single digits
		// we need this because we have one model per digit (1, 2, 3, etc)
		function splitDigits(num) {
			// helper function to get one individual digit
			function getDigit(n, i) { return Math.floor(n / Math.pow(10, i - 1)) % 10; }

			var digits = [];

			if (num <= 0) {
				return [0];
			}
			else if (num < 10) {
				digits.push(getDigit(num, 1));
			}
			else if (num < 100) {
				digits.push(getDigit(num, 2));
				digits.push(getDigit(num, 1));
			}
			else if (num >= 100) {
				// max out at 99 i guess
				digits.push(9);
				digits.push(9);
			}
			return digits;
		}

		// ====== player 1 score ======
		var p1digits = splitDigits(p1score);
		for (var i = p1digits.length - 1; i >= 0; i--) {
			var model = "Digit" + p1digits[i];
			var obj = new GameObject("scoreboard_digit", model);
			obj.position = vec3.clone(p1pos);
			obj.position[0] += i * 0.5;
			obj.rotation = [0, 0, 0];
			// very high ambient so scores are always easy to see
			vec3.multiply(obj.ambient, Color.get("p1", "main"), [0.6, 0.6, 0.6]);
			obj.diffuse = Color.get("p1", "light_desat");
			this.scoreboard.push(obj);
			engine.addGameObject(obj);
		};

		// ====== player 2 score ======
		var p2digits = splitDigits(p2score);
		for (var i = p2digits.length - 1; i >= 0; i--) {
			var model = "Digit" + p2digits[i];
			var obj = new GameObject("scoreboard_digit", model);
			obj.position = vec3.clone(p2pos);
			obj.position[0] += i * 0.5;
			obj.rotation = [0, 0, 0];
			obj.ambient = [0.5, 0.5, 0.5];
			// very high ambient so scores are always easy to see
			vec3.multiply(obj.ambient, Color.get("p2", "main"), [0.6, 0.6, 0.6]);
			obj.diffuse = Color.get("p2", "light_desat");
			this.scoreboard.push(obj);
			engine.addGameObject(obj);
		};
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


	/*
	 * Main game update loop. All game logic is in here.
	 */
	this.update = function(timeSinceLastFrame) {
		// increment ball rotation timer
		this.ballRotationTimer += timeSinceLastFrame;
		this.ballRotationTimer = this.ballRotationTimer % 360;

		//camera controls
		if (input.keyIsDown("G")) {
			if (engine.camera.position[2] < 25) {
				engine.camera.position[2] += 6 * timeSinceLastFrame;
				engine.camera.lookAt[2] -= 1.5 * timeSinceLastFrame;
				engine.camera.recalculate();
			}
		}
		if (input.keyIsDown("T")) {
			if (engine.camera.position[2] >= 0.25) {
				engine.camera.position[2] -= 6 * timeSinceLastFrame;
				engine.camera.lookAt[2] += 1.5 * timeSinceLastFrame;
				engine.camera.recalculate();
			}
		}

		// rotate the big ball before the game starts
		if (!this.started) {
			this.menuball.rotation[2] = -15 * this.ballRotationTimer;
		}

		if (this.paused || !this.started) return;
		// ========================================================================
		//  Everything past this point will NOT occur if the game is paused
		// ========================================================================

		var PADDLE_BOUNDS = 3.73;
		
		// helper wrapper around clamp with to keep the code more readable
		function paddleClamp(pos) { return clamp(pos, -PADDLE_BOUNDS, PADDLE_BOUNDS); }

		// check up/down keys for player 1
		if (input.keyIsDown("Z")) {
			this.paddle1.position[2] = paddleClamp(this.paddle1.position[2] + (this.paddleSpeed * timeSinceLastFrame));
			this.paddle1.collider.dir = 1;
		}
		else if (input.keyIsDown("A")) {
			this.paddle1.position[2] = paddleClamp(this.paddle1.position[2] - (this.paddleSpeed * timeSinceLastFrame));
			this.paddle1.collider.dir = -1;
		}else{
			this.paddle1.collider.dir = 0;
		}

		// check up/down keys for player 2
		if (input.keyIsDown("M")) {
			this.paddle2.position[2] = paddleClamp(this.paddle2.position[2] + (this.paddleSpeed * timeSinceLastFrame));
			this.paddle2.collider.dir = 1;
		}
		else if (input.keyIsDown("K")) {
			this.paddle2.position[2] = paddleClamp(this.paddle2.position[2] - (this.paddleSpeed * timeSinceLastFrame));
			this.paddle2.collider.dir = -1;
		}else{
			this.paddle1.collider.dir = 0;
		}
		// test collisions for each ball
		for (var i=0; i < this.balls.length; i++) {
			var ball = this.balls[i];
			// check collisions between this ball and each block
			for (var j = this.blocks.length - 1; j >= 0; j--) {
				var block = this.blocks[j];
				var intersection = ball.collider.intersects(block.collider, timeSinceLastFrame);
				// if the ball intersects with the block
				if (intersection) {
					engine.removeGameObject(block);// remove the block from game objects list
					this.removeBlock(block);// remove the block from the blocks list
				}
			}
			//This runs the intersection test between the two paddles and the current ball. 
			// The changing reflection of the movement vectors between the two elements is
			// already handled
			var intersection = ball.collider.intersects(this.paddle1.collider, timeSinceLastFrame) || 
					   ball.collider.intersects(this.paddle2.collider, timeSinceLastFrame)
		}
		//see if the two balls are colliding
		this.balls[0].collider.intersects(this.balls[1].collider, timeSinceLastFrame)
		//update the position of all the balls	
		for (var i = this.balls.length - 1; i >= 0; i--){
			// hang onto the previous position before moving the ball
			var lastPos = vec3.clone(this.balls[i].position);

			//update ball positions
			this.balls[i].position[0] += this.balls[i].xSpeed * this.balls[i].xdir * timeSinceLastFrame;
			this.balls[i].position[2] += this.balls[i].ySpeed * this.balls[i].ydir * timeSinceLastFrame;

			// calculate the rotation of the ball (purely for visual fluff)
			var ballDir = vec3.create();
			vec3.subtract(ballDir, lastPos, this.balls[i].position);
			vec3.normalize(ballDir, ballDir);
			this.balls[i].rotation[0] = this.ballRotationTimer * this.ballRotationSpeed * ballDir[2];
			this.balls[i].rotation[2] = this.ballRotationTimer * this.ballRotationSpeed * ballDir[0];

			//check top and bottom positions
			var ymax = 5.5; 
			var xmax = 13;
			if(this.balls[i].position[2] > ymax){
				this.balls[i].ydir = this.balls[i].ydir * -1;
				this.balls[i].position[2] = ymax;
			}else if(this.balls[i].position[2] < -ymax){
				this.balls[i].ydir = this.balls[i].ydir * -1;
				this.balls[i].position[2] = -ymax;
			}
			// check if ball is outside of map
			if(this.balls[i].position[0] > xmax){
				this.updateScoreboard(this.paddle1Score + 1, this.paddle2Score);
				this.balls[i].position = [7,0,0];
				this.paddle1Score += 1;
			}else if(this.balls[i].position[0] < -xmax){
				this.updateScoreboard(this.paddle1Score, this.paddle2Score + 1);
				this.balls[i].position = [-7,0,0];
				this.paddle2Score += 1;
			}
		}

		//check top and bootom boundries
		// put the light right above the ball
		
		if (this.movingLight) {
			if (engine.light.position[1] > 10 || engine.light.position[1] < 1) {
				this.zLightInc *= -1;
			}
			if (engine.light.position[0] > 11 || engine.light.position[0] < -11) {
				this.xLightInc *= -1;
			}
			engine.light.position[0] = engine.light.position[0] + this.xLightInc;
			engine.light.position[1] = engine.light.position[1] + this.zLightInc;
			engine.light.position[2] = 0;
		}
	};
}



// helper function to create an instance of the game class at the correct global
function BreakoutSetup() {
	breakout = new Breakout();
	breakout.init();
}
