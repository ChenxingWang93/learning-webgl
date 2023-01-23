import * as dat from "three/examples/jsm/libs/lil-gui.module.min";

const globals = {
  gl: {},
  program: {},
  vao: {},
};

const transformation = {
  setPosition: (x, y) => {
    // prettier-ignore
    transformation.translation = [
      1, 0, 0,  
      0, 1, 0,  
      x, y, 1
    ]
  },

  setRotation: (r) => {
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    // prettier-ignore
    transformation.rotation = [
      cos,  -sin, 0,  
      sin,  cos,  0,  
      0,    0,    1
    ]
  },

  setScale: (x, y) => {
    // prettier-ignore
    transformation.scale = [
      x, 0, 0,  
      0, y, 0,  
      0, 0, 1
    ]
  },
};

transformation.setPosition(0, 0);
transformation.setRotation(0);
transformation.setScale(1, 1);

main();

async function main() {
  getWebGLContext();
  await createProgramAndShaders();
  createFShape();
  setupSizing();
  clearCanvas();
  draw();
  setupControls();
}

function setupControls() {
  const gui = new dat.GUI();

  const data = {
    xTranslation: 0,
    yTranslation: 0,
    rotation: 0,
    xScale: 1,
    yScale: 1,
  };

  gui
    .add(data, "xTranslation")
    .min(0)
    .max(window.innerWidth)
    .onChange(() => {
      updateScene(data);
    });

  gui
    .add(data, "yTranslation")
    .min(0)
    .max(window.innerHeight)
    .onChange(() => {
      updateScene(data);
    });

  gui
    .add(data, "rotation")
    .min(0)
    .max(2 * Math.PI)
    .onChange(() => {
      updateScene(data);
    });

  gui
    .add(data, "xScale")
    .min(0)
    .max(3)
    .onChange(() => {
      updateScene(data);
    });

  gui
    .add(data, "yScale")
    .min(0)
    .max(3)
    .onChange(() => {
      updateScene(data);
    });
}

function updateScene(data) {
  transformation.setRotation(data.rotation);
  transformation.setScale(data.xScale, data.yScale);
  transformation.setPosition(data.xTranslation, data.yTranslation);
  draw();
}

function getWebGLContext() {
  const canvas = document.getElementById("c");
  const gl = canvas.getContext("webgl2");
  if (!gl) throw new Error("You do not support webgl2!");
  globals.gl = gl;
}

async function createProgramAndShaders() {
  const { gl } = globals;
  const program = gl.createProgram();
  globals.program = program;

  await createShaders(program);
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

function createFShape() {
  const { gl, program } = globals;
  const positions = [
    // left column
    0, 0, 30, 0, 0, 150, 0, 150, 30, 0, 30, 150,

    // top rung
    30, 0, 100, 0, 30, 30, 30, 30, 100, 0, 100, 30,

    // middle rung
    30, 60, 67, 60, 30, 90, 30, 90, 67, 60, 67, 90,
  ];

  const positionsArray = new Float32Array(positions);

  // Initialize buffer and bind it
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);

  // Enable attribute
  setupPositionBufferAttribute(gl, program);
}

function setupSizing() {
  const { gl } = globals;

  const width = gl.canvas.clientWidth;
  const height = gl.canvas.clientHeight;
  gl.canvas.width = width;
  gl.canvas.height = height;

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function clearCanvas() {
  const { gl } = globals;
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupPositionBufferAttribute() {
  const { gl, program } = globals;
  // Createa collection of attribute state called Vertex Array Object
  const vao = gl.createVertexArray();
  globals.vao = vao;

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
}

function draw() {
  const { gl, vao } = globals;

  // Update the transformation of the geometry
  updateTransformation();

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Count is 6 because geometry is 2 triangles (6 vertices)
  const count = 18;
  const offset = 0;
  const primitiveType = gl.TRIANGLES;
  gl.drawArrays(primitiveType, offset, count);
}

function updateTransformation() {
  const { gl, program } = globals;

  // Compute transformation

  const { translation, rotation, scale } = transformation;

  // Set origin of transformations in -60, -60

  // prettier-ignore
  const halfPositionTransform = [
    1, 0, 0,
    0, 1, 0,
    -60, -60, 1
  ];

  const inverseHalfTranslationTransform = invertMatrix3([
    ...halfPositionTransform,
  ]);

  const clipSpaceConversion = getClipSpaceMatrix3();

  const result = multiplyManyMatrix3(
    clipSpaceConversion,
    translation,
    inverseHalfTranslationTransform,
    rotation,
    scale,
    halfPositionTransform
  );

  // Update transformation
  const location = gl.getUniformLocation(program, "u_transformation");
  gl.uniformMatrix3fv(location, false, result);
}

async function createShaders() {
  const { gl, program } = globals;

  const fragmentPath = "./shaders/vertex.glsl";
  const vertexPath = "./shaders/fragment.glsl";

  // Get the strings for our GLSL shaders
  const vertexShaderSource = await getShaderSource(fragmentPath);
  const fragmentShaderSource = await getShaderSource(vertexPath);

  // Load GLSL shaders, compile them and attach to program
  createShader(gl.VERTEX_SHADER, vertexShaderSource);
  createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
}

function createShader(type, source) {
  const { gl, program } = globals;

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

function getClipSpaceMatrix3() {
  const { gl } = globals;
  const width = 2 / gl.canvas.clientWidth;
  const height = -2 / gl.canvas.clientHeight;
  // prettier-ignore
  return [  
    width,  0,      0,  
    0,      height, 0,  
    -1,     1,      1,  
  ];
}

function multiplyManyMatrix3(...matrices) {
  // prettier-ignore
  let result = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]

  for (let i = matrices.length - 1; i >= 0; i--) {
    result = multiplyMatrix3(matrices[i], result);
  }

  return result;
}

function multiplyMatrix3(a, b) {
  const a00 = a[0 * 3 + 0];
  const a01 = a[0 * 3 + 1];
  const a02 = a[0 * 3 + 2];
  const a10 = a[1 * 3 + 0];
  const a11 = a[1 * 3 + 1];
  const a12 = a[1 * 3 + 2];
  const a20 = a[2 * 3 + 0];
  const a21 = a[2 * 3 + 1];
  const a22 = a[2 * 3 + 2];
  const b00 = b[0 * 3 + 0];
  const b01 = b[0 * 3 + 1];
  const b02 = b[0 * 3 + 2];
  const b10 = b[1 * 3 + 0];
  const b11 = b[1 * 3 + 1];
  const b12 = b[1 * 3 + 2];
  const b20 = b[2 * 3 + 0];
  const b21 = b[2 * 3 + 1];
  const b22 = b[2 * 3 + 2];

  return [
    b00 * a00 + b01 * a10 + b02 * a20,
    b00 * a01 + b01 * a11 + b02 * a21,
    b00 * a02 + b01 * a12 + b02 * a22,
    b10 * a00 + b11 * a10 + b12 * a20,
    b10 * a01 + b11 * a11 + b12 * a21,
    b10 * a02 + b11 * a12 + b12 * a22,
    b20 * a00 + b21 * a10 + b22 * a20,
    b20 * a01 + b21 * a11 + b22 * a21,
    b20 * a02 + b21 * a12 + b22 * a22,
  ];
}

function invertMatrix3(matrix) {
  const n11 = matrix[0];
  const n21 = matrix[1];
  const n31 = matrix[2];
  const n12 = matrix[3];
  const n22 = matrix[4];
  const n32 = matrix[5];
  const n13 = matrix[6];
  const n23 = matrix[7];
  const n33 = matrix[8];
  const t11 = n33 * n22 - n32 * n23;
  const t12 = n32 * n13 - n33 * n12;
  const t13 = n23 * n12 - n22 * n13;
  const det = n11 * t11 + n21 * t12 + n31 * t13;

  if (det === 0) return [0, 0, 0, 0, 0, 0, 0, 0, 0];

  const detInv = 1 / det;

  matrix[0] = t11 * detInv;
  matrix[1] = (n31 * n23 - n33 * n21) * detInv;
  matrix[2] = (n32 * n21 - n31 * n22) * detInv;

  matrix[3] = t12 * detInv;
  matrix[4] = (n33 * n11 - n31 * n13) * detInv;
  matrix[5] = (n31 * n12 - n32 * n11) * detInv;

  matrix[6] = t13 * detInv;
  matrix[7] = (n21 * n13 - n23 * n11) * detInv;
  matrix[8] = (n22 * n11 - n21 * n12) * detInv;

  return matrix;
}
