import { indices, positionData, normalData } from "./buffers.js";

export class CubeGeometry {
  vao;
  gl;
  size = indices.length;
  attributes;
  initialized = false;
  normalData = [];

  constructor(gl) {
    this.gl = gl;
    this.attributes = {
      a_position: {
        size: 3,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
        buffer: new Float32Array(positionData),
      },
      a_normal: {
        size: 3,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
        buffer: new Float32Array(normalData),
      },
    };
  }

  prepareToRender() {
    this.gl.bindVertexArray(this.vao);
  }

  setupAttributes(material) {
    if (this.initialized) return;
    const { gl, program } = material;
    this.createAndSelectVAO();
    this.setupAttribute(gl, program, "a_position");
    this.setupAttribute(gl, program, "a_normal");
    this.setupIndices(gl);
    this.deselectVAO();
    this.initialized = true;
  }

  createAndSelectVAO() {
    if (!this.vao) {
      this.vao = this.gl.createVertexArray();
    }
    this.gl.bindVertexArray(this.vao);
  }

  deselectVAO() {
    this.gl.bindVertexArray(null);
  }

  setupIndices(gl) {
    // create the buffer
    const indexBuffer = gl.createBuffer();

    // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Fill the current element array buffer with data
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );
  }

  setupAttribute(gl, program, name) {
    const data = this.attributes[name];
    const location = gl.getAttribLocation(program, name);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    this.setupAttributePointer(location, data);
  }

  setupAttributePointer(location, data) {
    const { size, type, normalize, stride, offset } = data;
    this.gl.vertexAttribPointer(
      location,
      size,
      type,
      normalize,
      stride,
      offset
    );
  }
}
