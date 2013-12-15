uniform mat4 uMVMatrix;    // A constant representing the modelview matrix. Used for calculating lights/shading
uniform mat4 uMVPMatrix;   // A constant representing the combined modelview/projection matrix. We use this for positioning

uniform vec3 uLightPos;    // light position

attribute vec4 aPosition;  // Per-vertex position information we will pass in
attribute vec3 aNormal;    // Per-vertex normal information we will pass in.
attribute vec4 aColor;     // Per-vertex color information we will pass in.

varying vec4 position;     // out : the ultimate color of the vertex
varying vec4 color;
varying vec3 normal;
varying vec3 lightPos;


void main() {
	// position modified by modelview
	vec3 modelViewVertex = vec3(uMVMatrix * aPosition);

	// normal modified by modelview
	vec3 modelViewNormal = normalize(vec3(uMVMatrix * vec4(aNormal, 0.0)));

	// the normalized vector between the light and the vertex
	vec3 lightVector = normalize(uLightPos - modelViewVertex);

	// the amount of diffuse light to give (based on angle between light and normal)
	float diffuse = max(dot(modelViewNormal, lightVector), 0.3);

	// scale the color by the light factor and set to output. Note that we need to be careful not to scale the homogenous coordinate!
	color = vec4(vec3(aColor) * diffuse, 1.0);

	// pass the position to the fragment shader
	position = aPosition;

	// pass the light position to the fragment shader
	lightPos = uLightPos;
	//lightDir = normalize(uLightPos - (aPosition.xyz / aPosition.w));
	
	// pass the normal to the fragment shader
	normal = modelViewNormal.xyz;

	// for drawing points
	gl_PointSize = 3.0;

	// gl_Position is built-in variable for the transformed vertex's position.
	gl_Position = uMVPMatrix * aPosition;
}