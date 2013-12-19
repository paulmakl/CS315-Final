precision mediump float;  // don't need high precision

varying mat4 oNormalMatrix;
varying vec4 oPosition;
varying vec3 oNormal;
varying vec3 oLightDir;
// material settings:
varying vec4 oAmbient;
varying vec4 oDiffuse;
varying vec4 oSpecular;
varying float oShininess;


void main() {
	// finalcolor starts with ambient
	vec4 final = oAmbient;

	// rotate normal if object is rotated
	vec3 normal = normalize(mat3(oNormalMatrix) * oNormal);

    // get the ndotl value
	float ndotl = max(0.0, dot(normal, oLightDir));

	// =========
	//  DIFFUSE
	// =========
	vec4 diffuse = oDiffuse * ndotl;
	final += diffuse;

	// ==========
	//  SPECULAR
	// ==========
	vec3 vReflection = normalize(reflect(-oLightDir, normal));
	float spec = max(0.0, dot(normal, vReflection));

	if (ndotl > 0.0) {
		float fSpec = pow(spec, oShininess);
		final += fSpec * oSpecular;
	}

	// final output
	gl_FragColor = final;
}

