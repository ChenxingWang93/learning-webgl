The images that we handle to WebGL so that it can draw as a part of our shaders are called **textures**. 

>The same way WebGL expects **clip space coordinates** when drawing geometry, it expects **texture coordinates** (also called **UV coordinates**) when reading a texture. **Texture coordinates** go from 0 to 1, regardless of the size of the texture. WebGL can also read textures using **pixel coordinates**, but it's less common.

Texture coordinates are passed as a buffer to the vertex shader and transmitted as **varying** to the fragment shader. The idea is simple: WebGL will get the exact position of the texture per pixel by interpolating the texture coordinates per vertex. So the vertex shader looks like this:

```c
#version 300 es
  
in vec2 a_texCoord;
out vec2 v_texCoord;
  
// ...
  
void main() {
	
	// ...
	
	v_texCoord = a_texCoord;
}
```

And the fragment shader looks like this. We are passing the texture as a `sampler2D` uniform: 

```c
#version 300 es  
  
precision highp float;
  
uniform sampler2D u_image;
  
in vec2 v_texCoord;
out vec4 outColor;
  
void main() {
	outColor = texture(u_image, v_texCoord);
}
```

That's it for the shaders! Now, in JavaScript we will need to set the texture coordinates. In this example we are just drawing a simple 2D rectangle, so it's just 2 triangles (3 vertices).

```js
function setupTextureCoords(gl, program) {
	const attribLocation = gl.getAttribLocation(program, "a_texCoord");
	
	const texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	
	const textureCoordData = new Float32Array([
		// First triangle 
		0.0, 0.0
		1.0, 0.0,
		0.0, 1.0,
		// Second triangle
		0.0, 1.0,
		1.0, 0.0,
		1.0, 1.0,
	]);
	
	// Fill the buffer with the data
	gl.bufferData(gl.ARRAY_BUFFER, textureCoordData, gl.STATIC_DRAW);
	// Turn on the attribute
	gl.enableVertexAttribArray(attribLocation);
	
	// Tell the attribute how to get data out of texCoordBuffer
	const size = 2; 
	const type = gl.FLOAT; 
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.vertexAttribPointer(
		attribLocation,
		size,
		type,
		normalize,
		stride
		offset
	);
}
```

The only thing left is to set up the texture itself. We will pass this texture as a 

```js
function setupTexture(gl, program) {
	const imageLocation = gl.getUniformLocation(program, "u_image");
	
	// Create a texture.
	const texture = gl.createTexture();
	
	// make unit 0 the active texture unit
	// (ie, the unit all other texture commands will affect
	gl.activeTexture(gl.TEXTURE0);
	
	// Bind it to texture unit 0' 2D bind point
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	// Set the parameters so we don't need mips and so we're not filtering
	// and we don't repeat at the edges
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
	// Upload the image into the texture.
	const mipLevel = 0;
	const internalFormat = gl.RGBA;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	gl.texImage2D(
		gl.TEXTURE_2D,
		mipLevel,
		internalFormat,
		srcFormat,
		srcType,
		image
	);
	
	// Tell the shader to get the texture from texture unit 0
	gl.uniform1i(imageLocation, 0);
}
```

It's important to note that we are setting **texture units**. When we make a render call, our shaders can reference textures, and textures are bound to **texture units**. It depends on the machine, but all WebGL implementations are required to support at least 16 textures units. 

We can assign the texture uniforms to the **texture unit** it should use like this:

```js
// Tell the uniform u_image to use the texture unit 6
const textureUnitIndex = 6; 
const u_imageLoc = gl.getUniformLocation(program, "u_image");
gl.uniform1i(u_imageLoc, textureUnitIndex);
```

In addition to this, we need to put some data into texture units. We can bind a texture inside a **texture unit** like this:

```js
gl.activeTexture(gl.TEXTURE6);
gl.bindTexture(gl.TEXTURE_2D, someTexture);
```

This would also work:

```js
const textureUnitIndex = 6; 
// Bind someTexture to texture unit 6.
gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
gl.bindTexture(gl.TEXTURE_2D, someTexture);
```

