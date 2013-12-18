"use strict";

function Camera(gameEngine) {
    // keep a reference to the GameEngine object
    this.gameEngine = gameEngine;

    // matrices managed by the camera
    this.mViewMatrix = mat4.create();
    this.mProjectionMatrix = mat4.create();

    // camera config
    this.position = [0, 15, 0.1];
    this.lookAt = [0.0, 0.0, 0.0];
    this.up = [0.0, 1.0, 0.0];
    this.near = 1.0;
    this.far = 100.0;
    this.fovy = 45.0;


    // must call recalculate after making any changes to the camera config
    this.recalculate = function(width, height) {
        if (width == null) width = this.gameEngine.canvas.clientWidth;
        if (height == null) height = this.gameEngine.canvas.clientHeight;

        // view matrix:
        mat4.lookAt(this.mViewMatrix, this.position, this.lookAt, this.up);

        // projection matrix:
        var ratio = width / height;
        mat4.perspective(this.mProjectionMatrix, this.fovy, ratio, this.near, this.far);
    };


    this.getProjectionMatrix = function() {
        return this.mProjectionMatrix;
    };


    this.getViewMatrix = function() {
        return this.mViewMatrix;
    };

}


