import { normalize } from "./math.js";

export class DirectionalLight {
  direction = [];

  constructor() {
    this.direction = normalize([0.5, -0.7, -1]);
  }

  prepareToRender(gl, program) {
    const location = gl.getUniformLocation(program, "u_reverseLightDirection");
    gl.uniform3fv(location, this.direction);
  }
}
