uniform mat4 uMVMatrix;    // A constant representing the modelview matrix. Used for calculating lights/shading
uniform mat4 uMVPMatrix;   // A constant representing the combined modelview/projection matrix. We use this for positioning

uniform vec3 uLightPos;    // light position

attribute vec4 aPosition;  // Per-vertex position information we will pass in
attribute vec3 aNormal;    // Per-vertex normal information we will pass in.

// material settings from the GameObject
attribute vec4 aAmbient;   // Per-vertex ambient color
attribute vec4 aDiffuse;   // Per-vertex diffuse color
attribute vec4 aSpecular;  // Per-vertex specular color
attribute float aShininess;// Per-vertex shininess

// all output variables:
varying vec4 oPosition;
varying vec3 oNormal;
varying vec3 oLightPos;
varying vec4 oAmbient;
varying vec4 oDiffuse;
varying vec4 oSpecular;
varying float oShininess;


void main() {
        // precalculate the world space position
        vec4 pos = uMVPMatrix * aPosition;
        oPosition = pos;
        gl_Position = pos;

        // pass through the normal, color, and light position to the fragment shader
        oNormal = aNormal;
        oLightPos = uLightPos;
        oAmbient = aAmbient;
        oDiffuse = aDiffuse;
        oSpecular = aSpecular;
        oShininess = aShininess;
}
