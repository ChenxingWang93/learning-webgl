In some cases we will see back faces rendered on top of front faces.

![[Pasted image 20220102202301.png]]

In this case there are 2 problems: the [[Backface culling|normals]] of the geometry are not right, and the **depth buffer** is not set. The faces of the geometry are drawn in the order in which they are defined in the **buffer** of the geometry. This causes some of the back faces to be drawn over the front faces:
<div style="margin: 2rem; display: flex; display: flex; justify-content: center;">
<img width="300px" src="https://webgl2fundamentals.org/webgl/lessons/resources/polygon-drawing-order.gif">
</div>
>A **depth buffer** or **z-buffer** is an image analogous to the one we are rendering, but instead of representing the color, it represents its depth (**depth**). 

WebGL can draw a depth pixel for each color pixel based on the data received from the **vertex shader**. If at some point you have to overwrite a previously drawn pixel, you can use the **z-buffer** to determine which pixel is ahead. We can easily activate the **z-buffer**:

```js
gl.enable(gl.DEPTH_TEST);
```

Now we will have to reset the **depth buffer** as well as the canvas before rendering:

```js
function clearCanvasAndZBuffer() {
  const { gl } = globals;
  gl.clearColor(0, 0, 0, 0);
  
  // Clear the canvas AND the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
```

![[Pasted image 20220105102043.png]]