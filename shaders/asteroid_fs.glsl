#version 300 es
precision highp float;

const float PI = 3.14159265359;
const float distance = 0.5; // lights are directional ones

in vec3 fsNormal;
in vec4 fsPosition;
in vec4 fsCamera;
in vec2 fsUV;

// Directional light A
uniform vec3 lightDirectionA; 
uniform vec3 lightColorA;

// Directional light B
uniform vec3 lightDirectionB; 
uniform vec3 lightColorB;

// Texture
uniform sampler2D diffuseMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;
uniform sampler2D normalMap;
uniform sampler2D metalnessMap;

out vec4 outColor;

vec3 getNormalFromMap()
{
    vec3 tangentNormal = texture(normalMap, fsUV).xyz * 2.0 - 1.0;

    // Determine how the position coordinates changes on screen
    vec3 p_dx  = vec3(dFdx(fsPosition));
    vec3 p_dy  = vec3(dFdy(fsPosition));

    // Determine how the UV coordinates changes on screen
    vec2 tc_dx = dFdx(fsUV);  // approximate the derivatives of fsUV according to the horizontal edge of the screen
    vec2 tc_dy = dFdy(fsUV);  // approximate the derivatives of fsUV according to the vertical edge of the screen

    vec3 T = (tc_dy.y * p_dx - tc_dx.y * p_dy) / (tc_dx.x * tc_dy.y - tc_dy.x * tc_dx.y);

    vec3 N   = normalize(fsNormal);

    T = normalize(T - N * dot(N, T)); // Gram-Schmidth normalization to make sure that the normal and tangent are still orthogonal after interpolation

    vec3 B   = -normalize(cross(N, T));

    mat3 TBN = mat3(T, B, N); // TBN frame matrix

    return normalize(TBN * tangentNormal);
}

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

void main() {

    vec3 albedo = texture(diffuseMap, fsUV).rgb;
    float metallic  = texture(metalnessMap, fsUV).r;
    float roughness = texture(roughnessMap, fsUV).r;
    float ao =  texture(aoMap, fsUV).r;
    
    //normalize fsNormal, it might not be in the normalized form coming from the vs
    vec3 N = getNormalFromMap();
    vec3 V = vec3(normalize(fsCamera - fsPosition));

    // calculate reflectance at normal incidence; if dia-electric (like plastic) use F0 
    // of 0.04 and if it's a metal, use the albedo color as F0 (metallic workflow)    
    vec3 F0 = vec3(0.04); 
    F0 = mix(F0, albedo, metallic);

    // reflectance equation
    vec3 Lo = vec3(0.0);

    // Light A
    // -------
    
    // calculate per-light radiance
    vec3 L = normalize(-lightDirectionA);
    vec3 H = normalize(V + L);
    //float distance = 10.0;
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColorA * attenuation;

    // Cook-Torrance BRDF
    float NDF = DistributionGGX(N, H, roughness);   
    float G   = GeometrySmith(N, V, L, roughness);      
    vec3 F    = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);
           
    vec3 numerator    = NDF * G * F; 
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
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
    
    // -------

    // Light B
    // -------
    
    // calculate per-light radiance
    L = normalize(-lightDirectionB);
    H = normalize(V + L);
    //distance = 10.0;
    attenuation = 1.0 / (distance * distance);
    radiance = lightColorB * attenuation;

    // Cook-Torrance BRDF
    NDF = DistributionGGX(N, H, roughness);   
    G   = GeometrySmith(N, V, L, roughness);      
    F    = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);
           
    numerator    = NDF * G * F; 
    denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
    specular = numerator / max(denominator, 0.001); // prevent divide by zero for NdotV=0.0 or NdotL=0.0
        
    // kS is equal to Fresnel
    kS = F;
    // for energy conservation, the diffuse and specular light can't
    // be above 1.0 (unless the surface emits light); to preserve this
    // relationship the diffuse component (kD) should equal 1.0 - kS.
    kD = vec3(1.0) - kS;
    // multiply kD by the inverse metalness such that only non-metals 
    // have diffuse lighting, or a linear blend if partly metal (pure metals
    // have no diffuse light).
    kD *= 1.0 - metallic;	  

    // scale light by NdotL
    NdotL = max(dot(N, L), 0.0);        

    // add to outgoing radiance Lo
    Lo += (kD * albedo / PI + specular) * radiance * NdotL;  // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again
    
    // -------
    
    // ambient lighting
    vec3 ambient = vec3(0.03) * albedo * ao;

    vec3 color = ambient + Lo;

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0/2.2)); 

    outColor = vec4(color, 1.0);

}