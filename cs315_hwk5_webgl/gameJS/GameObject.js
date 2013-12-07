

function GameObject(name, mesh) {
	this.name = name;
	this.mesh = mesh;
	this.position = [0, 0, 0];
	this.rotation = [0, 0, 0]; // degrees
	this.scale = [1, 1, 1];
	this.color = [1, 0, 0];
	this.collider = null;


	// GameObjects can be added to the engine's updateObject list.
	// This would only be used by subclasses
	this.update = function(timeSinceLastFrame) {

	}


	this.toString = function() {
		return "<GameObject name=" + this.name +
			", mesh=" + this.mesh +
			", pos=[" + this.position +
			"], rot=[" + this.rotation +
			"], scale=[" + this.scale + "]>";
	}
}


