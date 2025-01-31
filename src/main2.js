// Importa la librería Three.js si estás utilizando un módulo o CDN
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Configuración inicial de la escena, cámara y renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x232121);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de órbita para zoom y rotación manual
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 20;

// Grupo para contener las grullas
const craneGroup = new THREE.Group();
scene.add(craneGroup);

// Cargar el SVG como geometría
function createPaperCrane() {
  const geometry = new THREE.Shape();
  geometry.moveTo(0, 0);
  geometry.lineTo(0.1, 0.2);
  geometry.lineTo(-0.1, 0.2);
  geometry.closePath();

  const extrudeSettings = { depth: 0.01, bevelEnabled: false };
  const geometry3D = new THREE.ExtrudeGeometry(geometry, extrudeSettings);

  const color = Math.random() > 0.5 ? 0x7e2d40 : 0x929fe5;
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry3D, material);

  return mesh;
}

// Crear una esfera de grullas
const radius = 5;
const numCranes = 600;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

for (let i = 0; i < numCranes; i++) {
  const crane = createPaperCrane();

  // Distribuir las grullas en la superficie de una esfera
  const theta = Math.acos(2 * Math.random() - 1); // Ángulo polar
  const phi = Math.random() * 2 * Math.PI; // Ángulo azimutal

  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(theta);

  crane.position.set(x, y, z);

  // Rotar cada grulla hacia el centro
  crane.lookAt(0, 0, 0);

  // Aplicar opacidad inicial
  const opacity = z > 0 ? 1 : 0.3;
  crane.children.forEach((child) => {
    if (child.material) child.material.opacity = opacity;
  });

  craneGroup.add(crane);
}

// Configurar la cámara
camera.position.z = 10;

// Animación para rotar la esfera
function animate() {
  requestAnimationFrame(animate);

  // Rotar el grupo de grullas
  craneGroup.rotation.y += 0.0002;

  // Actualizar opacidad de las grullas según su posición relativa al frente
  craneGroup.children.forEach((crane) => {
    const worldPosition = new THREE.Vector3();
    crane.getWorldPosition(worldPosition);

    // Convertir posición del mundo a la vista de la cámara
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // Calcular el ángulo entre la posición de la grulla y la dirección de la cámara
    const dotProduct = worldPosition.normalize().dot(cameraDirection);
    const isFacingCamera = dotProduct > 0; // Frente a la cámara si el ángulo es positivo

    crane.children.forEach((child) => {
      if (child.material) {
        child.material.opacity = isFacingCamera ? 1 : 0.3; // Ajustar opacidad
      }
    });
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Detectar clic en grullas
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", () => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(craneGroup.children, true);

  if (intersects.length > 0) {
    const clickedCrane = intersects[0].object;
    showModal(clickedCrane);
  }
});

// Mostrar un modal básico
function showModal(crane) {
  return;
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.padding = "20px";
  modal.style.backgroundColor = "white";
  modal.style.border = "1px solid #ccc";
  modal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  modal.innerHTML =
    '<p>Has hecho clic en una grulla</p><button id="close-modal">Cerrar</button>';

  document.body.appendChild(modal);

  const closeButton = modal.querySelector("#close-modal");
  closeButton.addEventListener(
    "click",
    () => {
      document.body.removeChild(modal);
    },
    { once: true }
  );
}

// Ajustar el tamaño del renderizador al redimensionar la ventana
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
