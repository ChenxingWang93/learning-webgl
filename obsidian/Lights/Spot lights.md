Spot lights are very similar to [[Point lights|point lights]], but they are limited to a specific **direction** and a **limit angle**. This imitates the behavious of the lights used in cinema.

<iframe class="webgl_example noborder" style="width: 500px; height: 400px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/spot-lighting.html"></iframe>

The [[Operations in JavaScript#Vector dot product|dot product]] of two vectors is the cosine of the angle that they form. That means that a given ray is inside the limit if the dot product between it and the chosen direction is greater than  `cos(limit)`. Using the dot product example, this is very easy to implement. There are 3 things to consider: 

>We are making the dot product with the negative of the light direction `-u_lightDirection` to make it look in the same direction as the vector from the surface to the light (`unitSurfaceToLight`). That way, we get the behavior that we want from the dot product. Basically it's the same as the diagram above, but the vectors are pointing in the other direction.

>Just making one limit would make a very dull spotlight because the transition between light and darkness would be a straight line. Instead, we will define an outer limit and an inner limit, and we'll make a smooth transition between both using the `smoothstep` function.

>We only want to apply the spotlight limitation also to the specular light, and we can do that simply by multiplying the `inLight` function by the specular light, like we are doing with the normal light.

And this is our fragment shader:

```c
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
uniform float u_innerLimit
uniform float u_outerLimit;
  
// We need to declare an output for the fragment shader  
out vec4 outColor;

void main() {


  // Varyings that are unit verctos are interpolated
  // so they will not be a unit vector. Normalizing the
  // will make them unit vectors again
  vec3 normal = normalize(v_normal);
  vec3 unitSurfaceToLight = normalize(v_surfaceToLight);

  vec3 unitSurfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(unitSurfaceToLight + unitSurfaceToView);
  
  // compute light and specularity

  float dotFromDirection = dot(unitSurfaceToLight, -u_lightDirection)
  
  float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);
  
  float light = inLight * dot(normal, unitSurfaceToLight);
  float rawSpecular = max(0.0, dot(normal, halfVector));
  float specular = pow(rawSpecular, u_shininess);
  float limitedSpecular = step(0.1, light) * specular;
  
  // Apply color
  outColor = u_color;
  
  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= light * u_lightColor;
  
  // Just add in the specular
  outColor.rgb += limitedSpecular * u_specularColor;
}```