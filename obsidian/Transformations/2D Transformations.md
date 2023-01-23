A 2D transformation matrix looks like this:
$$\begin{bmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{bmatrix}$$

For example, the **translation matrix** is defined as: 

$$T = \begin{bmatrix} 1 & 0 & 0 \\  0 &  1 &  0 \\  t_x &   t_y &  1 \end{bmatrix}$$

Similarly, the **rotation matrix** is:

$$R = \begin{bmatrix} \cos(\theta) & -\sin(\theta) & 0 \\  \sin(\theta) &  \cos(\theta) &  0 \\  0 &  0 &  1 \end{bmatrix}$$

Finally, the **scale matrix** is:
$$S = \begin{bmatrix} sx & 0 & 0 \\  0 &  sy &  0 \\  0 & 0 &  1 \end{bmatrix}$$


If an object has no transformation, its transformation is the 3x3 **identity matrix**.

$$\begin{bmatrix} 1 & 0 & 0 \\  0 &  1 &  0 \\  0 & 0 &  1 \end{bmatrix}$$

Putting this into practice is very simple. First, we have to create an object to store the position, rotation and scale matrices:

```js
const transformation = {
  setPosition: (x, y) => {
    transformation.translation = [
      1, 0, 0,  
      0, 1, 0,  
      x, y, 1
    ]
  },

  setRotation: (r) => {
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    transformation.rotation = [
      cos,  -sin, 0,  
      sin,  cos,  0,  
      0,    0,    1
    ]
  },

  setScale: (x, y) => {
    transformation.scale = [
      x, 0, 0,  
      0, y, 0,  
      0, 0, 1
    ]
  },
};
```

Now we can determine the position, rotation and scale of the geometry as follows:

```js
transformation.setPosition(0, 0);
transformation.setRotation(0);
transformation.setScale(1, 1);
```

Next we are going to define an **uniforms** in the **vertex shader** to apply the transformation to the geometry. The position attribute `a_position` is of type `vec2`, so we have to convert it to `vec3` before we can apply the transformation. After applying it, we convert it back to `vec2` with the GLSL syntax of `.xy`.

```c
#version 300 es

// An attribute will receive data from a buffer
in vec2 a_position;

// Transformation matrices
uniform mat3 u_transformation;

// ...

void main() {

    // Apply transformation
    vec2 transformed = (u_transformation * vec3(a_position, 1)).xy; 

    // ...

}
```

Now we only have to make sure to calculate the total transformation with the [[Matrix operations in JavaScript#3x3 matrix product|matrix product]] and update the `uniforms` before rendering. Remember that the transformations are performed from right to left (the same way as it would happen in WebGL). That is to say, the order is: `scale`, `rotation` and finally `translation`.

```js
// Compute transformation
const { translation, rotation, scale } = transformation;
const result = multiplyManyMatrix3(translation, rotation, scale);

// Update transformation
const location = gl.getUniformLocation(program, "u_transformation");
gl.uniformMatrix3fv(location, false, result);
```

