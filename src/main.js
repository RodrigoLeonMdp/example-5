import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene = new THREE.Scene();
scene.background = new THREE.Color(0x404040);

let camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 0, 21);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.minDistance = 0;
controls.maxDistance = 21;

let amount = 10000;
let featuredCount = 200; // Número de puntos destacados
let pts = [];
let normals = [];
let featuredPoints = new Set();
let q = new THREE.Quaternion();
let front = new THREE.Vector3(0, 0, 1);

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

  // Marcar algunos puntos como destacados
  if (i < featuredCount) {
    featuredPoints.add(i);
  }
}

let g = new THREE.BufferGeometry().setFromPoints(pts);

let m = new THREE.PointsMaterial({
  size: 0.13,
  color: 0xface8d,
  vertexColors: true,
});

let colors = [];
for (let i = 0; i < amount; i++) {
  if (featuredPoints.has(i)) {
    colors.push(1, 0, 0); // Puntos destacados en rojo
  } else {
    colors.push(0.98, 0.78, 0.55); // Puntos regulares en color original
  }
}
g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

let points = new THREE.Points(g, m);
scene.add(points);

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

// Actualiza el mouse en tiempo real
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Detectar clics en los puntos destacados
window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObject(points);

  if (intersects.length > 0) {
    // Obtener el índice del punto intersectado
    let index = intersects[0].index;

    // Verificar si el punto es destacado
    if (featuredPoints.has(index)) {
      alert(`¡Clickeaste el punto destacado #${index}!`);
    }
  }
});

renderer.setAnimationLoop(() => {
  controls.update();

  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObject(points);

  pts.forEach((p, idx) => {
    let speed = 0.001;
    let attractionStrength = 0.005; // The strength of the attraction force

    // Atraer puntos cercanos al cursor
    if (intersects.length > 0) {
      let cursorPos = intersects[0].point;
      let distance = p.distanceTo(cursorPos);

      if (distance < 20) {
        speed = 0.001 * (1 - distance / 5); // Slows down as it gets closer
        if (distance < 1) {
          // Stronger attraction towards the cursor as they get closer
          p.lerp(cursorPos, attractionStrength); // Smooth attraction to the cursor
        }
      }
    }

    // Rotación normal de los puntos
    p.applyAxisAngle(normals[idx], speed);

    // Movimiento adicional para puntos destacados
    if (featuredPoints.has(idx)) {
      let scale = Math.sin(Date.now() * 0.002 + idx) * 0.02;
      p.addScaledVector(normals[idx], scale);
    }

    g.attributes.position.setXYZ(idx, p.x, p.y, p.z);
  });

  g.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
});
