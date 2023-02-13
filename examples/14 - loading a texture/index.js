import { getGlAndProgram } from "./gl-program.js";

const image = new Image();
image.src = "./leaves.jpg";
image.onload = () => {
  main();
};

async function main() {
  const { gl, program } = await getGlAndProgram();
  setupVAO(gl);
  setupRectangle(gl, program);
  setupTextureCoords(gl, program);
  setupTexture(gl, program);
  setupKernel(gl, program);
  clearCanvas(gl);
  setupSizing(gl);
  setupResolution(gl, program);
  render(gl);
}

function setupKernel(gl, program) {
  const kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  const kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

  // prettier-ignore
  const edgeDetectKernel = [
    -1, -1, -1,
    -1,  8, -1,
    -1, -1, -1
  ];

  const weight = computeKernelWeight(edgeDetectKernel);

  gl.uniform1fv(kernelLocation, edgeDetectKernel);
  gl.uniform1f(kernelWeightLocation, weight);
}

function computeKernelWeight(kernel) {
  const weight = kernel.reduce(function (prev, curr) {
    return prev + curr;
  });
  return weight <= 0 ? 1 : weight;
}

function setupSizing(gl) {
  const width = gl.canvas.clientWidth;
  const height = gl.canvas.clientHeight;
  gl.canvas.width = width;
  gl.canvas.height = height;

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function setupVAO(gl) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
}

function render(gl) {
  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function clearCanvas(gl) {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function setupResolution(gl, program) {
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
}

function setupTexture(gl, program) {
  const imageLocation = gl.getUniformLocation(program, "u_image");

  // Create a texture.
  const texture = gl.createTexture();

  // make unit 0 the active texture uint
  // (ie, the unit all other texture commands will affect
  gl.activeTexture(gl.TEXTURE0);

  // Bind it to texture unit 0' 2D bind point
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we don't need mips and so we're not filtering
  // and we don't repeat at the edges
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  const mipLevel = 0; // the largest mip
  const internalFormat = gl.RGBA; // format we want in the texture
  const srcFormat = gl.RGBA; // format of data we are supplying
  const srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image
  );

  // Tell the shader to get the texture from texture unit 0
  gl.uniform1i(imageLocation, 0);
}

function setupRectangle(gl, program) {
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put a single pixel space rectangle in
  // it (2 triangles)
  const positionBuffer = gl.createBuffer();

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, image.width, image.height);
}

function setupTextureCoords(gl, program) {
  const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // prettier-ignore
  const textureCoordData = new Float32Array([
    0.0, 0.0, 
    1.0, 0.0, 
    0.0, 1.0, 
    0.0, 1.0, 
    1.0, 0.0, 
    1.0, 1.0,
  ])

  gl.bufferData(gl.ARRAY_BUFFER, textureCoordData, gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(texCoordAttributeLocation);

  // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
  const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    texCoordAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );
}

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  // prettier-ignore
  const vertexData = new Float32Array([
    x1, y1, 
    x2, y1, 
    x1, y2, 
    x1, y2, 
    x2, y1, 
    x2, y2
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
}
