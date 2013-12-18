uniform mat4 uMVMatrix; 	
uniform mat4 uMVPMatrix;	
attribute vec4 aPosition;	
attribute vec3 aNormal;		
attribute vec4 aColor;		
varying vec4 vColor; 		
vec3 lightPos = vec3(0.0,0.0,3.0); //the position of the light
void main() {
  vec3 modelViewVertex = vec3(uMVMatrix * aPosition); 			
  vec3 modelViewNormal = vec3(uMVMatrix * vec4(aNormal, 0.0));
  vec3 lightVector = normalize(lightPos - modelViewVertex);		
  float diffuse = max(dot(modelViewNormal, lightVector), 0.1);	
  vColor = aColor * diffuse; 									
  gl_PointSize = 3.0;	//for drawing points
  gl_Position = uMVPMatrix * aPosition; position.
}
