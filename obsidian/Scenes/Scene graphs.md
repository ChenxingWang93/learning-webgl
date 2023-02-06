Scene graphs are a hierarchical way of representing the items in a scene. The idea is simple: each object can have many **children**, but just one **parent**. The transformation of a parent affects all of its children, but the transformations of the children have no effect on the parent. Try interacting with this diagram:

<iframe class="webgl_example " style="width: 400px; height: 500px;" src="https://webgl2fundamentals.org//webgl/lessons/resources/planet-diagram.html"></iframe>

In a scene graph, each object must have 2 properties: its **local transformation**, and a **reference to its parent**. When drawing that item in the scene, we'll need to take the transformations of all the parents into account recursively: that's called **global transformation**. For instance, in the diagram above:

```js
centerLocal * milkyWayLocal = alphaCentauryGlobalTransformation
```
 
>Remember that **order matters**. Transformation matrices are applied from right to left, and therefore we need to apply the transformation from the bottom to the top of the scene graph.

Implementing this in JS is quite easy if we store the local transform of each item in the scene. We can update the global transformation like this:

```js
  updateTransform() {
    const translation = newTranslation(this.position);
    const rotationX = newRotationX(this.rotation.x);
    const rotationY = newRotationY(this.rotation.y);
    const rotationZ = newRotationZ(this.rotation.z);
    const scale = newScale(this.scale);
    const center = this.geometry.getCenter()
    const inverseCenter = invertMatrix4([...center]);

    this.localTransformation = multiplyManyMatrix4(
      translation,
      inverseCenter,
      rotationX,
      rotationY,
      rotationZ,
      scale,
      center
    );

    const parentTransforms = this.getParentLocalTransforms();
    this.transformation = multiplyManyMatrix4(
      ...parentTransforms,
      this.localTransformation
    );
  }

  getParentLocalTransforms() {
    const transforms = [];
    if (this.parent) {
      let parent = this.parent;
      while (parent !== undefined) {
        transforms.unshift(parent.localTransformation);
        parent = parent.parent
      }
    }
    return transforms;
  }
```