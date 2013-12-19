"use strict";

// engine global
var engine;


function GameEngine(canvasNode) {
	var self = this; // hang on to a reference to 'this' in case javascript steps on it

	this.debug = true;

	this.ratio = 680 / 1350; // screen aspect ratio (h / w)

	this.mPositionDataSize = 3;
	this.mNormalDataSize = 3;

	//CORE VARIABLES
	this.canvas = canvasNode;
	this.shaderProgramHandle = null;

	//model stuff
	this.cubePositionBuffer = null;
	this.cubeNormalBuffer = null;

	//transform/projections
	this.mModelMatrix = mat4.create();
	this.mMVMatrix = mat4.create();
	this.mMVPMatrix = mat4.create();
	this.mNormalMatrix = mat4.create();
	// mProjectionMatrix and mViewMatrix is managed by the camera now, get it
	// with this.camera.getProjectionMatrix() and this.camera.getViewMatrix()

	//attribute handles
	this.mMVPMatrixHandle = null;
	this.mMVMatrixHandle = null;
	this.mNormalMatrixHandle = null;
	this.mLightPosHandle = null;
	this.mPositionHandle = null;
	this.mNormalHandle = null;
	// material attributes
	this.mAmbientHandle = null;
	this.mDiffuseHandle = null;
	this.mSpecularHandle = null;
	this.mShininessHandle = null;

	// timing variables
	this.lastFrameTime = 0;
	this.timeSinceLastFrame = 0;
	this.resizeTimer = null;

	// objects that need to get their update() methods called every frame
	this.updateObjects = [];

	// lights
	this.light = null;

	// camera object
	this.camera = null;

	// all GameObjects in the scene
	this.gameObjects = [];

	// all loaded meshes
	this.mMeshes = {};

	/*
	 * Main GameEngine setup
	 */
	this.init = function() {
		if (typeof gl == 'undefined') {
			addErrorMessage("Couldn't get a WebGL context to work with.");
			return;
		}

		// initialize shaders
		this.shaderProgramHandle = this.initShaders(DATA['vertex_shader.glsl'], DATA['fragment_shader.glsl'],
			["aPosition", "aColor", "aNormal"]);
		
		if (this.shaderProgramHandle < 0) {
			addErrorMessage('Unable to initialize shaders.');
			return;
		}

		// basic params
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		// use the aspect ratio to calculate the correct height
		var height = this.canvas.width * this.ratio;
		this.canvas.height = height;

		// viewport setup
		gl.viewport(0, 0, this.canvas.width, height);

		// set up camera
		this.camera = new Camera(this);
		this.camera.recalculate(); // set up initial view and proj matrices

		// default light
		this.light = new Light();
		this.light.position = [0, 0, 3];

		// Load models
		this.initMeshes();

		// set up a window-resize event callback to adjust the viewport if the window size changes
		$(window).resize(function() {
			clearTimeout(self.resizeTimer);
			self.resizeTimer = setTimeout(function() {
				var w = document.body.clientWidth;
				var h = w * self.ratio; // recalculate to the height for the new width

				// tell the canvas:
				var canvas = $('#glcanvas')[0];
				canvas.width = w;
				canvas.height = h;

				// tell the viewport:
				gl.viewport(0, 0, w, h);

				// tell the camera:
				self.camera.recalculate(w, h);
			}, 50);
		});

	};


	/*
	 * Set up meshes
	 */
	this.initMeshes = function() {
		this.mMeshes = {};

		// go through all data files
		var allDataFiles = DATA.getFileList();
		for (var i = allDataFiles.length - 1; i >= 0; i--) {
			// if the data file has an obj extension
			if (endsWith(allDataFiles[i], ".obj")) {
				// cut off the file extension for the dict key
				var modelName = allDataFiles[i].slice(0, -4);
				// use the obj_loader on the data and store it in this.mMeshes
				this.mMeshes[modelName] = new obj_loader.Mesh(DATA[allDataFiles[i]]);
			}
		};

		// init all the mesh buffers
		for (var key in this.mMeshes) {
			if (this.mMeshes.hasOwnProperty(key)) {
				obj_utils.initMeshBuffers(gl, this.mMeshes[key]);
			}
		}
	}


	/*
	 * Add a GameObject to the scene
	 */
	this.addUpdateObject = function(obj) {
		this.updateObjects.push(obj);
	}


	/*
	 * Add a GameObject to the scene
	 */
	this.addGameObject = function(obj) {
		this.gameObjects.push(obj);
	}
	/*
	 * Remove a GameObject from the scene
	 */
	this.removeGameObject = function(obj) {
		if(obj){
			var index = this.gameObjects.indexOf(obj);
			this.gameObjects.splice(index, 1);
		}
	}

	/*
	 * Add a Light to the scene
	 */
	this.addLight = function(light) {
		//this.lights.push(light);
		this.light = light;
	}


	/*
	 * Draws one frame
	 */
	this.drawFrame = function() {
		var frameStartTime = Date.now() * 0.001;
		this.timeSinceLastFrame = frameStartTime - this.lastFrameTime;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(this.shaderProgramHandle);

		// grab handles
		this.mMVPMatrixHandle = gl.getUniformLocation(this.shaderProgramHandle, "uMVPMatrix");
		this.mMVMatrixHandle = gl.getUniformLocation(this.shaderProgramHandle, "uMVMatrix");
		this.mNormalMatrixHandle = gl.getUniformLocation(this.shaderProgramHandle, "uNormalMatrix");
		this.mLightPosHandle = gl.getUniformLocation(this.shaderProgramHandle, "uLightPos");
		this.mPositionHandle = gl.getAttribLocation(this.shaderProgramHandle, "aPosition");
		this.mNormalHandle = gl.getAttribLocation(this.shaderProgramHandle, "aNormal");
		// material setting handles
		this.mAmbientHandle = gl.getAttribLocation(this.shaderProgramHandle, "aAmbient");
		this.mDiffuseHandle = gl.getAttribLocation(this.shaderProgramHandle, "aDiffuse");
		this.mSpecularHandle = gl.getAttribLocation(this.shaderProgramHandle, "aSpecular");
		this.mShininessHandle = gl.getAttribLocation(this.shaderProgramHandle, "aShininess");

		// update all objects that requested update notifications
		for (var i = this.updateObjects.length - 1; i >= 0; i--) {
			this.updateObjects[i].update(this.timeSinceLastFrame);
		};

		//this.log("in draw frame");

		for (var i = this.gameObjects.length - 1; i >= 0; i--) {
			var obj = this.gameObjects[i];
			// manipulate the model matrix
			mat4.identity(this.mModelMatrix);
			mat4.translate(this.mModelMatrix, this.mModelMatrix, obj.position);
			mat4.rotate(this.mModelMatrix, this.mModelMatrix, deg2rad(obj.rotation[0]), UNIT_X);
			mat4.rotate(this.mModelMatrix, this.mModelMatrix, deg2rad(obj.rotation[1]), UNIT_Y);
			mat4.rotate(this.mModelMatrix, this.mModelMatrix, deg2rad(obj.rotation[2]), UNIT_Z);
			mat4.scale(this.mModelMatrix, this.mModelMatrix, obj.scale);
			this.drawMesh(this.mMeshes[obj.mesh], obj.ambient, obj.diffuse, obj.specular, obj.shininess);
		};

		//this.log("end of drawFrame");

		this.lastFrameTime = frameStartTime;

		// we need to pass a function into requestAnimationFrame, so save a ref to the
		// GameEngine object first. Required because "this" gets redefined inside the
		// anonymous function
		var engine = this;
		requestAnimationFrame(function() {
			engine.drawFrame()
		});
	}


	/*
	 * draws a 1x1x1 cube with the current transformation
	 */
	this.drawMesh = function(mesh, ambient, diffuse, specular, shininess) {
		mat4.mul(this.mMVMatrix, this.camera.getViewMatrix(), this.mModelMatrix);
		mat4.mul(this.mMVPMatrix, this.camera.getProjectionMatrix(), this.mMVMatrix);

		// calculate a matrix for rotating the normal in the shader
		mat4.invert(this.mNormalMatrix, this.mModelMatrix);
		mat4.transpose(this.mNormalMatrix, this.mNormalMatrix);

		// Pass in the combined matrix.
		gl.uniformMatrix4fv(this.mMVMatrixHandle, false, this.mMVMatrix);
		gl.uniformMatrix4fv(this.mMVPMatrixHandle, false, this.mMVPMatrix);
		gl.uniformMatrix4fv(this.mNormalMatrixHandle, false, this.mNormalMatrix);

		// Pass in light positions
		gl.uniform3f(this.mLightPosHandle, this.light.position[0], this.light.position[1], this.light.position[2]);

		// pass in the positions
		gl.enableVertexAttribArray(this.mPositionHandle);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
		gl.vertexAttribPointer(this.mPositionHandle, this.mPositionDataSize, gl.FLOAT, false, 0, 0);

		// pass in the normals
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
		gl.vertexAttribPointer(this.mNormalHandle, this.mNormalDataSize, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.mNormalHandle);

		// pass in the material settings
		gl.vertexAttrib4fv(this.mAmbientHandle, vec4.fromValues(ambient[0], ambient[1], ambient[2], 1.0));
		gl.vertexAttrib4fv(this.mDiffuseHandle, vec4.fromValues(diffuse[0], diffuse[1], diffuse[2], 1.0));
		gl.vertexAttrib4fv(this.mSpecularHandle, vec4.fromValues(specular[0], specular[1], specular[2], 1.0));
		gl.vertexAttrib1fv(this.mShininessHandle, [shininess]);

		// draw as an indexed buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
		gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}


	/*
	 * draws a 1x1x1 cube with the current transformation
	 */
	this.initShaders = function(vertexCode, fragmentCode, attributes) {
		var vertexShaderHandle = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShaderHandle, vertexCode);
		gl.compileShader(vertexShaderHandle);
		if(!gl.getShaderParameter(vertexShaderHandle,gl.COMPILE_STATUS))
		{
			this.log('Vertex shader failed to compile: '+gl.getShaderInfoLog(vertexShaderHandle));
			return -1;
		}

		var fragmentShaderHandle = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShaderHandle, fragmentCode);
		gl.compileShader(fragmentShaderHandle);
		if(!gl.getShaderParameter(fragmentShaderHandle,gl.COMPILE_STATUS))
		{
			this.log('Fragment shader failed to compile: '+gl.getShaderInfoLog(fragmentShaderHandle));
			return -1;
		}

		var shaderProgramHandle = gl.createProgram();
		gl.attachShader(shaderProgramHandle,vertexShaderHandle);
		gl.attachShader(shaderProgramHandle,fragmentShaderHandle);

		// process attributes
		if (attributes) {
			for (var i = 0; i < attributes.length; i++) {
				gl.bindAttribLocation(shaderProgramHandle, i, attributes[i]);
			}
		}
		gl.linkProgram(shaderProgramHandle);
		if(!gl.getProgramParameter(shaderProgramHandle, gl.LINK_STATUS))
		{
			this.log('Shader program failed to link: '+gl.getProgramInfoLog(shaderProgramHandle));
			return -1;
		}

		return shaderProgramHandle;
	}


	this.log = function(text) {
		if (this.debug == true) {
			console.log(text);
		}
	}

}



/*
 * Helper function to init the GameEngine object
 */
function GameEngineSetup(canvas) {
	engine = new GameEngine(canvas);
	engine.init();      // initialize everything
	engine.drawFrame(); // start drawing!
}



/*
 * Helper function to test if a string ends with a specific substring
 */
function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

