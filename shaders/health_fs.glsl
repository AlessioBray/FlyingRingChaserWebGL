#version 300 es
precision highp float;

in vec3 fsNormal;
in vec4 fsPosition;
in vec4 fsCamera; // Camera position

//directional light A
uniform vec3 lightDirectionA; 
uniform vec3 lightColorA;

//directional light B
uniform vec3 lightDirectionB; 
uniform vec3 lightColorB;

const float PI = 3.14159265359;

//////////////////////////////////////////////////////////////////////////////

//uniform vec3 specularColor;
//uniform float specShine;

const vec3 diffColor = vec3(0.24, 1, 0);

// define specular component of color
//const vec3 specularColor = vec3(0.24, 1, 0);
//const float specShine = 0.5*64.0;

// uniform vec3 mDiffColor;
// uniform vec3 emit;

const vec3 materialDiffColor = vec3(0.24, 1, 0);
const vec3 emit = vec3(0);

//ambient
//uniform vec3 ambientLightCol;
//uniform vec3 ambientMat;

const vec3 ambientLightCol = vec3(0.4, 0.4, 0.4); 
const vec3 ambientMat = vec3(1, 1, 1);


////////////////////////////////////////////////////////////////////////////////

out vec4 outColor;

//computes the lambert diffuse
vec3 lambertDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {

    //vec3 diffuseLambert = lightCol * clamp(dot(normalVec, lightDir), 0.0, 1.0);

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
	float sigma2 = PI / 2.0;                 /// between 0 and pi/2
	float A = 1.0 - 0.5 * sigma2 / (sigma2 + 0.33);
	float B = 0.45 * sigma2 / (sigma2 + 0.09);
	vec3 v_i = normalize(lightDir - normalVec * LdotN);
	vec3 v_r = normalize(eyedirVec - normalVec * VdotN);
	float G = max(0.0, dot(v_i, v_r));
	vec3 diffuseOrenNayar = diffuseLambert * (A + B * G * sin(alpha) * tan(beta));
    
    return vec3(diffuseOrenNayar);
}

//computes the blinn specular
vec3 blinnSpecular(vec3 lightDir, vec3 lightCol, vec3 normalVec, vec4 fsPosition, float specShine) {
    
    // camera space implies eye position to be (0,0,0)
    vec4 eyePosition = fsCamera;   // what is eyePos in world space??
    vec3 eyeDir = vec3(normalize(eyePosition - fsPosition));
    vec3 halfVec = normalize(eyeDir + lightDir);
    vec3 specularBl = pow(max(dot(halfVec, normalVec), 0.0), specShine) * lightCol;
    
    return specularBl;
}

void main() {
  
    //normalize fsNormal, it might not be in the normalized form coming from the vs
    vec3 nNormal = normalize(fsNormal);

    //light directions
    vec3 lDirA = normalize(-lightDirectionA); 
    vec3 lDirB = normalize(-lightDirectionB);
  
    //computing Lambert diffuse color
    //directional lights
    vec3 diffA = lambertDiffuse(lDirA, lightColorA, nNormal);
    vec3 diffB = lambertDiffuse(lDirB, lightColorB, nNormal);

    //total lambert component
    vec3 lambertDiff = clamp((materialDiffColor*(diffA + diffB)), 0.0, 1.0);

    //computing Blinn specular color
    //vec3 specA = blinnSpecular(lDirA, lightColorA, nNormal, fsPosition, specShine);
    //vec3 specB = blinnSpecular(lDirB, lightColorB, nNormal, fsPosition, specShine);

    //total specular component
    //vec3 blinnSpec = specularColor * (specA + specB);

    //computing ambient color
    vec3 ambient = ambientLightCol * ambientMat;
  
    //computing BRDF color
    vec4 color = vec4(clamp(/*blinnSpec*/ + lambertDiff + ambient + emit, 0.0, 1.0).rgb,1.0);
  
    outColor = color;

}