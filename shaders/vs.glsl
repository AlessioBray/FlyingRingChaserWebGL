#version 300 es

in vec3 inPosition; 
in vec3 inNormal; 
out vec3 fsNormal; 
out vec4 fsPosition;

uniform mat4 matrix;
uniform mat4 pMatrix;
uniform mat4 nMatrix; 

in vec2 in_uv;

out vec2 fsUV;

void main() {

  fsUV = in_uv;
  fsNormal = mat3(nMatrix) * inNormal;
  fsPosition = (pMatrix * vec4(inPosition,1.0)).xyzw; // coordinates in world space
  gl_Position = matrix * vec4(inPosition,1.0);
}