#version 300 es
precision highp float;

const float PI = 3.14159265359;

in vec3 fsNormal;
in vec4 fsPosition;

uniform vec3 specularColor;
uniform float specShine;
uniform vec3 mDiffColor;
uniform vec3 emit;

//directional light A
uniform vec3 lightDirectionA; 
uniform vec3 lightColorA;

//directional light B
uniform vec3 lightDirectionB; 
uniform vec3 lightColorB;

//ambient
uniform vec3 ambientLightCol;
uniform vec3 ambientMat;

// material parameters
uniform vec3 albedo;
uniform float metallic;
uniform float roughness;
uniform float ao;

// Camera position
uniform vec3 camPos;

out vec4 outColor;

float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / max(denom, 0.0000001); // prevent divide by zero for roughness=0.0 and NdotH=1.0
}
// ----------------------------------------------------------------------------
float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
// ----------------------------------------------------------------------------
vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(max(1.0 - cosTheta, 0.0), 5.0);
}
// ----------------------------------------------------------------------------


//computes the lambert diffuse
vec3 lambertDiffuse(vec3 lightDir, vec3 lightCol, vec3 normalVec) {
    vec3 diffL = lightCol * clamp(dot(normalVec, lightDir),0.0,1.0);
    return diffL;
}

//computes the blinn specular
vec3 blinnSpecular(vec3 lightDir, vec3 lightCol, vec3 normalVec, vec4 fsPosition, float specShine) {
    // camera space implies eye position to be (0,0,0)
    vec4 eyePosition = vec4(0.0, 0.0, 0.0, 0.0);   // what is eyePos in world space?? is the position of the camera that is already in world coordinates
    vec3 eyeDir = vec3(normalize(eyePosition - fsPosition));
    vec3 halfVec = normalize(eyeDir + lightDir);
    vec3 specularBl = pow(max(dot(halfVec, normalVec), 0.0), specShine) * lightCol;

    return specularBl;
}

void main() {
  
    //normalize fsNormal, it might not be in the normalized form coming from the vs
    vec3 nNormal = normalize(fsNormal);
/*
    vec4 eyePosition = vec4(0.0, 0.0, 0.0, 0.0);   // what is eyePos in world space?? use cameraPos in future
    vec3 eyeDir = vec3(normalize(eyePosition - fsPosition));

    // calculate reflectance at normal incidence; if dia-electric (like plastic) use F0 
    // of 0.04 and if it's a metal, use the albedo color as F0 (metallic workflow)    
    vec3 F0 = vec3(1.00, 0.71, 0.29); 
    F0 = mix(F0, albedo, metallic);

    // reflectance equation
    vec3 Lo = vec3(0.0);
    for(int i = 0; i < 4; ++i) 
    {
        // calculate per-light radiance
        vec3 L = normalize(lightPositions[i] - WorldPos);
        vec3 H = normalize(V + L);
        float distance = length(lightPositions[i] - WorldPos);
        float attenuation = 1.0 / (distance * distance);
        vec3 radiance = lightColors[i] * attenuation;

        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);   
        float G   = GeometrySmith(N, V, L, roughness);      
        vec3 F    = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);
           
        vec3 numerator    = NDF * G * F; 
        float denominator = 4 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
        vec3 specular = numerator / max(denominator, 0.001); // prevent divide by zero for NdotV=0.0 or NdotL=0.0
        
        // kS is equal to Fresnel
        vec3 kS = F;
        // for energy conservation, the diffuse and specular light can't
        // be above 1.0 (unless the surface emits light); to preserve this
        // relationship the diffuse component (kD) should equal 1.0 - kS.
        vec3 kD = vec3(1.0) - kS;
        // multiply kD by the inverse metalness such that only non-metals 
        // have diffuse lighting, or a linear blend if partly metal (pure metals
        // have no diffuse light).
        kD *= 1.0 - metallic;	  

        // scale light by NdotL
        float NdotL = max(dot(N, L), 0.0);        

        // add to outgoing radiance Lo
        Lo += (kD * albedo / PI + specular) * radiance * NdotL;  // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again
    }   
    
    // ambient lighting (note that the next IBL tutorial will replace 
    // this ambient lighting with environment lighting).
    vec3 ambient = vec3(0.03) * albedo * ao;

    vec3 color = ambient + Lo;

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0/2.2)); 

    outColor = vec4(color, 1.0);
*/
    //light directions
    vec3 lDirA = normalize(-lightDirectionA); 
    vec3 lDirB = normalize(-lightDirectionB);
  
    //computing Lambert diffuse color
    //directional lights
    vec3 diffA = lambertDiffuse(lDirA, lightColorA, nNormal);
    vec3 diffB = lambertDiffuse(lDirB, lightColorB, nNormal);

    //total lambert component
    vec3 lambertDiff = clamp((mDiffColor*(diffA + diffB)), 0.0, 1.0);

    //computing Blinn specular color
    vec3 specA = blinnSpecular(lDirA, lightColorA, nNormal, fsPosition, specShine);
    vec3 specB = blinnSpecular(lDirB, lightColorB, nNormal, fsPosition, specShine);
    //total specular component
    vec3 blinnSpec = specularColor * (specA + specB);

    //computing ambient color
    vec3 ambient = ambientLightCol * ambientMat;
  
    //computing BRDF color
    vec4 color = vec4(clamp(blinnSpec + lambertDiff + ambient + emit, 0.0, 1.0).rgb, 1.0);
    
    outColor = color;

}