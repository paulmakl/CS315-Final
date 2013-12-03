
// game global:
var breakout;


function Breakout() {
	this.paddle = null;
	this.blocks = [];
	this.timer = 0;


	this.init = function() {
		this.paddle = new GameObject("paddle", "fancycube");
		this.paddle.scale = [4, 4, 4];
		engine.addGameObject(this.paddle);

		// tell the engine we want update() to get called every frame
		engine.addUpdateObject(this);
	}


	this.update = function(timeSinceLastFrame) {
		this.timer += timeSinceLastFrame;
		var angleInDegrees = (this.timer * 20) % 360.0;
		this.paddle.rotation[1] = angleInDegrees;
	}
}



function BreakoutSetup() {
	breakout = new Breakout();
	breakout.init();
}
