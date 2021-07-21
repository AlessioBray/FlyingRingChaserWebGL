#version 300 es
precision highp float;

in vec3 fsNormal;
in vec4 fsPosition;
in vec4 fsCamera; 

//directional light A
uniform vec3 lightDirectionA; 
uniform vec3 lightColorA;

//directional light B
uniform vec3 lightDirectionB; 
uniform vec3 lightColorB;

const float PI = 3.14159265359;

const vec3 diffColor = vec3(0.24, 1, 0);

const vec3 materialDiffColor = vec3(0.24, 1, 0);
const vec3 emit = vec3(0);

const vec3 ambientLightCol = vec3(0.4, 0.4, 0.4); 
const vec3 ambientMat = vec3(1, 1, 1);

out vec4 outColor;

// Computes the OrenNayar diffuse
vec3 OrenNayarDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {

    float LdotN = clamp(dot(normalVec, lightDir), 0.0, 1.0);
	vec3 LDcol = lightCol * diffColor;
	// --> Lambert
	vec3 diffuseLambert = LDcol * LdotN;

    vec3 eyedirVec = normalize(vec3(fsCamera - fsPosition));
    float VdotN = max(0.0, dot(normalVec, eyedirVec));
	float theta_i = acos(LdotN);
	float theta_r = acos(VdotN);
	float alpha = max(theta_i, theta_r);
	float beta = min(min(theta_i, theta_r), 1.57);
	float sigma2 = PI / 2.0;                             /// between 0 and pi/2
	float A = 1.0 - 0.5 * sigma2 / (sigma2 + 0.33);
	float B = 0.45 * sigma2 / (sigma2 + 0.09);
	vec3 v_i = normalize(lightDir - normalVec * LdotN);
	vec3 v_r = normalize(eyedirVec - normalVec * VdotN);
	float G = max(0.0, dot(v_i, v_r));
	vec3 diffuseOrenNayar = diffuseLambert * (A + B * G * sin(alpha) * tan(beta));
    
    return vec3(diffuseOrenNayar);
}

void main() {
  
    // Normalize fsNormal, it might not be in the normalized form coming from the vs
    vec3 nNormal = normalize(fsNormal);

    // Light directions
    vec3 lDirA = normalize(-lightDirectionA); 
    vec3 lDirB = normalize(-lightDirectionB);
  
    // Computing OrenNayarDiffuse diffuse color for each light
    vec3 diffA = OrenNayarDiffuse(lDirA, lightColorA, nNormal);
    vec3 diffB = OrenNayarDiffuse(lDirB, lightColorB, nNormal);

    // Total lambert component
    vec3 OrenNayarDiff = clamp((materialDiffColor*(diffA + diffB)), 0.0, 1.0);

    // Computing ambient color
    vec3 ambient = ambientLightCol * ambientMat;
  
    // Computing BRDF color
    vec4 color = vec4(clamp(OrenNayarDiff + ambient + emit, 0.0, 1.0).rgb,1.0);
  
    outColor = color;

}