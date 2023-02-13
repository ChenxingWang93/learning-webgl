import { Scene } from "./scene.js";
import { CubeGeometry } from "./geometry.js";
import { Material } from "./material.js";
import { Mesh } from "./mesh.js";
import { Renderer } from "./renderer.js";
import { Camera } from "./camera.js";
import { DirectionalLight } from "./directional-light.js";

const canvas = document.getElementById("c");
const renderer = new Renderer(canvas);
const scene = new Scene();
const camera = new Camera();

const { gl } = renderer;
const geometry = new CubeGeometry(gl);

const greenMaterial = new Material(gl);
await greenMaterial.init();

const redMaterial = new Material(gl, [2, 0, 0]);
await redMaterial.init();

const yellowMaterial = new Material(gl, [1, 1, 0]);
await yellowMaterial.init();

const materials = [greenMaterial, redMaterial, yellowMaterial];
const meshes = [];

for (let i = 0; i < 1; i++) {
  const material = materials[i % 3];
  const mesh = new Mesh(geometry, material);
  let x = -50 + getRandomNumber(100);
  let y = -60 + getRandomNumber(100);
  let z = -320 + getRandomNumber(100);
  mesh.position = { x, y, z };
  mesh.scale = { x: 0.3, y: 0.3, z: 0.3 };
  x = (getRandomNumber(360) * Math.PI) / 180;
  y = (getRandomNumber(360) * Math.PI) / 180;
  z = (getRandomNumber(360) * Math.PI) / 180;
  mesh.rotation = { x, y, z };
  meshes.push(mesh);
  scene.children.push(mesh);
}

const light = new DirectionalLight();
scene.lights.push(light);

renderer.render(scene, camera);

function animate() {
  for (const mesh of meshes) {
    mesh.rotation.y += Math.PI / 180;
    mesh.rotation.x += Math.PI / 180;
    if (mesh.rotation.y >= 2 * Math.PI) mesh.rotation.y = 0;
    if (mesh.rotation.x >= 2 * Math.PI) mesh.rotation.x = 0;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

function getRandomNumber(range) {
  let result = Math.ceil(Math.random() * range);
  result *= 2;
  result -= result / 2;
  return result;
}
