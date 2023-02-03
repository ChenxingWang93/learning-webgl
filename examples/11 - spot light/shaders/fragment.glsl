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

// Spotlight limit
uniform vec3 u_lightDirection;
uniform float u_innerLimit;
uniform float u_outerLimit;

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

  // compute light and specularity

  float dotFromDirection = dot(unitSurfaceToLight, -u_lightDirection);

  float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);

  float light = inLight * dot(normal, unitSurfaceToLight);
  float rawSpecular = max(0.0, dot(normal, halfVector));
  float specular = pow(rawSpecular, u_shininess);
  float limitedSpecular = inLight * specular;

  // Apply color
  outColor = u_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= light * u_lightColor;

  // Just add in the specular
  outColor.rgb += limitedSpecular * u_specularColor;
}