Directional light is one of the most common types of lights in 3D software. It's similar to the sun: parallel lines covering all the scene uniformly. It is very easy thanks to the [[Operations in JavaScript#Vector dot product|dot product]] between the light vector and the normal vector of any face:

- If they are opposite, the result is +1. 
- If they are perpendicular, the result is 0.
- If they are parallel, the result is -1.

>We can just multiply this number by the color of a face, and it looks like light!

<iframe class="webgl_example " style="width: 500px; height: 400px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/directional-lighting.html"></iframe>

>We call **normal vector**/**normals** to the vector that defines the direction of a face. To represent light we need geometries that have **normals** defined. The most common way is to use a **normal buffer** that has 3 numbers per vertex (just like the **position buffer** that describes the position of each vertex). 

<iframe class="webgl_example " style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/normals.html"></iframe>

Our **vertex shader** looks like this:

```c
#version 300 es
  
// Vertex coordinates and normals
in vec4 a_position;
in vec3 a_normal;
  
// Varying to pass the normal to the fragment shader
out vec3 v_normal;
  
// World matrices
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
  
// All shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = u_worldViewProjection * a_position;
  
    // Pass normal to fragment shader
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
}
```

First we are getting a **buffer** of type `vec3` containing the normal data of each vertex. Then, we apply the global transformation of the geometry to that normal to get the **global normal**. For example: if there is a face that is looking up ( `normal = (0, 1, 0)`) and we rotate the geometry 180º horizontally, that face will end up looking down (`normal = (0, -1, 0`), and that's the normal we want. Two things to consider:

>We need to convert `u_worldInverseTranspose` to a **mat3** so that it can be multiplied by `a_normal`. This makes sense because we don't care about the position, just the rotation data (which is contained within the 3x3 area of any 4x4 transformation matrix). Another way of doing this operation would be temporarily making `a_normal` a `vec4`  like this: `v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;`. 
 
>The reason we are applying the inverse transpose instead of the transformation matrix directly is that the latter would introduce errors if there was scale applied. The inverse transpose operation fixes those errors. It's not important to understand this.
 
 <iframe class="webgl_example " style="width: 600px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/normals-scaled.html"></iframe>

Finally, we define a **varying** to pass the normal information to the **fragment shader**, which looks like this:

```c
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
```

>We are getting the light direction and the geometry color as **uniforms** from JS. We are just making the dot product between the light vector and the normal vector. 

Next we need to pass all the data from JavaScript. The normal buffer is very similar to the position buffer:

```js
const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");

// create the normal buffer, make it the current ARRAY_BUFFER
// and copy in the normal values
const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
const normalData = new Float32Array(fGeometryNormals);
gl.bufferData(gl.ARRAY_BUFFER, normalData, gl.STATIC_DRAW);

// Turn on the attribute
gl.enableVertexAttribArray(normalAttributeLocation);

const size = 3;
const type = gl.FLOAT;
const normalize = false;
const stride = 0;
const offset = 0;
gl.vertexAttribPointer(
  normalAttributeLocation,
  size,
  type,
  normalize,
  stride,
  offset
);
```

We can pass the light direction and geometry color just like any other uniform:

```js
const colorLocation = gl.getUniformLocation(program, "u_color");
const reverseLightDirectionLocation = gl.getUniformLocation(
  program,
  "u_reverseLightDirection"
);

// Set the color to use
gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

// set the light direction.
gl.uniform3fv(reverseLightDirectionLocation, normalize([0.5, -0.7, 1]));
```

And finally we just need to make sure to pass both the **inverse transpose world matrix** (for the normal) and the **view projection matrix** (like we were already doing before). This means that we need to make 2 matrix products instead of just one:

```js
// ...
 
 const worldMatrix = multiplyManyMatrix4(
   translation,
   inverseHalfTranslationTransform,
   rotationX,
   rotationY,
   rotationZ,
   scale,
   halfPositionTransform
 );
 
 const worldInverseMatrix = invertMatrix4([...worldMatrix]);
 const worldInverseTransposeMatrix = transposeMatrix4(worldInverseMatrix);
 
 const worldViewProjectionMatrix = multiplyManyMatrix4(
   clipSpaceConversion,
   viewMatrix,
   worldMatrix
 );
 
 // Update uniforms
 
 const witLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
 gl.uniformMatrix4fv(witLocation, false, worldInverseTransposeMatrix);
 
 const wvpLocation = gl.getUniformLocation(program, "u_worldViewProjection");
 gl.uniformMatrix4fv(wvpLocation, false, worldViewProjectionMatrix);
```

