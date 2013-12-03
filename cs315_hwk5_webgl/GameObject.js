

function GameObject() {
	this.position = [0, 0, 0];
	this.rotation = [0, 0, 0];
	this.scale = [1, 1, 1];
	this.model = null;

	this.toString = function() {
		return "<GameObject pos=[" + this.position +
			"], rot=[" + this.rotation +
			"], scale=[" + this.scale + "]>";
	}

	this.draw = function() {
		console.log("" + this);
	}
}


