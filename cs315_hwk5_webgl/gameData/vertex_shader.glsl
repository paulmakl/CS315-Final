uniform mat4 uMVMatrix;    // A constant representing the modelview matrix. Used for calculating lights/shading
uniform mat4 uMVPMatrix;   // A constant representing the combined modelview/projection matrix. We use this for positioning

uniform vec3 uLightPos;    // light position

attribute vec4 aPosition;  // Per-vertex position information we will pass in
attribute vec3 aNormal;    // Per-vertex normal information we will pass in.
attribute vec4 aColor;     // Per-vertex color information we will pass in.

// all output variables:
varying vec4 oPosition;
varying vec4 oColor;        // the ultimate color of the vertex
varying vec3 oNormal;
varying vec3 oLightPos;


void main() {
	// precalculate the world space position
	vec4 pos = uMVPMatrix * aPosition;
	oPosition = pos;
	gl_Position = pos;

	// pass through the normal, color, and light position to the fragment shader
	oNormal = aNormal;
	oColor = aColor;
	oLightPos = uLightPos;
}

