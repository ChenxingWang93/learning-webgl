#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;

// the convolution kernal data
uniform float u_kernel[9];
uniform float u_kernelWeight;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
    vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));

    vec4 colorSum = texture(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
        texture(u_image, v_texCoord + onePixel * vec2(0, -1)) * u_kernel[1] +
        texture(u_image, v_texCoord + onePixel * vec2(1, -1)) * u_kernel[2] +
        texture(u_image, v_texCoord + onePixel * vec2(-1, 0)) * u_kernel[3] +
        texture(u_image, v_texCoord + onePixel * vec2(0, 0)) * u_kernel[4] +
        texture(u_image, v_texCoord + onePixel * vec2(1, 0)) * u_kernel[5] +
        texture(u_image, v_texCoord + onePixel * vec2(-1, 1)) * u_kernel[6] +
        texture(u_image, v_texCoord + onePixel * vec2(0, 1)) * u_kernel[7] +
        texture(u_image, v_texCoord + onePixel * vec2(1, 1)) * u_kernel[8];
    outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}