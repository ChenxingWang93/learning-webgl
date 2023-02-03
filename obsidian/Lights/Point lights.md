The concept of point lights is very similar to how lightbulbs work in the real world. Light is casted from a point and emited radially. A very easy way to make this is to compute the [[Operations in JavaScript#Vector dot product|dot product]] between the normal vector and the vector pointing to the light. If they are parallel, the face is facing the light and it gets brighter: if they are different, the face is looking away and it gets darker.

This is very similar to how [[Directional lights|directional lights]] work, but in that case the dot product is the same for each pixel of the face, whereas in this case the result is different for each pixel (see diagram below).


<iframe class="webgl_example noborder" style="width: 500px; height: 400px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/point-lighting.html"></iframe>

>If we wanted to make this more realistic, we could easily take into account the distance of the pixel to the light, but here we will keep things as simple as possible.

First we will create our **vertex shader**. Here we will simply compute the vector from this vertex (`a_position`) to the point light (`v_surfaceToLight`). We need to pass 2 uniforms: 

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

So in our vertex shader we will simply take the global position of the camera as an uniform and compute the vector it makes with the global position of the surface:

```c
#version 300 es
  
// Vertex coordinates and normals
in vec4 a_position;
in vec3 a_normal;
  
// position of the point light in the real world
uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;
  
// World matrices
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
  
// varying: normal data
out vec3 v_normal;
  
// varying: vector from the vertex to the point light
out vec3 v_surfaceToLight;
  
// varying: vector from the vertex to the camera
out vec3 v_surfaceToView;
  
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
  
    // compute the vector of the surface to the view/camera
    // and pass it to the fragment shader
    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
```

And in the fragment shader we will take it and compute the **specular reflection** as the dot product of the halfVector and the normal vector of the surface. We can't forget to normalize everything to make everything unit vectors! There are three things to take into account:

>We are getting a light color and specular color as **uniform** from JS.

>To compute the specular light, we are aplying a power (`pow`) operation controlled by a **glosiness** factor that is passed as an **uniform**. The reason is that this way the specular reflex will behave in a exponential way, which is way more similar to the way this reflex works in the real world (see diagram below).

<iframe style="width: 300px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/power-graph.html"></iframe>

>Because we are aplying a power operation, we need to make sure that the base is positive. The reason is that trying to elevate a negative number to a decimal exponent result in an **imaginary number**, and the result will look super weird. 

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
uniform float u_shininess
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;
  
// We need to declare an output for the fragment shader 
out vec4 outColor;
  
void main() {
  
  // Varyings that are unit verctos are interpolate
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
```

This code has a potential problem: the use of an `if`. It is not recommended to use conditional in shaders because they can affect performance heavily. In this case we want to force the specularity to be 0 or above, and we can do this without a conditional using the `max` function. Not only is this more efficient, but also cleaner.

```c
  // Compute specularity
  float rawSpecular = max(0.0, dot(normal, halfVector));
  float specular = pow(rawSpecular, u_shininess);
```

Of course, all the **uniforms** are passed as seen in other lessons. For instance, we can pass the global position of the camera like this:

```js
  const cameraPosition = [
    data.xTranslationCamera,
    data.yTranslationCamera,
    data.zTranslationCamera
  ];
  
  const cameraTranslation = lookAt(cameraPosition, [0, 0, 0]);  

  // set the camera/view position for
  
  var cameraUniformLocation = gl.getUniformLocation(
    program,
    "u_viewWorldPosition"
  );
  
  gl.uniform3fv(cameraUniformLocation, cameraPosition);
```