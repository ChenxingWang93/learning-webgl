#version 300 es  

precision highp float;

uniform sampler2D u_image;

in vec2 v_texCoord;

uniform float u_kernel[9];
uniform float u_kernelWeight;

out vec4 outColor;

void main() {
    vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));

    vec2 leftTop = v_texCoord + onePixel * vec2(-1, -1);
    vec2 top = v_texCoord + onePixel * vec2(0, -1);
    vec2 rightTop = v_texCoord + onePixel * vec2(1, -1);
    vec2 left = v_texCoord + onePixel * vec2(-1, 0);
    vec2 center = v_texCoord + onePixel * vec2(0, 0);
    vec2 right = v_texCoord + onePixel * vec2(1, 0);
    vec2 leftBottom = v_texCoord + onePixel * vec2(-1, 1);
    vec2 bottom = v_texCoord + onePixel * vec2(0, 1);
    vec2 rightBottom = v_texCoord + onePixel * vec2(1, 1);

    vec4 colorSum = texture(u_image, leftTop) * u_kernel[0] +
        texture(u_image, top) * u_kernel[1] +
        texture(u_image, rightTop) * u_kernel[2] +
        texture(u_image, left) * u_kernel[3] +
        texture(u_image, center) * u_kernel[4] +
        texture(u_image, right) * u_kernel[5] +
        texture(u_image, leftBottom) * u_kernel[6] +
        texture(u_image, bottom) * u_kernel[7] +
        texture(u_image, rightBottom) * u_kernel[8];

    outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}