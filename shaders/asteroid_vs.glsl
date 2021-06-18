#version 300 es

in vec3 in_position; 
in vec3 in_normal;
in vec2 in_UV;

out vec3 fsNormal; 
out vec4 fsPosition;
out vec2 fsUV;

uniform mat4 matrix;
uniform mat4 pMatrix;
uniform mat4 nMatrix; 

void main() {
    fsUV = in_UV;
    fsNormal = mat3(nMatrix) * in_normal;
    fsPosition = (pMatrix * vec4(in_position, 1.0)).xyzw; // coordinates in world space
    gl_Position = matrix * vec4(in_position, 1.0);
}