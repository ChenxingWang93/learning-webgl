There are 2 basic drawing functions in WebGL: 

- `gl.drawArrays`: We need to define each triangle explicitly. If there are triangles using the same vertices, those vertices will be repeated in the buffer.

- `gl.drawElements`: We can pass a buffer of unique vertices, and then pass an index buffer to determine how triangles are constructed.

Now, to draw indexed geometries we just need to add the index buffer when creating the other buffers for the geometry:

```js
// create the buffer
const indexBuffer = gl.createBuffer();

// make this buffer the current 'ELEMENT_ARRAY_BUFFER'
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

// Fill the current element array buffer with data
const indices = [
	// some data ...
];

gl.bufferData(
	gl.ELEMENT_ARRAY_BUFFER,
	new Uint16Array(indices),
	gl.STATIC_DRAW
);
```

And then just call `drawElements` instead of `drawArrays` when rendering:

```js
const primitiveType = gl.TRIANGLES;
const offset = 0;
const count = 6;
const indexType = gl.UNSIGNED_SHORT;
gl.drawElements(primitiveType, count, indexType, offset);
```

Now, in the example that we developed we can see that the cube seems very strange. What is happening? Easy: the fragment shader is interpolating the normal buffer, and because multiple faces must share the same vertex (and it's associated normal vector), we see the geometry without any hard edge, shaded like a sphere.

>There are [multiple solutions](https://stackoverflow.com/questions/1664402/how-can-i-specify-per-face-colors-when-using-indexed-vertex-arrays-in-opengl-3-x) to this issue. The most common one is to generate new vertices where we need a sharp edge. This sharp edge is called a **seam**.

If we want sharp edges and only define the vertices once we can use techniques like [[Vertex pulling|vertex pulling]].