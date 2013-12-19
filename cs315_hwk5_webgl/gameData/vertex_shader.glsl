uniform mat4 uMVMatrix;    // A constant representing the modelview matrix. Used for calculating lights/shading
uniform mat4 uMVPMatrix;   // A constant representing the combined modelview/projection matrix. We use this for positioning
uniform mat4 uNormalMatrix;

uniform vec3 uLightPos;    // light position

attribute vec4 aPosition;  // Per-vertex position information we will pass in
attribute vec3 aNormal;    // Per-vertex normal information we will pass in.

// material settings from the GameObject
attribute vec4 aAmbient;   // Per-vertex ambient color
attribute vec4 aDiffuse;   // Per-vertex diffuse color
attribute vec4 aSpecular;  // Per-vertex specular color
attribute float aShininess;// Per-vertex shininess

// all output variables:
varying mat4 oNormalMatrix;
varying vec4 oPosition;
varying vec3 oNormal;
varying vec3 oLightDir;
varying vec4 oAmbient;
varying vec4 oDiffuse;
varying vec4 oSpecular;
varying float oShininess;


void main() {
    // precalculate the world space position
    oPosition = uMVMatrix * aPosition;
    gl_Position = uMVPMatrix * aPosition;

    oNormalMatrix = uNormalMatrix;

    // figure out the light direction in relation to world space
    oLightDir = normalize(uLightPos - oPosition.xyz);

    oNormal = aNormal;

    // material settings passthrough
    oAmbient = aAmbient;
    oDiffuse = aDiffuse;
    oSpecular = aSpecular;
    oShininess = aShininess;
}
