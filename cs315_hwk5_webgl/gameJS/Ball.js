function Ball(name, mesh, x, y, xSpeed, ySpeed, xdir, ydir){
	this.base = GameObject;
	this.base(name, mesh, x, y);

	this.startingPosition = [x,y,0];

	this.xSpeed = xSpeed;
	this.ySpeed = ySpeed;
	
	this.xdir = xdir;
	this.ydir = ydir;

	this.init = function(){
		breakout.addBall(this);
		engine.addUpdateObject(this);
	}	
}

Ball.prototype = new GameObject;
