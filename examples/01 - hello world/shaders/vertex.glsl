#version 300 es

// An attribute will receive data from a buffer
in vec4 a_position;

out vec4 v_color;

// All shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;

    v_color = gl_Position * 0.5 + 0.5;
}