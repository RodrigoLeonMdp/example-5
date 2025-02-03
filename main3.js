import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let points = [];
const totalPoints = 300;
const floatingDots = 200; // Número de puntos flotantes
let specialPoints = [];
const totalSpecialPoints = 200;

const originalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 60 60" fill="none">
<path d="M25.6767 34.8889L32.2167 20.7495L13.2339 10.7123L25.6767 34.8889ZM48.1778 19.8567L47.1278 23.2734L52.6517 25.9651L48.1778 19.8567ZM16.8556 19.1784L11.5078 19.0323L22.2339 29.6367L16.8556 19.1789V19.1784ZM36.7411 27.5995L42.0484 37.5589L47.4578 19.9606L36.7411 27.5995ZM22.2828 43.8212L41.6495 38.2028L32.6628 21.3484L22.2828 43.8206V43.8212ZM20.26 40.0001L7.60614 42.3917L12.9139 44.8173L20.26 40.0001ZM24.1239 38.2462L7.32336 49.2723L21.4261 44.0784L24.1217 38.2506L24.1239 38.2462Z" fill="#929FE5"/>
</svg>`;
const rotatedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
<path d="M34.3233 34.8889L27.7833 20.7495L46.7661 10.7123L34.3233 34.8889ZM11.8222 19.8567L12.8722 23.2734L7.3483 25.9651L11.8222 19.8567ZM43.1444 19.1784L48.4922 19.0323L37.7661 29.6367L43.1444 19.1789V19.1784ZM23.2589 27.5995L17.9516 37.5589L12.5422 19.9606L23.2589 27.5995ZM37.7172 43.8212L18.3505 38.2028L27.3372 21.3484L37.7172 43.8206V43.8212ZM39.74 40.0001L52.3939 42.3917L47.0861 44.8173L39.74 40.0001ZM35.8761 38.2462L52.6766 49.2723L38.5739 44.0784L35.8783 38.2506L35.8761 38.2462Z" fill="#929FE5"/>
</svg>`;

// Crear la escena
scene = new THREE.Scene();
// scene.background = new THREE.Color(0xfaf9f6);

const textureBg = new THREE.TextureLoader().load("");
scene.background = textureBg;

// Crear la cámara
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 4;

// Crear el renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de órbita
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.15;

// Crear textura a partir de SVG hardcodeado
const createCraneTexture = async (svgParam = originalSvg) => {
  const blob = new Blob([svgParam], {
    type: "image/svg+xml",
  });
  const url = URL.createObjectURL(blob);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.LinearFilter;

      resolve(texture);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
};

const texture = await createCraneTexture(rotatedSvg);
const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

// Distribuir los puntos en una esfera
for (let i = 0; i < totalPoints; i++) {
  const phi = Math.acos(-1 + (2 * i) / totalPoints);
  const theta = Math.sqrt(totalPoints * Math.PI) * phi;

  const x = Math.cos(theta) * Math.sin(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(phi);

  const sprite = new THREE.Sprite(material.clone());
  sprite.position.set(x, y, z).multiplyScalar(2);
  sprite.scale.set(0.2, 0.2, 0.2);
  scene.add(sprite);
  points.push(sprite);
}

const specialTexture = await createCraneTexture();
const specialMaterial = new THREE.SpriteMaterial({
  map: specialTexture,
  transparent: true,
});

const specialRadiusFactor = 2; // Un poco más grande que los puntos normales

for (let i = 0; i < totalSpecialPoints; i++) {
  const phi = Math.acos(-1 + (2 * i) / totalSpecialPoints);
  const theta = Math.sqrt(totalSpecialPoints * Math.PI) * phi + Math.PI / 4; // Desfase en theta

  const x = Math.cos(theta) * Math.sin(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(phi);

  const sprite = new THREE.Sprite(specialMaterial.clone());
  sprite.position.set(x, y, z).multiplyScalar(specialRadiusFactor); // Usar un radio mayor
  sprite.scale.set(0.25, 0.25, 0.25); // Un poco más grandes si lo deseas
  scene.add(sprite);
  specialPoints.push(sprite);
}

// Crear material para los puntos flotantes
const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x929fe5 });
const dotGeometry = new THREE.SphereGeometry(0.03, 8, 8);

// Crear puntos flotantes alrededor de la esfera principal
for (let i = 0; i < floatingDots; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const radius = 2.4; // Ligeramente mayor que la esfera principal

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);

  const dot = new THREE.Mesh(dotGeometry, dotMaterial);
  dot.position.set(x, y, z);
  // scene.add(dot);
}

// Raycaster para detectar clics
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(points, true);

  const validIntersect = intersects.find(
    (intersect) => intersect.object.material.opacity > 0.75
  );

  if (validIntersect) {
    alert("Grulla seleccionada");
  }
});

// Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Ajustar opacidad y clickeabilidad
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  points.forEach((point) => {
    const pointDirection = point.position.clone().normalize();
    const dot = cameraDirection.dot(pointDirection);

    point.material.opacity = Math.max(0.2, 0.3 - dot);
    point.material.transparent = true;
  });

  specialPoints.forEach((point) => {
    const pointDirection = point.position.clone().normalize();
    const dot = cameraDirection.dot(pointDirection);

    point.material.opacity = Math.max(0.2, 0.3 - dot);
    point.material.transparent = true;
  });

  renderer.render(scene, camera);
}
animate();

// Ajuste de ventana
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
