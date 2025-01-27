import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Configuración inicial
let scene, camera, renderer, controls, points;

// Inicializar la escena
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x404040);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.minDistance = 10;
  controls.maxDistance = 20;
}

// Sistema de partículas de fondo
function createBackgroundParticles() {
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const sphereRadius = 60;

  function getRandomSpherePoint() {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = Math.random() * sphereRadius;

    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
    };
  }

  for (let i = 0; i < particleCount * 3; i += 3) {
    const point = getRandomSpherePoint();
    positions[i] = point.x;
    positions[i + 1] = point.y;
    positions[i + 2] = point.z;

    velocities.push({
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.01,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x88ccff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    update: function () {
      const positions = points.geometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        const distance = Math.sqrt(
          positions[i3] * positions[i3] +
            positions[i3 + 1] * positions[i3 + 1] +
            positions[i3 + 2] * positions[i3 + 2]
        );

        if (distance > sphereRadius) {
          const newPoint = getRandomSpherePoint();
          positions[i3] = newPoint.x;
          positions[i3 + 1] = newPoint.y;
          positions[i3 + 2] = newPoint.z;

          velocities[i].x = (Math.random() - 0.5) * 0.01;
          velocities[i].y = (Math.random() - 0.5) * 0.01;
          velocities[i].z = (Math.random() - 0.5) * 0.01;
        }
      }

      points.geometry.attributes.position.needsUpdate = true;
    },
  };
}

// Crear sprite SVG
function createSVGSprite() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="114" height="114" viewBox="0 0 114 114" fill="none">
      <path d="M65.2144 66.2889L52.7884 39.4239L88.8556 20.3532L65.2144 66.2889ZM22.4622 37.7277L24.4573 44.2193L13.9619 49.3335L22.4622 37.7277ZM81.9745 36.4388L92.1353 36.1612L71.7556 56.3097L81.9745 36.4399V36.4388ZM44.1919 52.4389L34.1082 71.3619L23.8303 37.925L44.1919 52.4389ZM71.6628 83.2601L34.8661 72.5853L51.9408 40.5618L71.6628 83.259V83.2601ZM75.506 76L99.5484 80.5441L89.4636 85.1527L75.506 76ZM68.1646 72.6676L100.086 93.6172L73.2904 83.7488L68.1689 72.676L68.1646 72.6676Z" fill="#929FE5"/>
    </svg>
  `;

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1000;
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

// Variables globales
let amount = 600;
let featuredCount = 200;
let featuredPoints = new Set();
let hoveredCraneIndex = null;
let currentColors = new Map();
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let backgroundParticles;

// Colores
const colors = {
  normal: new THREE.Color(146 / 255, 159 / 255, 229 / 255),
  featured: new THREE.Color(0.49, 0.18, 0.25),
  hover: new THREE.Color(1, 0.5, 0),
};

// Función para transición suave de colores
function lerpColors(index, targetColor, speed = 0.1) {
  const currentColor =
    currentColors.get(index) ||
    (featuredPoints.has(index) ? colors.featured : colors.normal);

  const r = currentColor.r + (targetColor.r - currentColor.r) * speed;
  const g = currentColor.g + (targetColor.g - currentColor.g) * speed;
  const b = currentColor.b + (targetColor.b - currentColor.b) * speed;

  const newColor = new THREE.Color(r, g, b);
  currentColors.set(index, newColor);

  const colorAttribute = points.geometry.attributes.color;
  colorAttribute.setXYZ(index, newColor.r, newColor.g, newColor.b);

  return (
    Math.abs(targetColor.r - r) < 0.01 &&
    Math.abs(targetColor.g - g) < 0.01 &&
    Math.abs(targetColor.b - b) < 0.01
  );
}

// Crear los puntos principales
async function createPoints() {
  const pts = [];
  const normals = [];
  const q = new THREE.Quaternion();
  const front = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i < amount; i++) {
    let randAngle = Math.random() * Math.PI * 2;
    let randRadius = Math.random();
    let point = new THREE.Vector3(
      Math.cos(randAngle) * (9 + randRadius),
      Math.sin(randAngle) * (9 + randRadius),
      0
    );

    let randNorm = new THREE.Vector3().randomDirection();
    q.setFromUnitVectors(front, randNorm);
    point.applyQuaternion(q);

    pts.push(point);
    normals.push(randNorm);

    if (i < featuredCount) {
      featuredPoints.add(i);
    }
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(pts);

  // Inicializar colores
  const colorArray = new Float32Array(amount * 3);
  for (let i = 0; i < amount; i++) {
    const color = featuredPoints.has(i) ? colors.featured : colors.normal;
    colorArray[i * 3] = color.r;
    colorArray[i * 3 + 1] = color.g;
    colorArray[i * 3 + 2] = color.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

  const spriteTexture = await createSVGSprite();
  const material = new THREE.PointsMaterial({
    size: 2.5,
    map: spriteTexture,
    transparent: true,
    vertexColors: true,
    alphaTest: 0.5,
    depthWrite: false,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
}

// Event listeners
function setupEventListeners() {
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("click", () => {
    if (hoveredCraneIndex !== null && featuredPoints.has(hoveredCraneIndex)) {
      alert(`¡Clickeaste el punto destacado #${hoveredCraneIndex}!`);
    }
  });
}

// Función de animación
function animate() {
  requestAnimationFrame(animate);

  backgroundParticles.update();

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(points);

  if (intersects.length > 0) {
    const index = intersects[0].index;
    if (hoveredCraneIndex !== index) {
      if (hoveredCraneIndex !== null) {
        const originalColor = featuredPoints.has(hoveredCraneIndex)
          ? colors.featured
          : colors.normal;
        lerpColors(hoveredCraneIndex, originalColor);
      }
      hoveredCraneIndex = index;
    }
    lerpColors(index, colors.hover);
  } else if (hoveredCraneIndex !== null) {
    const originalColor = featuredPoints.has(hoveredCraneIndex)
      ? colors.featured
      : colors.normal;
    if (lerpColors(hoveredCraneIndex, originalColor)) {
      hoveredCraneIndex = null;
    }
  }

  points.geometry.attributes.color.needsUpdate = true;
  points.rotation.y += 0.0004;

  controls.update();
  renderer.render(scene, camera);
}

// Inicialización principal
async function init() {
  initScene();
  backgroundParticles = createBackgroundParticles();
  scene.add(backgroundParticles.points);
  await createPoints();
  setupEventListeners();
  animate();
}

// Iniciar la aplicación
init();
