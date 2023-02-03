#version 300 es  

// fragment shaders don't have a default precision so we need  
// to pick one. highp is a good default. It means "high precision"  
precision highp float;

// Passed in and varied from the vertex shader.
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;

// We need to declare an output for the fragment shader  
out vec4 outColor;

void main() {

  // Varyings that are unit verctos are interpolated
  // so they will not be a unit vector. Normalizing them
  // will make them unit vectors again
  vec3 normal = normalize(v_normal);
  vec3 unitSurfaceToLight = normalize(v_surfaceToLight);

  vec3 unitSurfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(unitSurfaceToLight + unitSurfaceToView);

  // compute the light
  float light = dot(normal, unitSurfaceToLight);

  // Compute specularity
  float specular = 0.0;
  float rawSpecular = dot(normal, halfVector);
  if(rawSpecular > 0.0) {
    specular = pow(rawSpecular, u_shininess);
  }

  // Apply color
  outColor = u_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= light * u_lightColor;

  // Just add in the specular
  outColor.rgb += specular * u_specularColor;
}