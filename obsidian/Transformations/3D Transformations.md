A 3D transformation matrix looks like this:
$$\begin{bmatrix} a_{11} & a_{12} & a_{13} & a_{14} \\ a_{21} & a_{22} & a_{23} & a_{24} \\ a_{31} & a_{32} & a_{33} & a_{34} \\ a_{41} & a_{42} & a_{43} & a_{44} \end{bmatrix}$$

For example, the **translation matrix** is defined as: 

$$T =\begin{bmatrix} 1 & 0 & 0 & 0 \\  0 &  1 &  0 & 0 \\  0 &   0 &  1 & 0 \\ t_x & t_y & t_z & 1 \end{bmatrix}$$

Analogously, the **rotation matrices** in $(x,y,z)$ are:

$$R_x = \begin{bmatrix} 1 & 0 & 0 & 0 \\  0 &  \cos(\theta) &  \sin(\theta) & 0 \\  0 &  -\sin(\theta) &  \cos(\theta) & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$
$$R_y =\begin{bmatrix} \cos(\theta) & 0 & -\sin(\theta) & 0 \\  0 &  1 &  0 & 0 \\  \sin(\theta) &  0 & \cos(\theta) & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$
$$R_z = \begin{bmatrix} \cos(\theta) & \sin(\theta) & 0 & 0 \\ -\sin(\theta) &  \cos(\theta) &  0 & 0 \\ 0 &  0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$


Finally, the **scale matrix** is:
$$S = \begin{bmatrix} s_x & 0 & 0 & 0 \\  0 &  s_y &  0 & 0 \\  0 & 0 &  s_z & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

If an object has no transformation, its transformation is the 4x4 **identity matrix**.

$$\begin{bmatrix} 1 & 0 & 0 & 0 \\  0 &  1 &  0 & 0 \\  0 & 0 &  1 & 0 \\  0 & 0 & 0 &  1 \end{bmatrix}$$

Putting this into practice is very simple. First, we have to create an object to store the position, rotation and scale matrices:

```js
const transformation = {
  setPosition: (x, y, z) => {
    // prettier-ignore
    transformation.translation = [
      1, 0, 0, 0,  
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]
  },
  
  setRotationX: (r) => {
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    // prettier-ignore
    transformation.rotation = [
      1,  0,    0,    0,  
      0,  cos,  sin, 0,
      0,  -sin, cos,  0,
      0,  0,    0,    1
    ]
  },
  
  setRotationY: (r) => {
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    // prettier-ignore
    transformation.rotation = [
      cos,  0,  -sin,  0,  
      0,    1,  0,    0,
      sin, 0,   cos,  0,
      0,    0,  0,    1
    ]
  },
  
  setRotationZ: (r) => {
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    // prettier-ignore
    transformation.rotation = [
      cos,  sin,  0, 0,  
      -sin, cos,  0, 0,
      0,    0,    1, 0,
      0,    0,    0, 1
    ]
  },
  
  setScale: (x, y, z) => {
    // prettier-ignore
    transformation.scale = [
      x, 0, 0, 0,  
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]
  },
};
```

Now we can determine the position, rotation and scale of the geometry as follows:

```js
transformation.setPosition(0, 0, 0);
transformation.setRotationX(0);
transformation.setRotationY(0);
transformation.setRotationZ(0);
transformation.setScale(1, 1, 1);
```

All geometry buffers we work with now must have 3 coordinates per vertex $(x,y,z)$:

```c
// Tell the attribute how to get data out of positionBuffer
gl.vertexAttribPointer(
	posAttrLocation,
	3, // 3 components per iteration
	gl.FLOAT, // the data is 32bit floats
	false, // normalize = false: don't normalize the data
	0, // stride = 0: move forward size * sizeof(type) each iteration
	0 // offset = 0: start at the beginning of the buffer
);
```

Next we are going to define an **uniform** in the vertex shader to apply the transformation to the geometry. 

```c
#version 300 es
  
// An attribute will receive data from a buffer
in vec4 a_position;
  
// Transformation matrix
uniform mat4 u_transformation;
  
// All shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = u_transformation * a_position;
}
```

Now we just have to make sure to calculate the total transformation with the [[Operations in JavaScript#Matrix operations in JavaScript#Matrix product 4x4|matrix product]] and update the `uniforms` before rendering. Remember that the transformations are performed from right to left (the same way as it would happen in WebGL). That is to say, the order is: `scale`, `rotationZ`, `rotationY`, `rotationX` and finally `translation`.

```js
// Compute transformation
const { 
	translation, 
	rotationX, 
	rotationY, 
	rotationZ, 
	scale 
} = transformation;

const result = multiplyManyMatrix4(
	translation, 
	rotationX,
	rotationY,
	rotationZ,
	scale
);

// Update transformation
const location = gl.getUniformLocation(program, "u_transformation");
gl.uniformMatrix4fv(location, false, result);
```
