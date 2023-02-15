export async function getGlAndProgram() {
  const gl = getWebGLContext();
  const program = await createProgramAndShaders(gl);
  gl.useProgram(program);
  return { gl, program };
}

function getWebGLContext() {
  const canvas = document.getElementById("c");
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("You do not support webgl2!");

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

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
