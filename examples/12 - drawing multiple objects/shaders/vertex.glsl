#version 300 es

// An attribute will receive data from a buffer
in vec4 a_position;

// Color of each face
in vec4 a_color;
out vec4 v_color;

// Transformation matrix
uniform mat4 u_transformation;

// All shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = u_transformation * a_position;

    // Pass color to fragment shader
    v_color = a_color;
}