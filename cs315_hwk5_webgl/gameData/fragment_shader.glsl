precision mediump float;  // don't need high precision

const vec4 ambientColor = vec4(0.05, 0.05, 0.05, 1.0);
const float shininess = 32.0;

varying vec4 oPosition;
varying vec4 oColor;
varying vec3 oNormal;
varying vec3 oLightPos;

void main() {
	// finalcolor starts with ambient
	vec4 final = ambientColor;

	// prenormalize the normal
	vec3 normal = normalize(oNormal);

	// figure out the light direction in relation to world space
    vec3 lightDir = normalize(oLightPos - (oPosition.xyz / oPosition.w));

    // get the ndotl value
	float ndotl = max(0.0, dot(normal, lightDir));

	// =========
	//  DIFFUSE
	// =========
	vec4 diffuse = oColor * ndotl;
	final += diffuse;

	// ==========
	//  SPECULAR
	// ==========
	vec3 vReflection = normalize(reflect(-lightDir, normal));
	float spec = max(0.0, dot(normal, vReflection));

	if (ndotl > 0.0) {
		float fSpec = pow(spec, 32.0);
		final += fSpec;
	}

	// final output
	gl_FragColor = final;
}

