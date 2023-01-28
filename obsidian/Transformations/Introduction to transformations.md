
Transformations are a complex subject, but luckily we can use mathematical tools to make them very simple. Specifically, it is very convenient to use **matrices** to work with transformations easily.

>In webGL and openGL ES arrays are not like mathematical arrays. They are declared as an array, and the elements are listed column by column, instead of row by row. For example:

$$A=\begin{bmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33}  \end{bmatrix}$$
```js
const A = [
	a11, a21, a31,
	a12, a22, a33,
	a13, a22, a33
];
```

Its fundamental advantage is that we can express any transformation (position, rotation, scale, etc) and we can apply multiple consecutive transformations using the **matrix product**. This makes it very easy to define [[Local coordinates|local coordinates]], [[Nesting|nest geometries]], etc. Several points to note about transformation matrices:

> **3x3** matrices are used in 2D, while **4x4** matrices are used for 3D.

>**The order of the factors matters**. The matrix product is not commutative. This makes sense: for example, it is not the same to first rotate and then scale, than to do it the other way around. **The order of application of the transformations is from right to left**. 
>
>> If an object has a transformation `A` and we want to apply a transformation `T` to it, the product will be `T * A`.
>
>>If an object has a transformation `A` and we want to apply two transformations to it (`T1` and `T2`) by doing `T2 * T1 * A`, we will be applying first `T1` and then `T2`.

>The matrix identity represents the non-transformation. It makes sense, because the product of any matrix by the identity is itself.

>The inverse of a matrix means the same as applying the opposite transformation. The product of a matrix by its inverse is the matrix identity, just as applying one transformation and the inverse is like applying no transformation at all.

>Since applying transformations in WebGL is nothing more than multiplying matrices, we can do it in 2 ways: in the JS code or in the **vertex shader**. The latter is usually the most scalable when performing operations to all vertices of a geometry because the calculation is done by the GPU. A common practice is to compute the **total transformation** for an item in JS (translation + rotation + scale + ...) and pass that it to the **vertex shader** so that it applies it to each vertex. The **total transformation** is computed in JS because it's the same for all the vertices, so it wouldn't make sense to make that calculation in the **vertex shader** (which runs one per vertex).

>Matrices in WebGL (and OpenGL) are different from mathematical matrices. For example, in WebGL a 2d translation matrix in WebGL and in mathematics are like this, respectively:
>
>$\begin{bmatrix} 1 & 0 & 0 \\  0 &  1 &  0 \\  t_x &   t_y &  1 \end{bmatrix}$ $\begin{bmatrix} 1 & 0 & t_x \\  0 &  1 &  t_y \\  0 &   0 &  1 \end{bmatrix}$

>The most common matrices in graphics usually have a standard name:
>
>>**World matrix / Model matrix**: the transformation of an object in world space; that is, applying the transformation of all the [[Nesting|parents]].
>
>>**Local matrix**: the transformation of an object without having the transformation of the [[Nesting|parent]] into account.
>
>>**Camera matrix**: the transformation of the [[Cameras|camera]] in the world. In other words: the **world matrix** for the camera.
>
>>**View matrix**: the inverse of the **camera matrix**. It's [[Cameras|applied to the scene]] to simulate the transformation of the camera.
>
>>**Projection matrix**: a matrix that makes the conversion from a scene space into [[Clip space projection|clip space]].
