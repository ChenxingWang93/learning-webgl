We have seen that [[Clip space projection#3D perspective|perspective in WebGL]] is the opposite to perspective in the real world; we literally scale down geometry in the $Z$ axis. Cameras work similarly: instead of moving around a camera in our 3D world, we will move the world around a static camera. Why? Because the math is much simpler!

The easiest way to do this is to use the **inverse matrix**. Knowing that [[Introduction to transformations|the inverse of a transformation matrix is the opposite transformation]], we can apply the inverse of the transformation of the camera to the world, and the result will be exactly the same as if we moved the camera. 

```
This can sound counfusing at first, but it's really easy: moving the camera 30 units in X looks exactly the same as moving the entire world but the camera -30 units in X.
```

The inverse matrix of the camera transformation is called **view matrix**, because it's the matrix that define the point of view of the camera. We can apply it to the rest of transformation matrices just like this. Remember that **the order matters**, and the camera transformation should be after the geometries transformations (transformations are applied from right to left).

```js
const camera = {
  setPosition: (x, y, z) => {
    camera.translation = [
      1, 0, 0, 0,  
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]
  },
};

camera.setPosition(0, 0, 0);

// Geometry transformation

const { translation, rotationX, rotationY, rotationZ, scale } =
  transformation;

// View matrix

const cameraTranslation = camera.translation;
const viewMatrix = invertMatrix4(cameraTranslation);

// Projection matrix

const fovInRadians = (data.fieldOfView * Math.PI) / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 1;
const zFar = 2000;
const clipSpaceConversion = getClipSpaceMatrix4Perspective(
  fovInRadians,
  aspect,
  zNear,
  zFar
);
  
const result = multiplyManyMatrix4(
  clipSpaceConversion,
  viewMatrix,
  translation,
  rotationX,
  rotationY,
  rotationZ,
  scale,
);

// Update transformation

const location = gl.getUniformLocation(program, "u_transformation");
gl.uniformMatrix4fv(location, false, result);

```

This already allows us to move the camera around just like any other object. But we still have one problem: making the camera look in a specific direction is rather complex. 

>For instance, let's imagine that the camera is following a character in movement. Making the camera **target** the character at every frame could be very complex. Fortunately for us, there is an easy way to make this with math.

To start with, we will need the **camera position** and the **target position**. We will asume that the camera is always [[Clip space projection#3D perspective|looking in the -z direction]], so if we subtract the **target** from the **camera position**, we'll get a vector that points in the direction we need. If we [[Operations in JavaScript#Vector normalization|normalize]] that vector, we'll get a unit vector called $Z$, which is the $Z$ component of the transformation matrix of the camera.


$T =\begin{bmatrix} ? & ? & ? & ? \\  ? &  ? &  ? & ? \\  Z_x &   Z_y &  Z_z & ? \\ ? & ? & ? & ? \end{bmatrix}$


<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/cross-product-diagram.html?mode=0"></iframe>

Of course, this is not enough to determine the orientation of the camera; we still need $X$ and $Y$. Getting $X$ is quite easy, because we can just compute the [[Operations in JavaScript#Vector cross product|cross product]] of $Z$ and a unit vector pointing up and normalize it. 


<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/cross-product-diagram.html?mode=1"></iframe>

Now we can just get $Y$ by making the **cross product** between $Z$ and $X$. There's no need to normalize because $Z$ and $Y$ are perpendicular, so the result will already have module 1.

<iframe style="width: 400px; height: 300px;" src="https://webgl2fundamentals.org/webgl/lessons/resources/cross-product-diagram.html?mode=2"></iframe>

Now we have all that we need to construct a matrix that describes the orientation of the camera looking at the **target**. If we add the [[3D Transformations|translation of the camera]], we'll have the full transformation matrix of the camera.

$T =\begin{bmatrix} X_x & X_y & X_z & 0 \\  Y_x &  Y_y &  Y_z & 0 \\  Z_x &   Z_y &  Z_z & 0 \\ T_x & T_y & T_z & 1 \end{bmatrix}$

We can compute this matrix like this:

```js
function lookAt(cameraPosition, target) {
	const up = [0, 1, 0];
	const zAxis = normalize(subtractVectors(cameraPosition, target));
	const xAxis = normalize(cross(up, zAxis));
	const yAxis = normalize(cross(zAxis, xAxis));
	return [
		xAxis[0], xAxis[1], xAxis[2], 0,
		yAxis[0], yAxis[1], yAxis[2], 0,
		zAxis[0], zAxis[1], zAxis[2], 0,
		cameraPosition[0],
		cameraPosition[1],
		cameraPosition[2],
		1,
	];
}
```

And we can use it like this:

```js
// Geometry transformation

const { translation, rotationX, rotationY, rotationZ, scale } = transformation;

// View matrix

const cameraTranslation = lookAt([
	data.xTranslationCamera, 
	data.yTranslationCamera, 
	data.zTranslationCamera],
	[0, 0, 0]
);

const viewMatrix = invertMatrix4(cameraTranslation);

// Projection matrix

const fovInRadians = (data.fieldOfView * Math.PI) / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 1;
const zFar = 2000;
const clipSpaceConversion = getClipSpaceMatrix4Perspective(
	  fovInRadians,
	  aspect,
	  zNear,
	  zFar
);

const result = multiplyManyMatrix4(
	clipSpaceConversion,
	viewMatrix,
	translation,
	rotationX,
	rotationY,
	rotationZ,
	scale,
);

// Update transformation

const location = gl.getUniformLocation(program, "u_transformation");
gl.uniformMatrix4fv(location, false, result);
```


>The **lookAt** function can be useful for other things: making the head of a character look at another character, making a weapon target something, etc. 

<iframe style="width: 500px; height: 350px;" src="https://webgl2fundamentals.org/webgl/webgl-3d-camera-look-at-heads.html"></iframe>