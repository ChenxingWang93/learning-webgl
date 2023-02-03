**VAOs** or **Vertex Array Objects** are a feature of WebGL2. In a nutshell, it's a way of telling WebGL what geometry we want to render.

When we are setting up a geometry in WebGL, the workflow is the following:

```js
// Create a new vao 
const vao = createVertexArray(); 
bindVertexArray(vao); forced to use indexed elements, but we can ;) 

// For each attribute (e.g. each of normal, color, whatever):
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());    

// Or bind manually:
const loc = gl.getAttribLocation(program, aName) 

gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());      gl.bufferData(gl.ARRAY_BUFFER, someData, gl.STATIC_DRAW);  
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, someData, gl.STATIC_DRAW);
gl.vertexAttribPointer(loc,size,type,normalized,stride,offset);  
gl.enableVertexAttribArray(loc);

// After repeating the above block for each attribute, deselect the vao
// not required, but considered good practice

bindVertexArray(null); 
```

Now, when we want to render that geometry, we can do this:

```js
// Not even necessary if it's already bound  
bindVertexArray(vao);

// Or drawArrays
gl.drawElements(...)
```

>This is it! In WebGL 1 this was very verbose. In WebGL2 this is a great way of binding the attributes of the geometry to WebGL super easily, making the scenes with multiple geometries way easier.