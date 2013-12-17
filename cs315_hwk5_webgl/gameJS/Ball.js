function Ball(name, mesh, x, y, xSpeed, ySpeed){
	this.base = GameObject;
	this.base(name, mesh, x, y);

	this.xSpeed = xSpeed;
	this.ySpeed = ySpeed;

	this.init = function(){
		breakout.addBall(this);
		engine.addUpdateObject(this);
	}	
}

Ball.prototype = new GameObject;
