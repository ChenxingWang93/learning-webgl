main();

async function main() {
  const gl = getWebGLContext();
  const program = await createProgramAndShaders(gl);
  const vao = createTriangleInClipSpace(gl, program);
  setupSizing(gl);
  clearCanvas(gl);
  draw(gl, vao);
}

function getWebGLContext() {
  const canvas = document.getElementById("c");
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("You do not support webgl2!");
  return gl;
}

async function createProgramAndShaders(gl) {
  const program = gl.createProgram();
  await createShaders(gl, program);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    gl.useProgram(program);
    return program;
  }

  // If there's an error, log it
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function createTriangleInClipSpace(gl, program) {
  const positions = [0, 0, 0.75, 0, 0.75, 0.75];
  const positionsArray = new Float32Array(positions);

  // Initialize buffer and bind it
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);

  // Enable attribute
  return setupPositionBufferAttribute(gl, program);
}

function setupSizing(gl) {
  const width = gl.canvas.clientWidth;
  const height = gl.canvas.clientHeight;
  gl.canvas.width = width;
  gl.canvas.height = height;

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function clearCanvas(gl) {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupPositionBufferAttribute(gl, program) {
  // Createa collection of attribute state called Vertex Array Object
  const vao = gl.createVertexArray();

  // Make it the current vertex array
  gl.bindVertexArray(vao);

  // Look up where the vertex data is and turn on the attribute
  const posAttrLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(posAttrLocation);

  // Tell the attribute how to get data out of positionBuffer
  gl.vertexAttribPointer(
    posAttrLocation,
    2, // 2 components per iteration
    gl.FLOAT, // the data is 32bit floats
    false, // normalize = false: don't normalize the data
    0, // stride = 0: move forward size * sizeof(type) each iteration
    0 // offset = 0: start at the beginning of the buffer
  );

  return vao;
}

function draw(gl, vao) {
  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  const offset = 0;
  const primitiveType = gl.TRIANGLES;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

async function createShaders(gl, program) {
  const fragmentPath = "./shaders/vertex.glsl";
  const vertexPath = "./shaders/fragment.glsl";

  // Get the strings for our GLSL shaders
  const vertexShaderSource = await getShaderSource(fragmentPath);
  const fragmentShaderSource = await getShaderSource(vertexPath);

  // Load GLSL shaders, compile them and attach to program
  createShader(gl, gl.VERTEX_SHADER, vertexShaderSource, program);
  createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource, program);
}

function createShader(gl, type, source, program) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) gl.attachShader(program, shader);

  // If there's an error, log it
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

async function getShaderSource(path) {
  const response = await fetch(path);
  return await response.text();
}
