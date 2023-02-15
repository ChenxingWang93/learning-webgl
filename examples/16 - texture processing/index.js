import { getGlAndProgram } from "./gl-program.js";
import { effectsToApply, kernels } from "./kernels.js";

const { gl, program } = await getGlAndProgram();

const image = new Image();
image.src = "./leaves.jpg";

image.onload = function () {
  setupVertices(gl, program);
  setupTextureCoords(gl, program);
  setupResolution();
  setupSizing();
  const mainTexture = setupOriginalTexture();
  const { textures, framebuffers } = setupFramebuffers();
  render(mainTexture, textures, framebuffers);
};

function render(mainTexture, textures, framebuffers) {
  clearCanvas();
  selectMainTexture(mainTexture);
  flipImagesY(false);
  applyAllEffects(framebuffers, textures);
  flipImagesY(true);
  selectFramebuffer(null, gl.canvas.width, gl.canvas.height);
  clearCanvas();
  drawWithKernel("normal");
}

function selectMainTexture(mainTexture) {
  // The input to the process is the main texture
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, mainTexture);
  // Tell the shader to get the texture from texture unit 0
  const attribLoc = gl.getUniformLocation(program, "u_image");
  gl.uniform1i(attribLoc, 0);
}

function flipImagesY(flip) {
  var flipYLocation = gl.getUniformLocation(program, "u_flipY");
  const value = flip ? -1 : 1;
  gl.uniform1f(flipYLocation, value);
}

function applyAllEffects(framebuffers, textures) {
  let count = 0;
  for (const effect of effectsToApply) {
    const currentFrameBuffer = framebuffers[count % 2];
    selectFramebuffer(currentFrameBuffer, image.width, image.height);
    drawWithKernel(effect);
    // for the next draw, use the texture we just rendered to as input
    const result = textures[count % 2];
    gl.bindTexture(gl.TEXTURE_2D, result);
    count++;
  }
}

function setupFramebuffers() {
  const textures = [];
  const framebuffers = [];
  for (let i = 0; i < 2; ++i) {
    createFrameBuffer(framebuffers, textures);
  }
  return { textures, framebuffers };
}

function createFrameBuffer(framebuffers, textures) {
  const mipLevel = 0;
  const texture = createTexture(gl);
  textures.push(texture);
  setupFrameBufferTexture(mipLevel);

  const fbo = gl.createFramebuffer();
  framebuffers.push(fbo);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  attachTextureToFramebuffer(texture, mipLevel);
}

function attachTextureToFramebuffer(texture, mipLevel) {
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    attachmentPoint,
    gl.TEXTURE_2D,
    texture,
    mipLevel
  );
}

function setupFrameBufferTexture(mipLevel) {
  // make the texture the same size as the image
  const internalFormat = gl.RGBA; // format we want in the texture
  const border = 0; // must be 0
  const srcFormat = gl.RGBA; // format of data we are supplying
  const srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
  const data = null; // no data = create a blank texture
  gl.texImage2D(
    gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    image.width,
    image.height,
    border,
    srcFormat,
    srcType,
    data
  );
}

function setupOriginalTexture() {
  const texture = createTexture(gl);
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
  return texture;
}

function selectFramebuffer(fbo, width, height) {
  // make this the framebuffer we are rendering to.
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  // Tell the shader the resolution of the framebuffer.
  const attribLoc = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(attribLoc, width, height);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, width, height);
}

function drawWithKernel(name) {
  var kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  var kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

  // set the kernel and it's weight
  gl.uniform1fv(kernelLocation, kernels[name]);
  const weight = computeKernelWeight(kernels[name]);
  gl.uniform1f(kernelWeightLocation, weight);

  // Draw the rectangle
  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function computeKernelWeight(kernel) {
  const weight = kernel.reduce(function (prev, curr) {
    return prev + curr;
  });
  return weight <= 0 ? 1 : weight;
}

function createTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set up texture so we can render any size image and so we are
  // working with pixels.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

function setupVertices(gl, program) {
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const positionBuffer = gl.createBuffer();
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setRectangle(gl, 0, 0, image.width, image.height);
}

function setupTextureCoords(gl, program) {
  const attribLoc = gl.getAttribLocation(program, "a_texCoord");

  // prettier-ignore
  const textureCoords = new Float32Array([
    0.0, 0.0, 
    1.0, 0.0, 
    0.0, 1.0, 
    0.0, 1.0, 
    1.0, 0.0, 
    1.0, 1.0,
  ]);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, textureCoords, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(attribLoc);
  gl.vertexAttribPointer(attribLoc, 2, gl.FLOAT, false, 0, 0);
}

function setupResolution() {
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
}

function setupSizing() {
  const width = gl.canvas.clientWidth;
  const height = gl.canvas.clientHeight;
  gl.canvas.width = width;
  gl.canvas.height = height;

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function clearCanvas() {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}
