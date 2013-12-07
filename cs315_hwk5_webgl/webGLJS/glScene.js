var vertexShaderCode =
  "uniform mat4 uMVMatrix;" +   // A constant representing the modelview matrix. Used for calculating lights/shading
  "uniform mat4 uMVPMatrix;" +  // A constant representing the combined modelview/projection matrix. We use this for positioning
  "attribute vec4 aPosition;" + // Per-vertex position information we will pass in
  "attribute vec3 aNormal;" +   // Per-vertex normal information we will pass in.
  "attribute vec4 aColor;" +    // Per-vertex color information we will pass in.
  "varying vec4 vColor;"  +     //out : the ultimate color of the vertex
  "vec3 lightPos = vec3(0.0,0.0,3.0);" + //the position of the light
  "void main() {" +
  "  vec3 modelViewVertex = vec3(uMVMatrix * aPosition);" +       //position modified by modelview
  "  vec3 modelViewNormal = normalize(vec3(uMVMatrix * vec4(aNormal, 0.0)));" + //normal modified by modelview
  "  vec3 lightVector = normalize(lightPos - modelViewVertex);" +   //the normalized vector between the light and the vertex
  "  float diffuse = max(dot(modelViewNormal, lightVector), 0.3);" +  //the amount of diffuse light to give (based on angle between light and normal)
  "  vColor = vec4(vec3(aColor) * diffuse, 1.0);"+            //scale the color by the light factor and set to output. Note that we need to be careful not to scale the homogenous coordinate!
  "  gl_PointSize = 3.0;" +   //for drawing points
  "  gl_Position = uMVPMatrix * aPosition;" + //gl_Position is built-in variable for the transformed vertex's position.
  "}";

var fragmentShaderCode =
  "precision mediump float;" + //don't need high precision
  "varying vec4 vColor;" + //color for the fragment
  "void main() {" +
  "  gl_FragColor = vColor;" + //gl_fragColor is built-in variable for color of fragment
  "}";


var mPositionDataSize = 3;
var mNormalDataSize = 3;


//CORE VARIABLES
var canvas;
var gl;
var shaderProgramHandle;

//model stuff
var cubePositionBuffer;
var cubeNormalBuffer;

//transform/projections
var mModelMatrix = mat4.create();
var mViewMatrix = mat4.create();
var mProjectionMatrix = mat4.create();
var mMVMatrix = mat4.create();
var mMVPMatrix = mat4.create();

//attribute handles
var mMVPMatrixHandle;
var mMVMatrixHandle;
var mPositionHandle;
var mColorHandle;
var mNormalHandle;

var mMeshes = {};

function init(){
  //initialize canvas and webgl
  canvas = $('#glcanvas')[0]; //first element from jquery selector
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(e) {}
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }

  //initialize shaders
  shaderProgramHandle = initShaders(vertexShaderCode, fragmentShaderCode, ["aPosition","aColor","aNormal"]);
  if(shaderProgramHandle < 0)
  {
    alert('Unable to initialize shaders.');
    return;
  }

  //basic params
  gl.clearColor(0.0,  0.0,  0.0,  1.0);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  //viewport setup
  gl.viewport(0, 0, canvas.width, canvas.height);

  //SET UP VIEW MATRIX
  var eye = vec3.fromValues(0.0, 0.0, 10.0);
  var look = vec3.fromValues(0.0, 0.0, 0.0);
  var up = vec3.fromValues(0.0, 1.0, 0.0);
  mat4.lookAt(mViewMatrix, eye, look, up);

  //SET UP PROJECTION MATRIX
  var ratio = canvas.clientWidth / canvas.clientHeight;
  var near = 1.0;
  var far = 20.0;
  mat4.perspective(mProjectionMatrix, 45.0, ratio, near, far);


  //Load model
  console.log("load models");
    obj_utils.downloadMeshes(
        {
            'teapot': 'teapot.obj'
        },
        initMeshes //call the initMeshes method once done
    );

  // console.log("end of init");
}

function initMeshes( downloadedMeshes ){
  mMeshes = downloadedMeshes;
  //console.log(meshes);

  obj_utils.initMeshBuffers( gl, mMeshes.teapot ); //helper method to create buffers
  //above executes code similar to following:
  //    modelPositionBuffer = gl.createBuffer();
  //    gl.bindBuffer(gl.ARRAY_BUFFER, meshPositionBuffer);
  //    gl.bufferData(gl.ARRAY_BUFFER, meshPositionData, gl.STATIC_DRAW);
  // 

  // console.log("in init");
  // console.log(mMeshes);
}

function drawFrame()
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //rotate based on time
  var time = Date.now() % 10000;
  var angleInDegrees = (360.0 / 10000.0) * time;
  var angleInRadians = angleInDegrees / 57.2957795;
  var rotationAxis = vec3.fromValues(0.0, 1.0, 0.0);

  gl.useProgram(shaderProgramHandle);

  //grab handles
  mMVPMatrixHandle = gl.getUniformLocation(shaderProgramHandle, "uMVPMatrix");
  mMVMatrixHandle = gl.getUniformLocation(shaderProgramHandle, "uMVMatrix");
  mPositionHandle = gl.getAttribLocation(shaderProgramHandle, "aPosition");
  mColorHandle = gl.getAttribLocation(shaderProgramHandle, "aColor");
  mNormalHandle = gl.getAttribLocation(shaderProgramHandle, "aNormal");

  //manipulate the model matrix
  mat4.identity(mModelMatrix);
  mat4.rotate(mModelMatrix, mModelMatrix, angleInRadians, rotationAxis);
  mat4.scale(mModelMatrix, mModelMatrix, vec3.fromValues(0.3,0.3,0.3));

  //console.log("in draw frame");
  //console.log(mMeshes);
  if(!$.isEmptyObject(mMeshes))
    drawMesh(mMeshes.teapot);
  else
    console.log("mMeshes not yet loaded");

  //console.log("end of drawFrame");
  requestAnimationFrame(drawFrame);
}

//draws a 1x1x1 cube with the current transformation
function drawMesh(mesh)
{
    mat4.mul(mMVMatrix, mViewMatrix, mModelMatrix);
    mat4.mul(mMVPMatrix, mProjectionMatrix, mMVMatrix);

    // Pass in the combined matrix.
    gl.uniformMatrix4fv(mMVMatrixHandle, false, mMVMatrix);
    gl.uniformMatrix4fv(mMVPMatrixHandle, false, mMVPMatrix);

    //pass in the positions
    gl.enableVertexAttribArray(mPositionHandle);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
    gl.vertexAttribPointer(mPositionHandle, mPositionDataSize, gl.FLOAT, false, 0, 0);

    //pass in the normals
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
    gl.vertexAttribPointer(mNormalHandle, mNormalDataSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(mNormalHandle);

    //specify the color
    var color = vec4.fromValues(0.8, 0.2, 0.2, 1.0);
    gl.vertexAttrib4fv(mColorHandle, color);

    //draw as an indexed buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function initShaders(vertexCode, fragmentCode, attributes){
  var vertexShaderHandle = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShaderHandle, vertexCode);
  gl.compileShader(vertexShaderHandle);
  if(!gl.getShaderParameter(vertexShaderHandle,gl.COMPILE_STATUS))
  {
    console.log('Vertex shader failed to compile: '+gl.getShaderInfoLog(vertexShaderHandle));
    return -1;
  }

  var fragmentShaderHandle = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShaderHandle, fragmentCode);
  gl.compileShader(fragmentShaderHandle);
  if(!gl.getShaderParameter(fragmentShaderHandle,gl.COMPILE_STATUS))
  {
    console.log('Fragment shader failed to compile: '+gl.getShaderInfoLog(fragmentShaderHandle));
    return -1;
  }

  var shaderProgramHandle = gl.createProgram();
  gl.attachShader(shaderProgramHandle,vertexShaderHandle);
  gl.attachShader(shaderProgramHandle,fragmentShaderHandle);

  //process attributes
  if (attributes) {
    for (i = 0; i < attributes.length; i++) {
      gl.bindAttribLocation(shaderProgramHandle, i, attributes[i]);
    }
  }
  gl.linkProgram(shaderProgramHandle);
  if(!gl.getProgramParameter(shaderProgramHandle, gl.LINK_STATUS))
  {
    console.log('Shader program failed to link: '+gl.getProgramInfoLog(shaderProgramHandle));
    return -1;
  }

  return shaderProgramHandle;
}

$(document).ready(function(){
  init(); //initialize everything
  drawFrame(); //start drawing!
});