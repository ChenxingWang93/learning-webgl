#version 300 es

// Vertex coordinates and normals
in vec4 a_position;

in vec3 a_normal;
out vec3 v_normal;

uniform vec4 u_color;
out vec4 v_color;

// World matrices
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

void main() {
    gl_Position = u_worldViewProjection * a_position;

    v_normal = mat3(u_worldInverseTranspose) * a_normal;
    v_color = u_color;
}