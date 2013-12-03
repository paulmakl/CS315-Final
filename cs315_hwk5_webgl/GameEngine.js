
// globals:
var engine;
var gl;


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
	this.mViewMatrix = mat4.create();
	this.mProjectionMatrix = mat4.create();
	this.mMVMatrix = mat4.create();
	this.mMVPMatrix = mat4.create();

	//attribute handles
	this.mMVPMatrixHandle = null;
	this.mMVMatrixHandle = null;
	this.mPositionHandle = null;
	this.mColorHandle = null;
	this.mNormalHandle = null;

	this.mMeshes = {};

	/*
	 * Main GameEngine setup
	 */
	this.init = function() {
		// initialize shaders
		this.shaderProgramHandle = this.initShaders(VERTEX_SHADER, FRAGMENT_SHADER,
			["aPosition", "aColor", "aNormal"]);
		
		if (this.shaderProgramHandle < 0) {
			alert('Unable to initialize shaders.');
			return;
		}

		// basic params
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		// viewport setup
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);

		// SET UP VIEW MATRIX
		var eye = vec3.fromValues(0.0, 0.0, 10.0);
		var look = vec3.fromValues(0.0, 0.0, 0.0);
		var up = vec3.fromValues(0.0, 1.0, 0.0);
		mat4.lookAt(this.mViewMatrix, eye, look, up);

		// SET UP PROJECTION MATRIX
		var ratio = this.canvas.clientWidth / this.canvas.clientHeight;
		var near = 1.0;
		var far = 20.0;
		mat4.perspective(this.mProjectionMatrix, 45.0, ratio, near, far);


		// Load model
		this.log("loading models");

		var meshes = {
			'cube': new obj_loader.Mesh(CUBE_OBJ),
			'teapot': new obj_loader.Mesh(TEAPOT_OBJ),
		};

		this.initMeshes(meshes);

		this.log("end of init");
	}


	/*
	 * Set up meshes
	 */
	this.initMeshes = function(meshes) {
		this.mMeshes = meshes;
		obj_utils.initMeshBuffers(gl, this.mMeshes.teapot); 
	}


	/*
	 * Draws one frame
	 */
	this.drawFrame = function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// rotate based on time
		var time = Date.now() % 10000;
		var angleInDegrees = (360.0 / 10000.0) * time;
		var angleInRadians = angleInDegrees / 57.2957795;
		var rotationAxis = vec3.fromValues(0.0, 1.0, 0.0);

		gl.useProgram(this.shaderProgramHandle);

		// grab handles
		this.mMVPMatrixHandle = gl.getUniformLocation(this.shaderProgramHandle, "uMVPMatrix");
		this.mMVMatrixHandle = gl.getUniformLocation(this.shaderProgramHandle, "uMVMatrix");
		this.mPositionHandle = gl.getAttribLocation(this.shaderProgramHandle, "aPosition");
		this.mColorHandle = gl.getAttribLocation(this.shaderProgramHandle, "aColor");
		this.mNormalHandle = gl.getAttribLocation(this.shaderProgramHandle, "aNormal");

		// manipulate the model matrix
		mat4.identity(this.mModelMatrix);
		mat4.rotate(this.mModelMatrix, this.mModelMatrix, angleInRadians, rotationAxis);
		mat4.scale(this.mModelMatrix, this.mModelMatrix, vec3.fromValues(0.3, 0.3, 0.3));

		//this.log("in draw frame");
		
		if (!$.isEmptyObject(this.mMeshes)) {
			this.drawMesh(this.mMeshes.teapot);
		}
		else {
			this.log("mMeshes not yet loaded");
		}
		
		//this.log("end of drawFrame");

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
	this.drawMesh = function(mesh) {
		mat4.mul(this.mMVMatrix, this.mViewMatrix, this.mModelMatrix);
		mat4.mul(this.mMVPMatrix, this.mProjectionMatrix, this.mMVMatrix);

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
		var color = vec4.fromValues(0.8, 0.2, 0.2, 1.0);
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
 * Helper function to init WebGL
 */
function WebGLSetup(canvas) {
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
	catch (e) {}
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
		return;
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
