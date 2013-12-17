/*
    See docs.txt for the things required in a collider class.
*/


function CircleCollider(obj, radius) {
    // the parent GameObject
    this.gameObject = obj;

    // shape type for checking how to intersect with this
    this.shape = "Circle";

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
            return (
                pointInRectangle(origin, points[0], points[2]) ||
                lineIntersectsCircle(points[0], points[1], origin, this.radius) ||
                lineIntersectsCircle(points[1], points[2], origin, this.radius) ||
                lineIntersectsCircle(points[2], points[3], origin, this.radius) ||
                lineIntersectsCircle(points[3], points[0], origin, this.radius) 
            );
        }
        else if (col.shape == "Circle") {
		var incomingBall = col.getPoints();
		var thisBall = this.getPoints();
		var intersects = circlesIntersect(thisBall, incomingBall);
		if(intersects){
			col.gameObject.xSpeed = [this.gameObject.xSpeed, this.gameObject.xSpeed = col.gameObject.xSpeed][0];
			col.gameObject.ySpeed = [this.gameObject.ySpeed, this.gameObject.ySpeed = col.gameObject.ySpeed][0];
		}		 
		return circlesIntersect(thisBall, incomingBall);
        }
    }

    this.getPoints = function() {
	    x = this.gameObject.position[0];
	    y = this.gameObject.position[2];
	    return [x, y, this.radius];
    }
    this.toString = function() {
        return "<CircleCollider radius=[" + this.radius + "]>";
    }
}



