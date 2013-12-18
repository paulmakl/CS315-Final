"use strict";

function GameObject(name, mesh, x, y) {
	this.name = name;
	this.mesh = mesh;
	var xp = x || 0;
	var yp = y || 0;
	this.position = [xp, yp, 0];
	this.rotation = [0, 0, 0]; // degrees
	this.scale = [1, 1, 1];
	this.collider = null;

	// material settings
	this.ambient = [0.05, 0.05, 0.05];
	this.diffuse = [1, 0, 0];
	this.specular = [1, 0, 0];
	this.shininess = 60;


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
