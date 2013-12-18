precision mediump float;  // don't need high precision

varying vec4 oPosition;
varying vec3 oNormal;
varying vec3 oLightPos;
// material settings:
varying vec4 oAmbient;
varying vec4 oDiffuse;
varying vec4 oSpecular;
varying float oShininess;


void main() {
	// finalcolor starts with ambient
	vec4 final = oAmbient;

	// prenormalize the normal
	vec3 normal = normalize(oNormal);

	// figure out the light direction in relation to world space
    vec3 lightDir = normalize(oLightPos - (oPosition.xyz / oPosition.w));

    // get the ndotl value
	float ndotl = max(0.0, dot(normal, lightDir));

	// =========
	//  DIFFUSE
	// =========
	vec4 diffuse = oDiffuse * ndotl;
	final += diffuse;

	// ==========
	//  SPECULAR
	// ==========
	vec3 vReflection = normalize(reflect(-lightDir, normal));
	float spec = max(0.0, dot(normal, vReflection));

	if (ndotl > 0.0) {
		float fSpec = pow(spec, oShininess);
		final += fSpec;
	}

	// final output
	gl_FragColor = final;
}

