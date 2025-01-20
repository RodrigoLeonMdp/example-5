import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Crear la escena
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x404040);

// Crear la cámara
let camera = new THREE.PerspectiveCamera(20, innerWidth / innerHeight, 1, 1000);
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
controls.minDistance = 0;
controls.maxDistance = 20;

// Datos de los puntos
let amount = 800;
let featuredCount = 200; // Número de puntos destacados
let pts = [];
let normals = [];
let featuredPoints = new Set();
let q = new THREE.Quaternion();
let front = new THREE.Vector3(0, 0, 1);

// Cargar el SVG como textura
let textureLoader = new THREE.TextureLoader();
let iconTexture = textureLoader.load("paper-crane.svg"); // Ruta al icono SVG

// Crear los puntos
for (let i = 0; i < amount; i++) {
  let randAngle = Math.random() * Math.PI * 2;
  let randRadius = Math.random();
  let point = new THREE.Vector3(
    Math.cos(randAngle) * (5 + randRadius), // Reduce el radio para agrupar más los puntos
    Math.sin(randAngle) * (5 + randRadius),
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

// Crear la geometría de los puntos
let g = new THREE.BufferGeometry().setFromPoints(pts);

// Crear un material que use la textura SVG y mantenga el tamaño constante
let m = new THREE.PointsMaterial({
  size: 20, // Tamaño de los puntos (ajustar según el diseño)
  map: iconTexture, // Usar la textura SVG
  transparent: true, // Asegurar la transparencia
  sizeAttenuation: false, // Mantener el tamaño constante en pantalla
  vertexColors: true, // Permitir colores personalizados para cada punto
});

// Colores de los puntos (destacados en rojo)
let colors = [];
for (let i = 0; i < amount; i++) {
  if (featuredPoints.has(i)) {
    colors.push(1, 0, 0); // Puntos destacados en rojo
  } else {
    colors.push(0.98, 0.78, 0.55); // Puntos regulares en color original
  }
}
g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

// Crear el objeto de puntos y agregarlo a la escena
let points = new THREE.Points(g, m);
scene.add(points);

// Variables de interacción del ratón
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let hoveredCraneIndex = null;
let pausedIndices = new Set(); // Índices de puntos que deben pausar

// Actualizar la posición del ratón
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObject(points);

  if (intersects.length > 0) {
    hoveredCraneIndex = intersects[0].index; // Almacenar el índice del punto en hover

    // Calcular los puntos en el radio cercano
    let hoverPoint = pts[hoveredCraneIndex];
    pausedIndices.clear(); // Limpiar índices pausados
    for (let i = 0; i < pts.length; i++) {
      if (i === hoveredCraneIndex) continue; // Ignorar el punto en hover
      if (hoverPoint.distanceTo(pts[i]) <= 1.5) {
        pausedIndices.add(i);
      }
    }
  } else {
    hoveredCraneIndex = null; // Restablecer cuando no haya hover
    pausedIndices.clear(); // Limpiar índices pausados
  }
});

// Detectar clics en los puntos destacados
window.addEventListener("click", () => {
  if (hoveredCraneIndex !== null && featuredPoints.has(hoveredCraneIndex)) {
    alert(`¡Clickeaste el punto destacado #${hoveredCraneIndex}!`);
  }
});

// Bucle de animación
renderer.setAnimationLoop(() => {
  controls.update();

  pts.forEach((p, idx) => {
    if (pausedIndices.has(idx)) {
      // Pausar movimiento para los puntos en el radio cercano
      return;
    }

    let speed = 0.001;

    // Movimiento normal de los puntos
    p.applyAxisAngle(normals[idx], speed);

    g.attributes.position.setXYZ(idx, p.x, p.y, p.z);
  });

  // Actualizar colores para el hover
  colors = colors.map((v, i) => {
    // if (hoveredCraneIndex !== null && Math.floor(i / 3) === hoveredCraneIndex) {
    //   return i % 3 === 0 ? 0 : 1; // Destacar en verde
    // }
    return featuredPoints.has(Math.floor(i / 3)) ? (i % 3 === 0 ? 1 : 0) : 0.98; // Rojo u original
  });

  g.attributes.color.array = new Float32Array(colors);
  g.attributes.color.needsUpdate = true;

  g.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
});
