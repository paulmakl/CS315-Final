"use strict";
/*
    See docs.txt for the things required in a collider class.
*/


function CircleCollider(obj, radius, paddle) {
    // the parent GameObject
    this.gameObject = obj;

    // shape type for checking how to intersect with this
    this.shape = "Circle";
    if(paddle){
	    this.paddle = true;
    }else{
	    this.paddle = false;
    }
    // circle properties
    if (radius){
	    this.radius = radius;
    }else{
	    this.radius = 1;
    }


    // returns true if this collider intersects with the other collider, else false
    this.intersects = function(col) {
        if (col.shape == "Rectangle") {
            var points = col.getPoints();
            var origin = [this.gameObject.position[0], this.gameObject.position[2]];
	    // if hitting the top and bottom of the ball
	    if( (lineIntersectsCircle(points[0], points[1], origin, this.radius) ||
	         lineIntersectsCircle(points[2], points[3], origin, this.radius) )
		&&
		(lineIntersectsCircle(points[1], points[2], origin, this.radius) ||
	     	 lineIntersectsCircle(points[3], points[0], origin, this.radius)  )

	      ){
		this.gameObject.xdir = this.gameObject.xdir * -1;
		this.gameObject.ydir = this.gameObject.ydir * -1;
		return true;
	      }
	    //if side intersection
	    if(  lineIntersectsCircle(points[0], points[1], origin, this.radius) ||
	         lineIntersectsCircle(points[2], points[3], origin, this.radius) ){
		this.gameObject.xdir = this.gameObject.xdir * -1;
		if(!paddle){
			if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.topfifths ||
			    col.gameObject.position[2] < this.gameObject.position[2] - breakout.topfifths){
				this.gameObject.ySpeed = breakout.extremeBounce;
			}else if (col.gameObject.position[2] > this.gameObject.position[2] + breakout.midfifths ||
			          col.gameObject.position[2] < this.gameObject.position[2] - breakout.midfifths){
				this.gameObject.ySpeed = breakout.normalBounce;
			}
			
		}
		return true;
	    }
	    //if top/bot intersection
	    if( lineIntersectsCircle(points[1], points[2], origin, this.radius) ||
	     	lineIntersectsCircle(points[3], points[0], origin, this.radius)  ){
			this.gameObject.ydir = this.gameObject.ydir * -1;
			return true;
	    }
	    

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



