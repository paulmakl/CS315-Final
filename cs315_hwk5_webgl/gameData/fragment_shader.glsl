precision mediump float;  // don't need high precision

vec4 ambientColor = vec4(0.05, 0.05, 0.05, 1.0);

varying vec4 position;
varying vec4 color;
varying vec3 normal;
varying vec3 lightPos;

void main() {
    vec3 lightDir = normalize(lightPos - (position.xyz / position.w));

	float diff = max(0.0, dot(normalize(normal), normalize(lightDir)));
	gl_FragColor = diff * color;
	gl_FragColor += ambientColor;
	vec3 vReflection = normalize(reflect(-normalize(lightDir),normalize(normal)));
	float spec = max(0.0, dot(normalize(normal), vReflection));

	if (diff != 0.0) {
		float fSpec = pow(spec, 32.0);
		gl_FragColor.rgb += vec3(fSpec, fSpec, fSpec);
	}
}
