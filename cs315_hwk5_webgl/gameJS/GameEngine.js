
// engine global
var engine;


function GameEngine(canvasNode) {
	this.debug = true;

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
	// mProjectionMatrix and mViewMatrix is managed by the camera now, get it
	// with this.camera.getProjectionMatrix() and this.camera.getViewMatrix()

	//attribute handles
	this.mMVPMatrixHandle = null;
	this.mMVMatrixHandle = null;
	this.mPositionHandle = null;
	this.mColorHandle = null;
	this.mNormalHandle = null;

	// timing variables
	this.lastFrameTime = 0;
	this.timeSinceLastFrame = 0;

	// objects that need to get their update() methods called every frame
	this.updateObjects = [];

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

		// viewport setup
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		// set up camera
		this.camera = new Camera(this);
		this.camera.recalculate(); // set up initial view and proj matrices

		// Load models
		this.initMeshes();
	}


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
		this.mPositionHandle = gl.getAttribLocation(this.shaderProgramHandle, "aPosition");
		this.mColorHandle = gl.getAttribLocation(this.shaderProgramHandle, "aColor");
		this.mNormalHandle = gl.getAttribLocation(this.shaderProgramHandle, "aNormal");

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
			this.drawMesh(this.mMeshes[obj.mesh], obj.color);
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
	this.drawMesh = function(mesh, color) {
		mat4.mul(this.mMVMatrix, this.camera.getViewMatrix(), this.mModelMatrix);
		mat4.mul(this.mMVPMatrix, this.camera.getProjectionMatrix(), this.mMVMatrix);

		// Pass in the combined matrix.
		gl.uniformMatrix4fv(this.mMVMatrixHandle, false, this.mMVMatrix);
		gl.uniformMatrix4fv(this.mMVPMatrixHandle, false, this.mMVPMatrix);

		// pass in the positions
		gl.enableVertexAttribArray(this.mPositionHandle);
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
		gl.vertexAttribPointer(this.mPositionHandle, this.mPositionDataSize, gl.FLOAT, false, 0, 0);

		// pass in the normals
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
		gl.vertexAttribPointer(this.mNormalHandle, this.mNormalDataSize, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.mNormalHandle);

		// specify the color
		var color = vec4.fromValues(color[0], color[1], color[2], 1.0);
		gl.vertexAttrib4fv(this.mColorHandle, color);

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
			for (i = 0; i < attributes.length; i++) {
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

