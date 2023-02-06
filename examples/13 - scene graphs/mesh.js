import {
  invertMatrix4,
  multiplyManyMatrix4,
  multiplyMatrix4,
  newRotationX,
  newRotationY,
  newRotationZ,
  newScale,
  newTranslation,
  transposeMatrix4,
} from "./math.js";

export class Mesh {
  geometry;
  material;
  parent;

  // prettier-ignore
  transformation = [
    1, 0, 0, 0,  
    0, 1, 0, 0, 
    0, 0, 1, 0,
    0, 0, 0, 1
  ];

  // prettier-ignore
  localTransformation = [
    1, 0, 0, 0,  
    0, 1, 0, 0, 
    0, 0, 1, 0,
    0, 0, 0, 1
  ];

  position = { x: 0, y: 0, z: 0 };
  rotation = { x: 0, y: 0, z: 0 };
  scale = { x: 1, y: 1, z: 1 };

  constructor(geometry, material) {
    this.gl = geometry.gl;
    this.geometry = geometry;
    this.material = material;
    geometry.setupAttributes(material);
  }

  addChild(mesh) {
    mesh.parent = this;
  }

  prepareToRender(clipspaceMatrix) {
    this.material.prepareToRender();
    this.geometry.prepareToRender();
    this.updateTransform();
    this.updateUniforms(clipspaceMatrix);
  }

  updateTransform() {
    const translation = newTranslation(this.position);
    const rotationX = newRotationX(this.rotation.x);
    const rotationY = newRotationY(this.rotation.y);
    const rotationZ = newRotationZ(this.rotation.z);
    const scale = newScale(this.scale);
    const center = this.geometry.getCenter();
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
        parent = parent.parent;
      }
    }
    return transforms;
  }

  updateUniforms(clipspaceMatrix) {
    this.updateTransformUniform(clipspaceMatrix);
    this.updateNormalUniform();
  }

  updateTransformUniform(clipspaceMatrix) {
    const program = this.material.program;
    const result = multiplyManyMatrix4(clipspaceMatrix, this.transformation);
    const location = this.gl.getUniformLocation(
      program,
      "u_worldViewProjection"
    );
    this.gl.uniformMatrix4fv(location, false, result);
  }

  updateNormalUniform() {
    const program = this.material.program;
    const inverse = invertMatrix4([...this.transformation]);
    const inverseTransposed = transposeMatrix4(inverse);
    const witLocation = this.gl.getUniformLocation(
      program,
      "u_worldInverseTranspose"
    );
    this.gl.uniformMatrix4fv(witLocation, false, inverseTransposed);
  }
}
