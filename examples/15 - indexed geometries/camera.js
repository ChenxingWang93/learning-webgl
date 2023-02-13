import { getClipSpaceMatrix4Perspective } from "./math.js";

export class Camera {
  fieldOfView = 40;
  fovInRadians = (this.fieldOfView * Math.PI) / 180;
  zNear = 1;
  zFar = 2000;
  matrix;
  aspect;

  prepareToRender(gl) {
    this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.matrix = getClipSpaceMatrix4Perspective(
      this.fovInRadians,
      this.aspect,
      this.zNear,
      this.zFar
    );
  }
}
