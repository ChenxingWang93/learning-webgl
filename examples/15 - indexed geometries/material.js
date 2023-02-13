export class Material {
  shaders;
  program;
  gl;

  color;

  constructor(gl, color = [0.2, 1, 0.2, 1]) {
    this.gl = gl;
    this.color = color;
    this.shaders = [
      [gl.VERTEX_SHADER, "./shaders/vertex.glsl"],
      [gl.FRAGMENT_SHADER, "./shaders/fragment.glsl"],
    ];
  }

  async init() {
    this.program = this.gl.createProgram();

    for (const shader of this.shaders) {
      await this.createShader(...shader);
    }

    this.linkAndUseProgram();
  }

  prepareToRender() {
    this.gl.useProgram(this.program);
    this.updateUniforms();
  }

  linkAndUseProgram() {
    this.gl.linkProgram(this.program);
    const status = this.gl.LINK_STATUS;
    const success = this.gl.getProgramParameter(this.program, status);
    if (success) {
      this.gl.useProgram(this.program);
    } else {
      // If there's an error, log it
      console.log(this.gl.getProgramInfoLog(this.program));
      this.gl.deleteProgram(this.program);
    }
  }

  async createShader(type, path) {
    const source = await this.getShaderSource(path);
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    this.attachShader(shader);
  }

  attachShader(shader) {
    const status = this.gl.COMPILE_STATUS;
    const success = this.gl.getShaderParameter(shader, status);
    if (success) {
      this.gl.attachShader(this.program, shader);
    } else {
      console.log(this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
    }
  }

  async getShaderSource(path) {
    const response = await fetch(path);
    return await response.text();
  }

  updateUniforms() {
    const location = this.gl.getUniformLocation(this.program, "u_color");
    const [x, y, z] = this.color;
    this.gl.uniform4f(location, x, y, z, 1);
  }
}
