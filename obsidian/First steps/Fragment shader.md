Its mission is to rasterise the result of the **vertex shader** into primitive elements (e.g. points, lines and triangles), calculating the colour of each pixel on the screen.

>A **fragment shader** is executed once for each pixel on the screen. At each iteration, it must determine the colour of that pixel. It always has the following structure:

```c
#version 300 es
precision highp float;

out vec4 outColor; // you can pick any name

void main() {
	outColor = doMathToMakeAColor;
}
```

The color is a `vec4` of 4 floating values that need to be between 0 and 1. The fourth component is the **alpha** (transparency).

**Fragment shaders** often require external data, and there are [[Shaders|3 ways to do this]]: **varyings**, **uniforms** and **textures**. 

# Varyings

For example, if we draw a triangle using **varying** to determine the color of each pixel based on its coordinates in the **clip space**, the **vertex shader** would look like this:

```c
#version 300 es

in vec4 a_position;
out vec4 v_color;

void main() {
    gl_Position = a_position;
    v_color = gl_Position * 0.5 + 0.5;
}
```

And the fragment shader would look like this:

```c
#version 300 es  

precision highp float;

// Get the varying from the vertex shader
in vec4 v_color;

out vec4 outColor;

void main() {
    outColor = v_color;
}
```

For each pixel, the **fragment shader** will interpolate the vertices (`gl_Position`) and the **varying** inputs.

<iframe class="webgl_example " style="width: 600px; height: 400px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/fragment-shader-anim.html"></iframe>

# Textures

To extract data from a texture in a **shader** we must create a **uniform** of type `sampler2D` and use the `texture` function of the **fragment shader**:

```c
#version 300 es
precision highp float;

uniform sampler2D u_texture;

out vec4 outColor; // you can pick any name

void main() {
	// Get a value from the middle of the texture
	vec2 textCoord = vec2(0.5, 0.5); 
	
	// Use that value as output color 
	outColor = texture(u_texture, texcoord);
}
```

The data we obtain from that texture depends [[Loading a texture|on several factors]]. The minimum procedure is the following:

```js

// Create texture and fill with data

const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);

const level = 0;
const internalFormat = gl.RGBA,
const width = 2;
const height = 1;
const border = 0; // MUST ALWAYS BE ZERO
const format = gl.RGBA;
const type = gl.UNSIGNED_BYTE;
const data = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]);

gl.texImage2D(
	gl.TEXTURE_2D,
	level,
	internalFormat,
	width,
	height,
	border,
	format,
	type,
	data
);

// Set the filtering

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

// Get its location

const someSamplerLoc = gl.getUniformLocation(someProgram, "u_texture");

// Bind it to a texture unit

const unit = 5; // Pick some texture unit
gl.activeTexture(gl.TEXTURE0 + unit);
gl.bindTexture(gl.TEXTURE_2D, tex);

// Tell the shader which unit we bound the texture to

gl.uniform1i(someSamplerLoc, unit);

```


# Uniforms

See [[Vertex shader#Uniforms|uniforms in vertex shaders]]. 