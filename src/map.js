// Importar las librerías necesarias
import * as THREE from "three";
import mapboxgl from "mapbox-gl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js"; // Asegúrate de usar esta importación

// Configuración de Mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoibWFydGluYWx2IiwiYSI6ImNscHR1YjdvZDBlY2sybHBnNTRwM2l4ZTEifQ.nn8C3qy8ULBkq6gdO3vlCg"; // Sustituye con tu token de Mapbox

// Crear el mapa de Mapbox
const map = new mapboxgl.Map({
  container: "app", // El ID del contenedor donde se renderizará el mapa
  style: "mapbox://styles/mapbox/streets-v11", // Estilo del mapa
  center: [-74.5, 40], // Centro del mapa (longitud, latitud)
  zoom: 9, // Zoom inicial
  pitch: 45, // Ángulo de inclinación del mapa
  bearing: 0, // Orientación del mapa
});

// Crear la escena de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Esto agregará el canvas de Three.js a la página

// Crear un renderer CSS3D (para el mapa de Mapbox)
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(cssRenderer.domElement); // Esto agrega el contenedor para el mapa

// Crear un contenedor para el mapa dentro de Three.js
const mapCanvas = document.createElement("div");
mapCanvas.id = "mapCanvas";
mapCanvas.style.width = "100%";
mapCanvas.style.height = "100%";

// Crear un CSS3DObject para el mapa
const css3DObject = new CSS3DObject(mapCanvas);
scene.add(css3DObject);

// Crear controles para la cámara
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 50;

// Animación de Three.js
function animate() {
  requestAnimationFrame(animate);

  // Renderiza la escena con WebGLRenderer
  renderer.render(scene, camera);

  // Renderiza el mapa de Mapbox con CSS3DRenderer
  cssRenderer.render(scene, camera);

  controls.update(); // Necesario para OrbitControls
}

animate();

// Redimensionar la ventana correctamente
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
});
