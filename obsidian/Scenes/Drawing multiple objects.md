
WebGL is really simple: it has a function that draws stuff, and 70+ functions that set up the state of WebGL before drawing. Any WebGL program follows the following structure:

___

**AT INIT TIME**

- Create all **shaders** and **programs** and get all the **locations**.
- Create at least a vertex array per each geometry we want to draw. We could also create other arrays (e.g. for the normals).
- Create all **buffers**, and for each one:
	- Call `gl.bindBuffer`.
	- Call `gl.vertexAttribPointer`.
	- Call `gl.enableVertexAttribArray`.
- Create textures and give their data to WebGL.

___

**AT RENDER TIME**

- Clear and set the viewport and other global state (e.g. [[Depth buffer|depth testing]], [[Backface culling|culling]], etc).
- For each thing we want to draw:
	- Call `gl.useProgram` for the program that has the shaders of this thing.
	- Bind the vertex array for the thing with `gl.bindVertexArray`.
	- Set up the **uniforms** for the thing with:
		- `gl.uniformXXXXX` (e.g. `gl.uniform3fv`).
		- `gl.activeTexture` and `gl.bindTexture` to assign textures to texture units.
	- Call `gl.drawArrays` or `gl.drawElements`.

___

This is it. It is up to us to organize the code to make all of this. The only caveat is that some things (like getting the texture data) might happen asynchronously because we need to wait for them to download from the server.

