
// WebGL global
var gl;


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
        gl = null;
    }
}

