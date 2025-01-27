import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Crear la escena
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x404040);

// Crear la cámara
let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 0, 20);

// Crear el renderizador
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Ajustar el tamaño del canvas cuando se redimensiona la ventana
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Agregar los controles de la cámara
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 20;

// Función para crear el sistema de partículas de fondo
function createBackgroundParticles() {
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const sphereRadius = 12;

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

// Crear sistema de partículas de fondo
const backgroundParticles = createBackgroundParticles();
scene.add(backgroundParticles.points);

// Datos de los puntos principales
let amount = 600;
let featuredCount = 200;
let pts = [];
let normals = [];
let featuredPoints = new Set();
let q = new THREE.Quaternion();
let front = new THREE.Vector3(0, 0, 1);

// Crear los puntos principales
for (let i = 0; i < amount; i++) {
  let randAngle = Math.random() * Math.PI * 2;
  let randRadius = Math.random();
  let point = new THREE.Vector3(
    Math.cos(randAngle) * (8 + randRadius),
    Math.sin(randAngle) * (8 + randRadius),
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

  if (Math.random() < 0.5) {
    point.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  }
}

// Cargar el SVG como textura
let textureLoader = new THREE.TextureLoader();
let iconTexture = textureLoader.load("paper-crane.svg", () => {
  console.log("Texture loaded successfully!");
});

// Crear la geometría y material de los puntos principales
let g = new THREE.BufferGeometry().setFromPoints(pts);
let m = new THREE.PointsMaterial({
  size: 2,
  map: iconTexture,
  transparent: true,
  vertexColors: true,
});

// Colores con interpolación
const colors = {
  normal: new THREE.Color(146 / 255, 159 / 255, 229 / 255),
  featured: new THREE.Color(0.49, 0.18, 0.25),
  hover: new THREE.Color(1, 0.5, 0),
};

// Inicializar colores
let colorArray = new Float32Array(amount * 3);
for (let i = 0; i < amount; i++) {
  const color = featuredPoints.has(i) ? colors.featured : colors.normal;
  colorArray[i * 3] = color.r;
  colorArray[i * 3 + 1] = color.g;
  colorArray[i * 3 + 2] = color.b;
}

g.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
let points = new THREE.Points(g, m);
scene.add(points);

// Variables de interacción
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let hoveredCraneIndex = null;
let currentColors = new Map();

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

  colorArray[index * 3] = newColor.r;
  colorArray[index * 3 + 1] = newColor.g;
  colorArray[index * 3 + 2] = newColor.b;

  return (
    Math.abs(targetColor.r - r) < 0.01 &&
    Math.abs(targetColor.g - g) < 0.01 &&
    Math.abs(targetColor.b - b) < 0.01
  );
}

// Actualizar la posición del ratón
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Detectar clics
window.addEventListener("click", () => {
  if (hoveredCraneIndex !== null && featuredPoints.has(hoveredCraneIndex)) {
    alert(`¡Clickeaste el punto destacado #${hoveredCraneIndex}!`);
  }
});

// Bucle de animación
function animate() {
  requestAnimationFrame(animate);

  // Actualizar partículas de fondo
  backgroundParticles.update();

  // Actualizar interacción del ratón
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObject(points);

  if (intersects.length > 0) {
    let index = intersects[0].index;
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

  // Actualizar colores
  g.attributes.color.needsUpdate = true;

  // Rotar puntos
  points.rotation.y += 0.0004;

  // Actualizar controles y renderizar
  controls.update();
  renderer.render(scene, camera);
}

// Iniciar animación
animate();
