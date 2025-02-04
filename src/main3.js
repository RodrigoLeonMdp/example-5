import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let points = [],
  specialPoints = [],
  floatingPoints = [];
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
  initializeModal();
  createScene();
  await createTextures();
  createPoints();
  createFloatingDots();
  setupEventListeners();
  animate();
}

// Helpers
function createScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.TextureLoader().load("");

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
  controls.autoRotateSpeed = 0.15;
}

async function createTextures() {
  const texture = await createCraneTexture(rotatedSvg);
  const specialTexture = await createCraneTexture(originalSvg);
  const redTexture = await createCraneTexture(
    originalSvg.replace(/fill="#929FE5"/g, 'fill="#E03822"')
  );

  window.material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  window.specialMaterial = new THREE.SpriteMaterial({
    map: specialTexture,
    transparent: true,
  });
  window.redMaterial = new THREE.SpriteMaterial({
    map: redTexture,
    transparent: true,
  });
}

async function createCraneTexture(svg) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
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
}

function createPoints() {
  const redIndexes = new Set();
  while (redIndexes.size < 50) {
    redIndexes.add(Math.floor(Math.random() * totalPoints));
  }

  for (let i = 0; i < totalPoints; i++) {
    let materialToUse = redIndexes.has(i)
      ? window.redMaterial
      : window.material;
    createPoint(i, totalPoints, 2, materialToUse, points);
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

function createFloatingDots() {
  const dotMaterial = new THREE.SpriteMaterial({
    color: 0x929fe5,
    transparent: true,
  });

  for (let i = 0; i < floatingDots; i++) {
    const position = randomSpherePosition(3);
    const dot = new THREE.Sprite(dotMaterial);
    dot.position.copy(position);
    dot.scale.set(0.03, 0.03, 0.03);
    scene.add(dot);
    floatingPoints.push(dot);
  }
}

function randomSpherePosition(radius) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

function setupEventListeners() {
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onClick);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    [...points, ...specialPoints],
    true
  );

  const validIntersect = intersects.find(
    (intersect) => intersect.object.material.opacity > 0.75
  );

  if (validIntersect) {
    document.getElementById("infoModal").style.display = "block";
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateOpacity(points);
  updateOpacity(specialPoints);
  updateOpacityOfFloatingPoints();
  renderer.render(scene, camera);
}

function updateOpacity(pointArray) {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  pointArray.forEach((point) => {
    const dot = cameraDirection.dot(point.position.clone().normalize());
    point.material.opacity = Math.max(0.3, 0.1 - dot);
    point.material.transparent = true;
  });
}

function updateOpacityOfFloatingPoints() {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  floatingPoints.forEach((point) => {
    const dot = cameraDirection.dot(point.position.clone().normalize());
    point.material.opacity = 0.25;
    point.material.transparent = true;
  });
}

function initializeModal() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="infoModal" class="modal">
        <span id="closeModal">&times;</span>
        
        <div class="modal-content">
          <div class="image-wrapper"></div>
          <div class="info-wrapper">
            <h2>Tetsutani Shinichi (鉄谷 伸一)</h2>
            <div class="resume"><span>Boy killed by the atomic bombing of Hiroshima at 3 years of age</span></div>
            <div class="description">
              <p>At the time of the atomic bombing, Shinichi was riding his tricycle in front of his house, around 1.5 kilometres from the hypocentre.</p>
              <p>
                He suffered major injuries, including burns that covered his body, and died that night. His father, Nobuo, recalled his cries for water before he took his last breaths.
              </p>
            </div>

            <span class="btn">Read more ›</span>
          </div>
        </div>
      </div>
    `
  );

  document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("infoModal").style.display = "none";
  });
}
