By default all transformations are done from the origin (0, 0). However, we can define a center of gravity for the object from which all transformations will be applied. This can be done by simply:

1. Move the object one offset before applying linear transformations (e.g. scale and rotation). 
2. Apply the transformations
3. Undo the initial transformation. 
 
In this way all transformations will be applied at the chosen point (e.g. the geometric center of the object) and not at the origin. To undo the offset transformation just calculate its [[Matrices in JavaScript#Inverse 3x3|inverse matrices]]. 

# 2D

We are using this [[Matrices in JavaScript#Product 3x3 matrices|matrix product]], and the transformations are applied from right to left. Therefore, the order of application is: `halfPositionTransform`, `scale`, `rotation`, `inverseHalfTranslationTransform` and finally `translation`.

```js
const { translation, rotation, scale } = transformation;

  
// Set origin of transformations in -60, -60
const halfPositionTransform = [
  1, 0, 0,
  0, 1, 0,
 -60, -60, 1
];

const inverseHalfTranslationTransform = invertMatrix3([
  ...halfPositionTransform,
]);

const result = multiplyManyMatrix3(
  translation,
  inverseHalfTranslationTransform,
  rotation,
  scale,
  halfPositionTransform
);

// Update transformation
const location = gl.getUniformLocation(program, "u_transformation");
gl.uniformMatrix3fv(location, false, result);
```

# 3D

In 3D this transformation to local coordinates is identical, but working with 4x4 matrices and [[3D transformations|3D transformations]].

```js
 const { 
	 translation, 
	 rotationX, 
	 rotationY, 
	 rotationZ, 
	 scale 
 } = transformation;
  
  // Set origin of transformations in -60, -60
  const halfPositionTransform = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -60, -60, 0, 1
  ];
  
  const inverseHalfTranslationTransform = invertMatrix4([
    ...halfPositionTransform,
  ]);
  
  const clipSpaceConversion = getClipSpaceMatrix4();
  
  const result = multiplyManyMatrix4(
    clipSpaceConversion,
    translation,
    inverseHalfTranslationTransform,
    rotationX,
    rotationY,
    rotationZ,
    scale,
    halfPositionTransform
  );
  
  // Update transformation
  const location = gl.getUniformLocation(program, "u_transformation");
  gl.uniformMatrix4fv(location, false, result);
```