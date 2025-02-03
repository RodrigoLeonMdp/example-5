import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, sceneForFloatPoints, camera, renderer, controls;
let points = [],
  specialPoints = [];
const totalPoints = 300;
const totalSpecialPoints = 200;
const floatingDots = 200;

const originalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 60 60" fill="none">
<path d="M25.6767 34.8889L32.2167 20.7495L13.2339 10.7123L25.6767 34.8889ZM48.1778 19.8567L47.1278 23.2734L52.6517 25.9651L48.1778 19.8567ZM16.8556 19.1784L11.5078 19.0323L22.2339 29.6367L16.8556 19.1789V19.1784ZM36.7411 27.5995L42.0484 37.5589L47.4578 19.9606L36.7411 27.5995ZM22.2828 43.8212L41.6495 38.2028L32.6628 21.3484L22.2828 43.8206V43.8212ZM20.26 40.0001L7.60614 42.3917L12.9139 44.8173L20.26 40.0001ZM24.1239 38.2462L7.32336 49.2723L21.4261 44.0784L24.1217 38.2506L24.1239 38.2462Z" fill="#929FE5"/>
</svg>`;

const rotatedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
<path d="M34.3233 34.8889L27.7833 20.7495L46.7661 10.7123L34.3233 34.8889ZM11.8222 19.8567L12.8722 23.2734L7.3483 25.9651L11.8222 19.8567ZM43.1444 19.1784L48.4922 19.0323L37.7661 29.6367L43.1444 19.1789V19.1784ZM23.2589 27.5995L17.9516 37.5589L12.5422 19.9606L23.2589 27.5995ZM37.7172 43.8212L18.3505 38.2028L27.3372 21.3484L37.7172 43.8206V43.8212ZM39.74 40.0001L52.3939 42.3917L47.0861 44.8173L39.74 40.0001ZM35.8761 38.2462L52.6766 49.2723L38.5739 44.0784L35.8783 38.2506L35.8761 38.2462Z" fill="#929FE5"/>
</svg>`;

init();
async function init() {
  createScenes();
  await createTextures();
  createPoints();
  createFloatingDots();
  setupEventListeners();
  animate();
}

// Crear ambas escenas
function createScenes() {
  scene = new THREE.Scene();
  sceneForFloatPoints = new THREE.Scene();
  // scene.background = new THREE.Color(0x000000);
  sceneForFloatPoints.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 4;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.08;
}

// Crear texturas para los pájaros
async function createTextures() {
  const texture = await createCraneTexture(rotatedSvg);
  const specialTexture = await createCraneTexture(originalSvg);

  window.material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  window.specialMaterial = new THREE.SpriteMaterial({
    map: specialTexture,
    transparent: true,
  });
}

async function createCraneTexture(svg) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      resolve(texture);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

// Crear pájaros (puntos en la esfera)
function createPoints() {
  for (let i = 0; i < totalPoints; i++) {
    createPoint(i, totalPoints, 2, window.material, points);
  }
  for (let i = 0; i < totalSpecialPoints; i++) {
    createPoint(
      i,
      totalSpecialPoints,
      2.2,
      window.specialMaterial,
      specialPoints,
      Math.PI / 4
    );
  }
}

function createPoint(i, total, scale, material, targetArray, offset = 0) {
  const phi = Math.acos(-1 + (2 * i) / total);
  const theta = Math.sqrt(total * Math.PI) * phi + offset;
  const position = new THREE.Vector3(
    Math.cos(theta) * Math.sin(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(phi)
  ).multiplyScalar(scale);

  const sprite = new THREE.Sprite(material.clone());
  sprite.position.copy(position);
  sprite.scale.set(0.18, 0.18, 0.18);
  scene.add(sprite);
  targetArray.push(sprite);
}

// Crear puntos flotantes en su propia escena
function createFloatingDots() {
  const points = [];
  for (let i = 0; i < floatingDots; i++) {
    points.push(
      Math.random() * 6 - 3,
      Math.random() * 6 - 3,
      Math.random() * 6 - 3
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3)
  );
  const material = new THREE.PointsMaterial({ color: 0x7589f2, size: 0.03 });

  const pointMesh = new THREE.Points(geometry, material);
  sceneForFloatPoints.add(pointMesh);
}

// Evento de resize
function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animación y renderizado de ambas escenas
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Renderizar la escena de los puntos flotantes primero
  renderer.autoClear = false;
  renderer.clear();
  renderer.render(sceneForFloatPoints, camera);

  // Luego renderizar la escena principal con los pájaros
  renderer.clearDepth();
  renderer.render(scene, camera);
}
