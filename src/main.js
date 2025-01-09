import * as THREE from "three";

// Configuración de la escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5); // Cámara inicialmente alejada

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear partículas fijas
const particleCount = 5000; // Aumentamos el número de partículas
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 30; // X aleatorio
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 30; // Y aleatorio
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30; // Z aleatorio (profundidad aleatoria)
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

// Material de partículas con bordes difusos y color suave (efecto tinta)
const particleMaterial = new THREE.PointsMaterial({
  color: 0x2c3e50, // Color suave de tinta
  size: 0.1,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.8,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Crear círculos estilo neón y ubicarlos en distintas profundidades
const circleGroup = new THREE.Group();
const circleCount = 10;

for (let i = 0; i < circleCount; i++) {
  const circleGeometry = new THREE.CircleGeometry(0.5, 32);

  // Material de círculo con efecto de neón (brillo)
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(Math.random(), Math.random(), Math.random()), // Color aleatorio y brillante
    emissive: new THREE.Color(Math.random(), Math.random(), Math.random()), // Efecto de neón
    emissiveIntensity: 1,
  });

  const circle = new THREE.Mesh(circleGeometry, circleMaterial);

  // Posición aleatoria del círculo (en Z aleatorio para la profundidad)
  circle.position.set(
    (Math.random() - 0.5) * 10, // X aleatorio
    (Math.random() - 0.5) * 10, // Y aleatorio
    Math.random() * 10 - 5 // Z aleatorio (profundidad aleatoria)
  );

  // Agregar nombre único
  circle.name = `Circle ${i + 1}`;
  circleGroup.add(circle);
}
scene.add(circleGroup);

// Detectar clic en círculos
function onMouseClick(event) {
  // Convertir la posición del clic a coordenadas del espacio 3D
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(circleGroup.children);
  if (intersects.length > 0) {
    alert(`Has clickeado en: ${intersects[0].object.name}`);
  }
}

window.addEventListener("click", onMouseClick);

// Variables para el movimiento de la cámara
let mouseX = 0;
let mouseY = 0;
const mouseSpeedX = 0.05; // Factor de velocidad para el movimiento horizontal
const mouseSpeedY = 0.05; // Factor de velocidad para el movimiento vertical

// Variables para el zoom suave
let targetZoom = 5; // Posición objetivo del zoom (distancia de la cámara)
let zoomSpeed = 0.1; // Velocidad de suavizado del zoom

// Detectar movimiento del ratón
function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("mousemove", onMouseMove);

// Función para controlar el zoom con el scroll
function onScroll(event) {
  const zoomFactor = 0.1; // Factor de zoom, ajusta la sensibilidad
  targetZoom += event.deltaY * zoomFactor; // Ajusta el valor objetivo del zoom
  targetZoom = Math.max(2, Math.min(targetZoom, 50)); // Limitar el zoom (no dejar que se acerque demasiado o se aleje demasiado)
}

window.addEventListener("wheel", onScroll);

// Animación
function animate() {
  requestAnimationFrame(animate);

  // Mover la cámara en función del movimiento del ratón
  camera.position.x += mouseX * mouseSpeedX; // Movimiento horizontal
  camera.position.y += mouseY * mouseSpeedY; // Movimiento vertical

  // Interpolar suavemente entre la posición actual y la posición objetivo del zoom
  camera.position.z = THREE.MathUtils.lerp(
    camera.position.z,
    targetZoom,
    zoomSpeed
  );

  // Actualizar la escena
  renderer.render(scene, camera);
}

// Comenzar animación
animate();

// Ajustar el canvas al cambiar el tamaño de la ventana
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
