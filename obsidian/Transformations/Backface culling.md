When implementing 3D geometry, we may find that some faces that should be visible are invisible.

>Triangles in webGL have the concept of frontface and backface.  WebGL draws only the front faces: this is called **backface culling**. The word **culling** means "to hide".

How does WebGL know how to distinguish between back and front faces? By default, triangles have their front face vertices defined **anti-clockwise**.
<div style="margin: 2rem; display: flex; display: flex; justify-content: center;">
<img width="300px" src="https://webgl2fundamentals.org/webgl/lessons/resources/triangle-winding.svg">
</div>

Beware, because webGL evaluates the direction of a triangular face after having applied the transformations and taken it to the **clip space**. It is logical: if we rotate a triangle 180 degrees on the vertical axis, we want to see its back face. This also happens if we scale a face by a negative value.

___

WebGL can be configured to draw only the back faces:

```c
gl.enable(gl.CULL_FACE);
```


