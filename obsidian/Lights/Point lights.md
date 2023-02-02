The concept of point lights is very similar to how lightbulbs work in the real world. Light is casted from a point and emited radially. A very easy way to make this is to compute the [[Operations in JavaScript#Vector dot product|dot product]] between the normal vector and the vector pointing to the light. If they are parallel, the face is facing the light and it gets brighter: if they are different, the face is looking away and it gets darker.

>If we wanted to make this more realistic, we could easily take into account the distance of the pixel to the light, but here we will keep things as simple as possible.

<iframe class="webgl_example noborder" style="width: 500px; height: 400px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/point-lighting.html"></iframe>

First we will create our **vertex shader**. Here we will simply compute the vector from this vertex (`a_position`) to the point light (`v_surfaceToLight`). First, we pass 2 uniforms: 

- The global point light position (`u_lightWorldPosition`) 
- The global transformation of the geometry / **world matrix** (`u_world`).

Then we compute the global position of the vertex by applying the world matrix and  compute `v_surfaceToLight` by subtracting the global vertex position to the global point light position.

```c
#version 300 es
  
// Vertex coordinates and normals
in vec4 a_position;
in vec3 a_normal;
  
// position of the point light in the real world
uniform vec3 u_lightWorldPosition;
  
// World matrices
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
  
// varying: normal data
out vec3 v_normal;
  
// varying: distance of this vertex to point light
out vec3 v_surfaceToLight;
  
// All shaders have a main function
void main() {
	// gl_Position is a special variable a vertex shader
	// is responsible for setting
	gl_Position = u_worldViewProjection * a_position;
	
	// Pass normal to fragment shader
	v_normal = mat3(u_worldInverseTranspose) * a_normal;
	
	// compute the world position of the surface
	vec3 surfaceWorldPosition = (u_world * a_position).xyz;
	
	// compute the vector of the surface to the light
	// and pass it to the fragment shader
	v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
}
```

Now, in the **fragment shader** we just need to get surface-light vector computed in the **vertex shader**, normalize it (to make sure it's a unit vector) and apply it to the color through the [[Operations in JavaScript#Vector dot product|dot product]], so that the geometry that faces the point light perpendicularly gets brighter.

```c
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
```

This is already great, but in the real world, glossy surfaces reflect the source of light like a mirror. This effect is called **specularity**. This is easy to check, as the light always bounces back with the same angle that it forms with the reflective surface. This means that we should see the reflection of the light if the vector between the light and our eyes is the same as the normal vector of the surface:

<iframe style="width: 500px; height: 400px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/specular-lighting.html"></iframe>

>Checking if the normal vector and the half vector are parallel is super simple with the [[Operations in JavaScript#Vector dot product|dot product]]!

