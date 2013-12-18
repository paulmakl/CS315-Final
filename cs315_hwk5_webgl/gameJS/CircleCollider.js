"use strict";
/*
    See docs.txt for the things required in a collider class.
*/


function CircleCollider(obj, radius) {
    // the parent GameObject
    this.gameObject = obj;
    this.xerror = 6;
    this.yerror = 6;
    // shape type for checking how to intersect with this
    this.shape = "Circle";
    // circle properties
    if (radius){
	    this.radius = radius;
    }else{
	    this.radius = 1;
    }


    // returns true if this collider intersects with the other collider, else false
    this.intersects = function(col, timeSinceLastFrame) {
        if (col.shape == "Rectangle") {
            var points = col.getPoints();
            var origin = [this.gameObject.position[0], this.gameObject.position[2]];
	    var colliding = false;
	    //if colliding with sides
	    if(  lineIntersectsCircle(points[0], points[1], origin, this.radius) ||
	         lineIntersectsCircle(points[2], points[3], origin, this.radius) ){
		this.gameObject.xdir = this.gameObject.xdir * -1;
		if(col.paddle){
			if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.topfifths ||
			    col.gameObject.position[2] < this.gameObject.position[2] - breakout.topfifths){
				this.gameObject.ySpeed = breakout.extremeBounce;
			}else if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.midfifths ||
			          col.gameObject.position[2] < this.gameObject.position[2] - breakout.midfifths){
				this.gameObject.ySpeed = breakout.normalBounce;
			}
			
		}
		this.gameObject.position[0] += this.xerror * this.gameObject.xdir * timeSinceLastFrame;
		colliding = true;
	    }
	    //if colliding on sides
	    if( lineIntersectsCircle(points[1], points[2], origin, this.radius) ||
	     	lineIntersectsCircle(points[3], points[0], origin, this.radius)  ){
			this.gameObject.ydir = this.gameObject.ydir * -1;
			this.gameObject.position[2] += this.yerror * this.gameObject.ydir * timeSinceLastFrame;
			colliding = true;
	    }
	    return colliding;
	    //if colliding with sides
	    // if hitting the top and bottom of the ball
	    /*if( (lineIntersectsCircle(points[0], points[1], origin, this.radius) ||
	         lineIntersectsCircle(points[2], points[3], origin, this.radius) )
		&&
		(lineIntersectsCircle(points[1], points[2], origin, this.radius) ||
	     	 lineIntersectsCircle(points[3], points[0], origin, this.radius)  )

	      ){
		this.gameObject.xdir = this.gameObject.xdir * -1;
		this.gameObject.ydir = this.gameObject.ydir * -1;
		if(col.paddle){
			if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.topfifths ||
			    col.gameObject.position[2] < this.gameObject.position[2] - breakout.topfifths){
				this.gameObject.ySpeed = breakout.extremeBounce;
			}else if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.midfifths ||
			          col.gameObject.position[2] < this.gameObject.position[2] - breakout.midfifths){
				this.gameObject.ySpeed = breakout.normalBounce;
			}
			this.gameObject.position[0] += this.error * this.gameObject.xdir * timeSinceLastFrame;
			this.gameObject.position[2] += this.error * this.gameObject.ydir * timeSinceLastFrame;
		}
		return true;
	      }
	    //if side intersection
	    if(  lineIntersectsCircle(points[0], points[1], origin, this.radius) ||
	         lineIntersectsCircle(points[2], points[3], origin, this.radius) ){
		this.gameObject.xdir = this.gameObject.xdir * -1;
		if(col.paddle){
			if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.topfifths ||
			    col.gameObject.position[2] < this.gameObject.position[2] - breakout.topfifths){
				this.gameObject.ySpeed = breakout.extremeBounce;
			}else if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.midfifths ||
			          col.gameObject.position[2] < this.gameObject.position[2] - breakout.midfifths){
				this.gameObject.ySpeed = breakout.normalBounce;
			}
			this.gameObject.position[0] += this.error * this.gameObject.xdir * timeSinceLastFrame;
			
		}
		return true;
	    }
	    //if top/bot intersection
	    if( lineIntersectsCircle(points[1], points[2], origin, this.radius) ||
	     	lineIntersectsCircle(points[3], points[0], origin, this.radius)  ){
			this.gameObject.ydir = this.gameObject.ydir * -1;
			return true;
	    }*/

            return (
                pointInRectangle(origin, points[0], points[2]) //||
                //lineIntersectsCircle(points[0], points[1], origin, this.radius) //||
                //lineIntersectsCircle(points[1], points[2], origin, this.radius) ||
                //lineIntersectsCircle(points[2], points[3], origin, this.radius) //||
                //lineIntersectsCircle(points[3], points[0], origin, this.radius) 
            );
        }// if circle intersection
        else if (col.shape == "Circle") {
		var incomingBall = col.getPoints();
		var thisBall = this.getPoints();
		var intersects = circlesIntersect(thisBall, incomingBall);
		// if the balls intersect, the they exchange x directions and speeds
		//  This follows the basic laws of the conservation of momentum with equal masses
		if(intersects){
			col.gameObject.xSpeed = [this.gameObject.xSpeed, this.gameObject.xSpeed = col.gameObject.xSpeed][0];
			col.gameObject.ySpeed = [this.gameObject.ySpeed, this.gameObject.ySpeed = col.gameObject.ySpeed][0];
			col.gameObject.xdir = [this.gameObject.xdir, this.gameObject.xdir = col.gameObject.xdir][0];
			col.gameObject.ydir = [this.gameObject.ydir, this.gameObject.ydir = col.gameObject.ydir][0];
		}		 
		return circlesIntersect(thisBall, incomingBall);
        }
    }

    this.getPoints = function() {
	    var x = this.gameObject.position[0];
	    var y = this.gameObject.position[2];
	    return [x, y, this.radius];
    }
    this.toString = function() {
        return "<CircleCollider radius=[" + this.radius + "]>";
    }
}



