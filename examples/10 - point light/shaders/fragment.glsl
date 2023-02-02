#version 300 es  

// fragment shaders don't have a default precision so we need  
// to pick one. highp is a good default. It means "high precision"  
precision highp float;

// Passed in and varied from the vertex shader.
in vec3 v_normal;
in vec3 v_surfaceToLight;

uniform vec4 u_color;

// We need to declare an output for the fragment shader  
out vec4 outColor;

void main() {

  // Varyings that are unit verctos are interpolated
  // so they will not be a unit vector. Normalizing them
  // will make them unit vectors again
  vec3 normal = normalize(v_normal);
  vec3 unitSurfaceToLight = normalize(v_surfaceToLight);

  // compute the light
  float light = dot(normal, unitSurfaceToLight);

  // Apply color
  outColor = u_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= light;
}