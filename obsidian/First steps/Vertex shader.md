Its mission is to calculate coordinates of geometry vertices in the **clip space**. The **clip space** is a virtual space representing the image to be rendered. The clip space has coordinates ranging from -1 to 1, regardless of the image size.

<div style="margin: 2rem; display: flex; display: flex; justify-content: center;">
<img width="300px" src="https://webglfundamentals.org/webgl/lessons/resources/clipspace.svg">
</div>

>A **vertex shader** is executed once for each geometry vertex. At each iteration, it must determine the coordinates in the **clip space** of that vertex using the predefined variable `gl_Position`. It always has the following structure:

```C
#version 300 es
void main() {
	gl_Position = doMathToMakeClispaceCoordinates();
}
```

For example, if we try to draw 3 triangles (9 vertices) using a [[#Buffers and attributes|buffer]], the **vertex shader** would run 9 times and build a new buffer with 9 coordinates in the **clip space**.

<div style="margin: 2rem; display: flex; display: flex; justify-content: center;">
<img width="500px" src="https://webglfundamentals.org/webgl/lessons/resources/vertex-shader-anim.gif">
</div>

**Vertex shaders** need external data, and there are [[Shaders|3 ways to do this]]: **buffer/attributes**, **uniforms** and **textures**.

# Buffers/attributes

**Buffers/attributes** are the most common way to pass data to the **vertex shader**. Consider a basic **vertex shader** that receives data via an **attribute** of type `vec4` and simply passes it to the **clip space** without performing any operations:

```c
#version 300 es

in vec4 a_position;

void main() {
	gl_Position = a_position;
}
```

We can pass data to it like this:

```js
// Create the buffer
var buf = gl.createBuffer();

// Fill buffer with data
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, someData, gl.STATIC_DRAW);

// Locate the attribute we created in the shader
const positionLoc = gl.getAttribLocation(someProgram, "a_position");

// Enable it
gl.enableVertexAttribArray(positionLoc);

// Link the buffer with the attribute 
// Telling WebGL how to extract data from the buffer

const numComponents = 3; // (x, y, z)
const type = gl.FLOAT;
const normalize = false; // leave the values as they are
const offset = 0; // start at the beginning of the buffer
const stride = 0; // how many bytes to move to the next vertex

gl.vertexAttribPointer(positionLoc, numComponents, type, false, stride, offset);
```


# Uniforms

Uniforms are data that have a constant value for all vertices throughout all the **draw call**. For instance, we can apply an offset to the previous shader:

```c
#version 300 es

in vec4 a_position;
uniform vec4 u_offset;

void main() {
	gl_Position = a_position + u_offset;
}
```

We can pass data to that **uniform** like this:

```js
// Get the location of the uniform
const offsetLoc = gl.getUniformLocation(someProgram, "u_offset");

// Set the value of the uniform
// Here we are applying an offet to the right side of the screen
gl.uniform4fv(offsetLoc, [1,0,0,0]);
```

The **uniforms** can be of many types, and each one requires a specific function:

```js
gl.uniform1f (loc, v);                 // for float
gl.uniform1fv(loc, [v]);               // for float or float array
gl.uniform2f (loc,  v0, v1);            // for vec2
gl.uniform2fv(loc,  [v0, v1]);          // for vec2 or vec2 array
gl.uniform3f (loc,  v0, v1, v2);        // for vec3
gl.uniform3fv(loc,  [v0, v1, v2]);      // for vec3 or vec3 array
gl.uniform4f (loc,  v0, v1, v2, v4);    // for vec4
gl.uniform4fv(loc,  [v0, v1, v2, v4]);  // for vec4 or vec4 array

gl.uniformMatrix2fv(loc, false, [ 4x array ])  // for mat2 or mat2 array
gl.uniformMatrix3fv(loc, false, [ 9x array ])  // for mat3 or mat3 array
gl.uniformMatrix4fv(loc, false, [ 16x array ])  // for mat4 or mat4 array

gl.uniform1i (loc,   v);                 // for int
gl.uniform1iv(loc, [v]);                 // for int or int array
gl.uniform2i (loc, v0, v1);            // for ivec2
gl.uniform2iv(loc, [v0, v1]);          // for ivec2 or ivec2 array
gl.uniform3i (loc, v0, v1, v2);        // for ivec3
gl.uniform3iv(loc, [v0, v1, v2]);      // for ivec3 or ivec3 array
gl.uniform4i (loc, v0, v1, v2, v4);    // for ivec4
gl.uniform4iv(loc, [v0, v1, v2, v4]);  // for ivec4 or ivec4 array

gl.uniform1u (loc,   v);                 // for uint
gl.uniform1uv(loc, [v]);                 // for uint or uint array
gl.uniform2u (loc, v0, v1);            // for uvec2
gl.uniform2uv(loc, [v0, v1]);          // for uvec2 or uvec2 array
gl.uniform3u (loc, v0, v1, v2);        // for uvec3
gl.uniform3uv(loc, [v0, v1, v2]);      // for uvec3 or uvec3 array
gl.uniform4u (loc, v0, v1, v2, v4);    // for uvec4
gl.uniform4uv(loc, [v0, v1, v2, v4]);  // for uvec4 or uvec4 array

// for sampler2D, sampler3D, samplerCube, samplerCubeShadow, sampler2DShadow,
// sampler2DArray, sampler2DArrayShadow

gl.uniform1i (samplerUniformLoc,   v);
gl.uniform1iv(samplerUniformLoc, [v]);
```

>There are also **uniforms** of type `bool`, `bvec2` and `bvec3`. They use the `gl.uniform?f?`, `gl.uniform?i?` or `gl.uniform?f?` functions.

In the case of **uniforms** that are arrays, there are two options: set all the values at once, or only some of them. In the latter case we have to locate those elements before we can set their value. For example, given the following **uniform**:

```c
uniform vec2 u_someVec2[3];
```

We can set its total or partial value as follows:

```js
// OPTION 1 - SET ALL THE VALUES

// At init time
const someVec3Loc = gl.getUniformLocation(someProgram, "u_someVec2");

// At render time
gl.uniform2fv(someVec2Loc, [1, 2, 3, 4, 5, 6]);

// OPTION 2 - SET JUST SOME VALUES

// At init time
const element0Loc = gl.getUniformLocation(someProgram, "u_someVec2[0]");
const element1Loc = gl.getUniformLocation(someProgram, "u_someVec2[1]");
const element2Loc = gl.getUniformLocation(someProgram, "u_someVec2[2]");

// at render time
gl.uniform2fv(element0Loc, [1, 2]); // set element 0
gl.uniform2fv(element1Loc, [3, 4]); // set element 1
gl.uniform2fv(element2Loc, [5, 6]); // set element 2
```

Similarly, if we have a `struct` in the shader:

```c
struct SomeStruct {
	bool active;
	vec2 someVec2;
}

uniform SomeStruct u_someThing;
```

We will have to look up each value individually in order to establish its value:

```js
const activeLoc = gl.getUniformLocation(someProgram, "u_someThing.active");
const vec2Loc = gl.getUniformLocation(someProgram, "u_someThing.someVec2");
```

# Textures

See [[Fragment shader#Texturas|textures in fragment shaders]].