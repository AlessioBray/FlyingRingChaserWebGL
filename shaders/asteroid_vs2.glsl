#version 300 es

in vec3 in_position; 
in vec3 in_normal;
in vec2 in_UV;
in vec3 in_tangent;

out vec2 fsUV;
out vec3 fsTangentLightPos;
out vec3 fsTangentViewPos;
out vec3 fsTangentFragPos;

uniform mat4 worldViewProjectionMatrix;
uniform mat4 worldMatrix;
uniform mat4 normalMatrix; 

uniform vec3 lightPosition;
uniform vec3 cameraPosition;

void main() {
    
    fsUV = in_UV;
    fsNormal = mat3(normalMatrix) * in_normal;
    fsPosition = (worldMatrix * vec4(in_position, 1.0)).xyzw; // coordinates in world space

    vec3 T = normalize(vec3(worldMatrix * vec4(in_tangent, 0.0)));
    vec3 N = normalize(vec3(worldMatrix * vec4(in_normal, 0.0)));
    // re-orthogonalize T with respect to N (Gram-Schmidt process)
    T = normalize(T - dot(T, N) * N);
    // then retrieve perpendicular vector B with the cross product of T and N
    vec3 B = cross(N, T);

    mat3 TBN = mat3(T, B, N)  

    fsTangentLightPos = TBN * lightPosition;
    fsTangentViewPos  = TBN * cameraPosition;
    fsTangentFragPos  = TBN * fsPosition;

    gl_Position = worldViewProjectionMatrix * vec4(in_position, 1.0);
}