import {
  multiplyManyMatrix4,
  newRotationX,
  newRotationY,
  newRotationZ,
  newScale,
  newTranslation,
} from "./math.js";

export class Mesh {
  geometry;
  material;

  // prettier-ignore
  transformation = [
    1, 0, 0, 0,  
    0, 1, 0, 0, 
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  position = { x: 0, y: 0, z: 0 };
  rotation = { x: 0, y: 0, z: 0 };
  scale = { x: 1, y: 1, z: 1 };

  constructor(geometry, material) {
    this.gl = geometry.gl;
    this.geometry = geometry;
    this.material = material;
    geometry.setupAttributes(material);
  }

  setPosition(x, y, z) {
    this.position = { x, y, z };
    this.updateTransform();
  }

  setRotationX(angle) {
    this.rotation.x = angle;
    this.updateTransform();
  }

  setRotationY(angle) {
    this.rotation.y = angle;
    this.updateTransform();
  }

  setRotationZ(angle) {
    this.rotation.z = angle;
    this.updateTransform();
  }

  prepareToRender(clipspaceMatrix) {
    this.material.prepareToRender();
    this.geometry.prepareToRender();
    this.updateUniforms(clipspaceMatrix);
  }

  updateTransform() {
    const translation = newTranslation(this.position);
    const rotationX = newRotationX(this.rotation.x);
    const rotationY = newRotationY(this.rotation.y);
    const rotationZ = newRotationZ(this.rotation.z);
    const scale = newScale(this.scale);

    this.transformation = multiplyManyMatrix4(
      translation,
      rotationX,
      rotationY,
      rotationZ,
      scale
    );
  }

  updateUniforms(clipspaceMatrix) {
    const program = this.material.program;
    const result = multiplyManyMatrix4(clipspaceMatrix, this.transformation);
    const location = this.gl.getUniformLocation(program, "u_transformation");
    this.gl.uniformMatrix4fv(location, false, result);
  }
}
