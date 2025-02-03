import * as THREE from "three";

// Crear la escena
const scene = new THREE.Scene();

// Crear la cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Crear el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear geometría de puntos para el anillo
const numPoints = 200; // Cantidad de puntos en el anillo
const innerRadius = 1.75; // Radio interno del anillo
const outerRadius = 2; // Radio externo del anillo

const points = [];
const originalPositions = []; // Guardamos las posiciones originales para la animación

for (let i = 0; i < numPoints; i++) {
  const angle = (i / numPoints) * Math.PI * 2; // Ángulo en radianes
  const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random()); // Radio aleatorio entre interno y externo
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  points.push(x, y, 0);
  originalPositions.push({ x, y }); // Guardamos la posición inicial
}

// Crear BufferGeometry y añadir los puntos
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));

// Crear material de los puntos
const material = new THREE.PointsMaterial({ color: 0x0000ff, size: 0.05 });

// Crear objeto de puntos y añadirlo a la escena
const pointMesh = new THREE.Points(geometry, material);
scene.add(pointMesh);

// Animación
function animate(time) {
  requestAnimationFrame(animate);

  const positions = geometry.attributes.position.array;

  for (let i = 0; i < numPoints; i++) {
    const index = i * 3;
    const baseX = originalPositions[i].x;
    const baseY = originalPositions[i].y;

    // Aplicamos una oscilación sutil
    positions[index] = baseX + Math.sin(time * 0.001 + i) * 0.05;
    positions[index + 1] = baseY + Math.cos(time * 0.001 + i) * 0.05;
  }

  geometry.attributes.position.needsUpdate = true; // Decirle a Three.js que actualice la geometría

  renderer.render(scene, camera);
}

animate();
