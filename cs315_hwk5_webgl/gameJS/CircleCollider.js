/*
    See docs.txt for the things required in a collider class.
*/


function CircleCollider(obj) {
    // the parent GameObject
    this.gameObject = obj;

    // shape type for checking how to intersect with this
    this.shape = "Circle";

    // circle properties
    this.radius = 1;


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

        }
    }


    this.toString = function() {
        return "<CircleCollider radius=[" + this.radius + "]>";
    }
}



