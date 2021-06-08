#version 300 es

in vec3 a_position;
in vec3 a_normal;

out vec3 fs_norm;

uniform mat4 matrix;

//We need to transform the normals with the position
//We will see in a future lesson why and how to do it

uniform mat4 nMatrix; 
void main() {
  fs_norm = mat3(nMatrix) * a_normal;
  gl_Position = matrix * vec4(a_position,1.0);
}