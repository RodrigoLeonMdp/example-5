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

// Datos de los puntos
let amount = 600;
let featuredCount = 200;
let pts = [];
let normals = [];
let featuredPoints = new Set();
let q = new THREE.Quaternion();
let front = new THREE.Vector3(0, 0, 1);

// Cargar el SVG como textura
let textureLoader = new THREE.TextureLoader();
let iconTexture = textureLoader.load("paper-crane.svg", () => {
  console.log("Texture loaded successfully!");
});

// Crear los puntos
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

  // Marcar algunos puntos como destacados
  if (i < featuredCount) {
    featuredPoints.add(i);
  }

  // Rotación aleatoria para algunos iconos (inversión del pico)
  if (Math.random() < 0.5) {
    // 50% de probabilidad de invertir
    point.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI); // Rotar 180 grados en el eje Y
  }
}

// Crear la geometría de los puntos
let g = new THREE.BufferGeometry().setFromPoints(pts);

// Crear un material que use la textura SVG
let m = new THREE.PointsMaterial({
  size: 2,
  map: iconTexture,
  transparent: true,
  vertexColors: true,
});

// Colores de los puntos
let colors = [];
for (let i = 0; i < amount; i++) {
  if (featuredPoints.has(i)) {
    colors.push(0.49, 0.18, 0.25); // Color destacado (granate oscuro)
  } else {
    colors.push(146 / 255, 159 / 255, 229 / 255); // Color azul claro
  }
}
g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

// Crear el objeto de puntos y agregarlo a la escena
let points = new THREE.Points(g, m);
scene.add(points);

// Obtener el atributo de color para actualizaciones dinámicas
let colorAttribute = g.getAttribute("color");

// Variables de interacción del ratón
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let hoveredCraneIndex = null;

// Actualizar la posición del ratón
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObject(points);

  if (intersects.length > 0) {
    let index = intersects[0].index;

    if (hoveredCraneIndex !== index) {
      // Restaurar el color del punto anteriormente seleccionado
      if (hoveredCraneIndex !== null) {
        let originalColor = featuredPoints.has(hoveredCraneIndex)
          ? [0.49, 0.18, 0.25] // Granate oscuro para destacados
          : [146 / 255, 159 / 255, 229 / 255]; // Color original para los demás
        colorAttribute.setXYZ(hoveredCraneIndex, ...originalColor);
      }

      // Aplicar color naranja al punto actual
      colorAttribute.setXYZ(index, 1, 0.5, 0); // Naranja para el hover
      hoveredCraneIndex = index;
    }
  } else {
    // Si no hay intersecciones, restaurar el último punto hovereado
    if (hoveredCraneIndex !== null) {
      let originalColor = featuredPoints.has(hoveredCraneIndex)
        ? [0.49, 0.18, 0.25]
        : [146 / 255, 159 / 255, 229 / 255];
      colorAttribute.setXYZ(hoveredCraneIndex, ...originalColor);
      hoveredCraneIndex = null;
    }
  }

  // Informar a Three.js que los colores han cambiado
  colorAttribute.needsUpdate = true;
});

// Detectar clics en los puntos destacados
window.addEventListener("click", () => {
  if (hoveredCraneIndex !== null && featuredPoints.has(hoveredCraneIndex)) {
    alert(`¡Clickeaste el punto destacado #${hoveredCraneIndex}!`);
  }
});

// Bucle de animación con rotación suave
renderer.setAnimationLoop(() => {
  // Rotar suavemente la nube de puntos
  points.rotation.y += 0.0004; // Controla la velocidad de rotación (más lento o más rápido)

  controls.update();
  renderer.render(scene, camera);
});
