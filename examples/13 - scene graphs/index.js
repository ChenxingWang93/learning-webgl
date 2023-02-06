import { Scene } from "./scene.js";
import { FGeometry } from "./geometry.js";
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
const geometry = new FGeometry(gl);

const greenMaterial = new Material(gl);
await greenMaterial.init();

const yellowMaterial = new Material(gl, [1, 1, 0]);
await yellowMaterial.init();

const parentMesh = new Mesh(geometry, greenMaterial);
scene.children.push(parentMesh);
parentMesh.position = { x: -40, y: -60, z: -300 };
parentMesh.scale = { x: 0.5, y: 0.5, z: 0.5 };

const childMesh = new Mesh(geometry, yellowMaterial);
scene.children.push(childMesh);
childMesh.position = { x: 0, y: 0, z: 140 };
childMesh.parent = parentMesh;
childMesh.scale = { x: 0.5, y: 0.5, z: 0.5 };

const grandChildMesh = new Mesh(geometry, greenMaterial);
scene.children.push(grandChildMesh);
grandChildMesh.parent = childMesh;
grandChildMesh.scale = { x: 0.5, y: 0.5, z: 0.5 };
grandChildMesh.position = { x: 0, y: 0, z: 80 };

const light = new DirectionalLight();
scene.lights.push(light);

function animate() {
  for (const mesh of scene.children) {
    mesh.rotation.y += Math.PI / 140;
    if (mesh.rotation.y >= 2 * Math.PI) mesh.rotation.y = 0;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
