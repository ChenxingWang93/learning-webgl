import { Scene } from "./scene.js";
import { FGeometry } from "./geometry.js";
import { Material } from "./material.js";
import { Mesh } from "./mesh.js";
import { Renderer } from "./renderer.js";
import { Camera } from "./camera.js";

const canvas = document.getElementById("c");
const renderer = new Renderer(canvas);
const scene = new Scene();
const camera = new Camera();

const { gl } = renderer;
const geometry = new FGeometry(gl);
const material = new Material(gl);
await material.init();

const mesh = new Mesh(geometry, material);
scene.add(mesh);

mesh.setPosition(-172, -36, -334);

renderer.render(scene, camera);
