#version 300 es

// An attribute will receive data from a buffer
in vec2 a_position;

// Transformation matrix
uniform mat3 u_transformation;

// Color the geometry depending on its position in clip space
out vec4 v_color;

// All shaders have a main function
void main() {

    // Apply transformation
    vec2 transformed = (u_transformation * vec3(a_position, 1)).xy;  

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = vec4(transformed, 0, 1);

    v_color = gl_Position * 0.5 + 0.5;
}