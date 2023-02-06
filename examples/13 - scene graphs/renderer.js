export class Renderer {
  gl;
  primitiveType;
  offset = 0;

  constructor(canvas) {
    this.initializeWebGL(canvas);
  }

  render(scene, camera) {
    this.enableDepthTestAndCulling();
    this.setClipspaceToViewportConversion();
    this.clearCanvasAndZBuffer();
    for (const mesh of scene.children) {
      camera.prepareToRender(this.gl);
      mesh.prepareToRender(camera.matrix);
      this.setupLights(scene, mesh);
      this.draw(mesh, camera);
    }
  }

  setupLights(scene, mesh) {
    const { gl, program } = mesh.material;
    for (const light of scene.lights) {
      light.prepareToRender(gl, program);
    }
  }

  draw(mesh) {
    const count = mesh.geometry.size;
    this.gl.drawArrays(this.primitiveType, this.offset, count);
  }

  initializeWebGL(canvas) {
    this.gl = canvas.getContext("webgl2");
    if (!this.gl) {
      throw new Error("You do not support webgl2!");
    }
    this.gl.clearColor(0, 0, 0, 0);
    this.primitiveType = this.gl.TRIANGLES;
  }

  clearCanvasAndZBuffer() {
    const mode = this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT;
    this.gl.clear(mode);
  }

  enableDepthTestAndCulling() {
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
  }

  setClipspaceToViewportConversion() {
    const canvas = this.gl.canvas;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }
}
