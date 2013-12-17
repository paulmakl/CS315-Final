/*
    See docs.txt for the things required in a collider class.
*/


function RectangleCollider(obj, width, height) {
    // the parent GameObject
    this.gameObject = obj;
    // shape type for checking how to intersect with this
    this.shape = "Rectangle";
    this.width = width;
    this.height = height;
    // rectangle properties [w, h]
    if(width && height){
    	this.rect = [width, height];
    }else{
	this.rect = [1, 1];
    }


    // returns true if this collider intersects with the other collider, else false
    this.intersects = function(col) {
        if (col.shape == "Rectangle") {

        }
        else if (col.shape == "Circle") {

        }
    }


    this.getPoints = function() {
        var x = this.gameObject.position[0];
        var y = this.gameObject.position[2]; // 3d to 2d, so z becomes y because we're ignoring height
        var w = this.rect[0];
        var h = this.rect[1];
        return [
            [ x - (w * 0.5), y + (h * 0.5) ],
            [ x - (w * 0.5), y - (h * 0.5) ],
            [ x + (w * 0.5), y - (h * 0.5) ],
            [ x + (w * 0.5), y + (h * 0.5) ],
        ];
    }


    this.toString = function() {
        return "<RectangleCollider rect=[" + this.rect + "]>";
    }
}



