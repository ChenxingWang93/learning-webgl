#version 300 es

// Vertex coordinates and normals
in vec4 a_position;
in vec3 a_normal;

// varying to pass the normal to the fragment shader
out vec3 v_normal;

// World matrices
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

// All shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = u_worldViewProjection * a_position;

    // Pass normal to fragment shader
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
}