#version 300 es  

// fragment shaders don't have a default precision so we need  
// to pick one. highp is a good default. It means "high precision"  
precision highp float;

// Passed in and varied from the vertex shader.
in vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;

// We need to declare an output for the fragment shader  
out vec4 outColor;

void main() {

  // because v_normal is a varying it's interpolated
  // so it will not be a unit vector. Normalizing it
  // will make it a unit vector again
    vec3 normal = normalize(v_normal);

  // compute the light by taking the dot product
  // of the normal to the light's reverse direction
    float light = dot(normal, u_reverseLightDirection);

 // Apply color
    outColor = u_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
    outColor.rgb *= light;
}