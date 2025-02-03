// import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// // Configuración inicial
// let scene, camera, renderer, controls, points;

// // Variables globales
// let amount = 250;
// let amountRotated = 250;
// let featuredCount = 200;
// let featuredPoints = new Set();
// let hoveredCraneIndex = null;
// let mouse = new THREE.Vector2();
// let raycaster = new THREE.Raycaster();
// let backgroundParticles;
// const MIN_DISTANCE = 1;
// const originalSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
//   <path d="M25.6767 34.8889L32.2167 20.7495L13.2339 10.7123L25.6767 34.8889ZM48.1778 19.8567L47.1278 23.2734L52.6517 25.9651L48.1778 19.8567ZM16.8556 19.1784L11.5078 19.0323L22.2339 29.6367L16.8556 19.1789V19.1784ZM36.7411 27.5995L42.0484 37.5589L47.4578 19.9606L36.7411 27.5995ZM22.2828 43.8212L41.6495 38.2028L32.6628 21.3484L22.2828 43.8206V43.8212ZM20.26 40.0001L7.60614 42.3917L12.9139 44.8173L20.26 40.0001ZM24.1239 38.2462L7.32336 49.2723L21.4261 44.0784L24.1217 38.2506L24.1239 38.2462Z" fill="#929FE5"/>
// </svg>`;
// const rotatedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
//   <path d="M34.3233 34.8889L27.7833 20.7495L46.7661 10.7123L34.3233 34.8889ZM11.8222 19.8567L12.8722 23.2734L7.3483 25.9651L11.8222 19.8567ZM43.1444 19.1784L48.4922 19.0323L37.7661 29.6367L43.1444 19.1789V19.1784ZM23.2589 27.5995L17.9516 37.5589L12.5422 19.9606L23.2589 27.5995ZM37.7172 43.8212L18.3505 38.2028L27.3372 21.3484L37.7172 43.8206V43.8212ZM39.74 40.0001L52.3939 42.3917L47.0861 44.8173L39.74 40.0001ZM35.8761 38.2462L52.6766 49.2723L38.5739 44.0784L35.8783 38.2506L35.8761 38.2462Z" fill="#929FE5"/>
// </svg>`;

// const colors = {
//   normal: new THREE.Color(146 / 255, 159 / 255, 229 / 255),
//   featured: new THREE.Color(146 / 255, 159 / 255, 229 / 255),
// };

// function initScene() {
//   scene = new THREE.Scene();
//   scene.background = new THREE.Color(0xfbfaf5);

//   camera = new THREE.PerspectiveCamera(
//     55,
//     window.innerWidth / window.innerHeight,
//     1,
//     1000
//   );
//   camera.position.set(0, 0, 20);

//   renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   document.body.appendChild(renderer.domElement);

//   controls = new OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true;
//   controls.enableZoom = true;
//   controls.minDistance = 10;
//   controls.maxDistance = 20;
// }

// function createBackgroundParticles() {
//   const particleCount = 1000;
//   const positions = new Float32Array(particleCount * 3);
//   const velocities = [];
//   const sphereRadius = 60;

//   function getRandomSpherePoint() {
//     const theta = Math.random() * Math.PI * 2;
//     const phi = Math.acos(Math.random() * 2 - 1);
//     const radius = Math.random() * sphereRadius;

//     return {
//       x: radius * Math.sin(phi) * Math.cos(theta),
//       y: radius * Math.sin(phi) * Math.sin(theta),
//       z: radius * Math.cos(phi),
//     };
//   }

//   for (let i = 0; i < particleCount * 3; i += 3) {
//     const point = getRandomSpherePoint();
//     positions[i] = point.x;
//     positions[i + 1] = point.y;
//     positions[i + 2] = point.z;

//     velocities.push({
//       x: (Math.random() - 0.5) * 0.01,
//       y: (Math.random() - 0.5) * 0.01,
//       z: (Math.random() - 0.5) * 0.01,
//     });
//   }

//   const geometry = new THREE.BufferGeometry();
//   geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

//   const material = new THREE.PointsMaterial({
//     size: 0.5,
//     color: 0x7589f2,
//     transparent: true,
//     // opacity: 0.4,
//     blending: THREE.AdditiveBlending,
//   });

//   const points = new THREE.Points(geometry, material);

//   return {
//     points,
//     update: function () {
//       const positions = points.geometry.attributes.position.array;

//       for (let i = 0; i < particleCount; i++) {
//         const i3 = i * 3;

//         positions[i3] += velocities[i].x;
//         positions[i3 + 1] += velocities[i].y;
//         positions[i3 + 2] += velocities[i].z;

//         const distance = Math.sqrt(
//           positions[i3] * positions[i3] +
//             positions[i3 + 1] * positions[i3 + 1] +
//             positions[i3 + 2] * positions[i3 + 2]
//         );

//         if (distance > sphereRadius) {
//           const newPoint = getRandomSpherePoint();
//           positions[i3] = newPoint.x;
//           positions[i3 + 1] = newPoint.y;
//           positions[i3 + 2] = newPoint.z;

//           velocities[i].x = (Math.random() - 0.5) * 0.01;
//           velocities[i].y = (Math.random() - 0.5) * 0.01;
//           velocities[i].z = (Math.random() - 0.5) * 0.01;
//         }
//       }

//       points.geometry.attributes.position.needsUpdate = true;
//     },
//   };
// }

// function createSVGSprite(svg) {
//   const blob = new Blob([svg], {
//     type: "image/svg+xml",
//   });
//   const url = URL.createObjectURL(blob);

//   const canvas = document.createElement("canvas");
//   canvas.width = 1000;
//   canvas.height = 1000;
//   const ctx = canvas.getContext("2d");

//   const img = new Image();

//   return new Promise((resolve) => {
//     img.onload = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//       const texture = new THREE.CanvasTexture(canvas);
//       texture.needsUpdate = true;
//       texture.magFilter = THREE.NearestFilter;
//       texture.minFilter = THREE.LinearFilter;

//       resolve(texture);
//       URL.revokeObjectURL(url);
//     };
//     img.src = url;
//   });
// }

// // Crear los puntos principales
// // async function createPoints() {
// //   const pts = [];
// //   const normals = [];
// //   const q = new THREE.Quaternion();
// //   const front = new THREE.Vector3(0, 0, 1);

// //   const existingPoints = []; // Para almacenar los puntos generados

// //   for (let i = 0; i < amount; i++) {
// //     let newPoint;
// //     let retries = 0;

// //     // Intentar generar un punto que no se superponga
// //     do {
// //       let randAngle = Math.random() * Math.PI * 2;
// //       let randRadius = Math.random();
// //       newPoint = new THREE.Vector3(
// //         Math.cos(randAngle) * (8 + randRadius),
// //         Math.sin(randAngle) * (8 + randRadius),
// //         0
// //       );

// //       // Aplicar rotación aleatoria
// //       let randNorm = new THREE.Vector3().randomDirection();
// //       q.setFromUnitVectors(front, randNorm);
// //       newPoint.applyQuaternion(q);

// //       retries++;
// //       // Limitar los intentos para evitar un bucle infinito
// //       if (retries > 100) {
// //         console.warn(
// //           "No se pudo encontrar un punto válido después de 100 intentos."
// //         );
// //         break;
// //       }
// //     } while (!isFarEnough(newPoint, existingPoints)); // Verificar si está lo suficientemente lejos

// //     // Agregar el punto a la lista de puntos existentes
// //     pts.push(newPoint);
// //     existingPoints.push(newPoint); // Guardamos este punto

// //     const randNorm = new THREE.Vector3().randomDirection();
// //     normals.push(randNorm);

// //     if (i < featuredCount) {
// //       featuredPoints.add(i);
// //     }
// //   }

// //   const geometry = new THREE.BufferGeometry().setFromPoints(pts);

// //   // Inicializar colores
// //   const colorArray = new Float32Array(amount * 3);
// //   for (let i = 0; i < amount; i++) {
// //     const color = featuredPoints.has(i) ? colors.featured : colors.normal;
// //     colorArray[i * 3] = color.r;
// //     colorArray[i * 3 + 1] = color.g;
// //     colorArray[i * 3 + 2] = color.b;
// //   }

// //   geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

// //   const spriteTexture = await createSVGSprite(originalSvg);
// //   const material = new THREE.PointsMaterial({
// //     size: 1.85,
// //     map: spriteTexture,
// //     transparent: true,
// //     vertexColors: true,
// //     alphaTest: 0.5,
// //     depthWrite: false,
// //   });

// //   points = new THREE.Points(geometry, material);
// //   scene.add(points);
// // }
// // async function createPoints() {
// //   const pts = [];
// //   const normals = [];
// //   const q = new THREE.Quaternion();
// //   const front = new THREE.Vector3(0, 0, 1);

// //   const existingPoints = []; // Para almacenar los puntos generados

// //   // Generar puntos principales
// //   for (let i = 0; i < amount; i++) {
// //     let newPoint;
// //     let retries = 0;

// //     // Intentar generar un punto que no se superponga
// //     do {
// //       let randAngle = Math.random() * Math.PI * 2;
// //       let randRadius = Math.random();
// //       newPoint = new THREE.Vector3(
// //         Math.cos(randAngle) * (8 + randRadius),
// //         Math.sin(randAngle) * (8 + randRadius),
// //         0
// //       );

// //       // Aplicar rotación aleatoria
// //       let randNorm = new THREE.Vector3().randomDirection();
// //       q.setFromUnitVectors(front, randNorm);
// //       newPoint.applyQuaternion(q);

// //       retries++;
// //       // Limitar los intentos para evitar un bucle infinito
// //       if (retries > 100) {
// //         console.warn(
// //           "No se pudo encontrar un punto válido después de 100 intentos."
// //         );
// //         break;
// //       }
// //     } while (!isFarEnough(newPoint, existingPoints)); // Verificar si está lo suficientemente lejos

// //     // Agregar el punto a la lista de puntos existentes
// //     pts.push(newPoint);
// //     existingPoints.push(newPoint); // Guardamos este punto

// //     const randNorm = new THREE.Vector3().randomDirection();
// //     normals.push(randNorm);

// //     if (i < featuredCount) {
// //       featuredPoints.add(i);
// //     }
// //   }

// //   // Generar puntos rotados
// //   for (let i = 0; i < amountRotated; i++) {
// //     let newPoint;
// //     let retries = 0;

// //     // Intentar generar un punto que no se superponga
// //     do {
// //       let randAngle = Math.random() * Math.PI * 2;
// //       let randRadius = Math.random();
// //       newPoint = new THREE.Vector3(
// //         Math.cos(randAngle) * (8 + randRadius),
// //         Math.sin(randAngle) * (8 + randRadius),
// //         0
// //       );

// //       // Aplicar rotación aleatoria
// //       let randNorm = new THREE.Vector3().randomDirection();
// //       q.setFromUnitVectors(front, randNorm);
// //       newPoint.applyQuaternion(q);

// //       retries++;
// //       // Limitar los intentos para evitar un bucle infinito
// //       if (retries > 100) {
// //         console.warn(
// //           "No se pudo encontrar un punto válido después de 100 intentos."
// //         );
// //         break;
// //       }
// //     } while (!isFarEnough(newPoint, existingPoints)); // Verificar si está lo suficientemente lejos

// //     // Agregar el punto a la lista de puntos existentes
// //     pts.push(newPoint);
// //     existingPoints.push(newPoint); // Guardamos este punto

// //     const randNorm = new THREE.Vector3().randomDirection();
// //     normals.push(randNorm);
// //   }

// //   const geometry = new THREE.BufferGeometry().setFromPoints(pts);

// //   // Inicializar colores
// //   const colorArray = new Float32Array((amount + amountRotated) * 3);
// //   for (let i = 0; i < amount + amountRotated; i++) {
// //     const color = featuredPoints.has(i) ? colors.featured : colors.normal;
// //     colorArray[i * 3] = color.r;
// //     colorArray[i * 3 + 1] = color.g;
// //     colorArray[i * 3 + 2] = color.b;
// //   }

// //   geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

// //   const spriteTexture = await createSVGSprite(originalSvg);
// //   const rotatedSpriteTexture = await createSVGSprite(rotatedSvg); // Crear textura para puntos rotados

// //   const material = new THREE.PointsMaterial({
// //     size: 1.85,
// //     map: spriteTexture,
// //     transparent: true,
// //     vertexColors: true,
// //     alphaTest: 0.5,
// //     depthWrite: false,
// //   });

// //   points = new THREE.Points(geometry, material);
// //   scene.add(points);

// //   // Crear un segundo conjunto de puntos para los puntos rotados
// //   const rotatedMaterial = new THREE.PointsMaterial({
// //     size: 1.85,
// //     map: rotatedSpriteTexture,
// //     transparent: true,
// //     vertexColors: true,
// //     alphaTest: 0.5,
// //     depthWrite: false,
// //   });

// //   const rotatedPoints = new THREE.Points(geometry, rotatedMaterial);
// //   scene.add(rotatedPoints);
// // }

// async function createPoints() {
//   const pts = [];
//   const normals = [];
//   const q = new THREE.Quaternion();
//   const front = new THREE.Vector3(0, 0, 1);

//   const existingPoints = []; // Para almacenar los puntos generados

//   // Generar puntos principales
//   for (let i = 0; i < amount; i++) {
//     let newPoint;
//     let retries = 0;

//     // Intentar generar un punto que no se superponga
//     do {
//       let randAngle = Math.random() * Math.PI * 2;
//       let randRadius = Math.random();
//       newPoint = new THREE.Vector3(
//         Math.cos(randAngle) * (8 + randRadius),
//         Math.sin(randAngle) * (8 + randRadius),
//         0
//       );

//       // Aplicar rotación aleatoria
//       let randNorm = new THREE.Vector3().randomDirection();
//       q.setFromUnitVectors(front, randNorm);
//       newPoint.applyQuaternion(q);

//       retries++;
//       // Limitar los intentos para evitar un bucle infinito
//       if (retries > 100) {
//         console.warn(
//           "No se pudo encontrar un punto válido después de 100 intentos."
//         );
//         break;
//       }
//     } while (!isFarEnough(newPoint, existingPoints)); // Verificar si está lo suficientemente lejos

//     // Agregar el punto a la lista de puntos existentes
//     pts.push(newPoint);
//     existingPoints.push(newPoint); // Guardamos este punto

//     const randNorm = new THREE.Vector3().randomDirection();
//     normals.push(randNorm);

//     if (i < featuredCount) {
//       featuredPoints.add(i);
//     }
//   }

//   // Generar puntos rotados
//   for (let i = 0; i < amountRotated; i++) {
//     let newPoint;
//     let retries = 0;

//     // Intentar generar un punto que no se superponga
//     do {
//       let randAngle = Math.random() * Math.PI * 2;
//       let randRadius = Math.random() * 2 + 10; // Aumentar el rango para mayor separación
//       newPoint = new THREE.Vector3(
//         Math.cos(randAngle) * randRadius,
//         Math.sin(randAngle) * randRadius,
//         Math.random() * 10 - 5 // Añadir variación en el eje Z
//       );

//       // Aplicar rotación aleatoria
//       let randNorm = new THREE.Vector3().randomDirection();
//       q.setFromUnitVectors(front, randNorm);
//       newPoint.applyQuaternion(q);

//       retries++;
//       // Limitar los intentos para evitar un bucle infinito
//       if (retries > 100) {
//         console.warn(
//           "No se pudo encontrar un punto válido después de 100 intentos."
//         );
//         break;
//       }
//     } while (!isFarEnough(newPoint, existingPoints)); // Verificar si está lo suficientemente lejos

//     // Agregar el punto a la lista de puntos existentes
//     pts.push(newPoint);
//     existingPoints.push(newPoint); // Guardamos este punto

//     const randNorm = new THREE.Vector3().randomDirection();
//     normals.push(randNorm);
//   }

//   const geometry = new THREE.BufferGeometry().setFromPoints(pts);

//   // Inicializar colores
//   const colorArray = new Float32Array((amount + amountRotated) * 3);
//   for (let i = 0; i < amount + amountRotated; i++) {
//     const color = featuredPoints.has(i) ? colors.featured : colors.normal;
//     colorArray[i * 3] = color.r;
//     colorArray[i * 3 + 1] = color.g;
//     colorArray[i * 3 + 2] = color.b;
//   }

//   geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

//   const spriteTexture = await createSVGSprite(originalSvg);
//   const rotatedSpriteTexture = await createSVGSprite(rotatedSvg); // Crear textura para puntos rotados

//   const material = new THREE.PointsMaterial({
//     size: 1.85,
//     map: spriteTexture,
//     transparent: true,
//     vertexColors: true,
//     alphaTest: 0.5,
//     depthWrite: false,
//   });

//   points = new THREE.Points(geometry, material);
//   scene.add(points);

//   // Crear un segundo conjunto de puntos para los puntos rotados
//   const rotatedMaterial = new THREE.PointsMaterial({
//     size: 1.85,
//     map: rotatedSpriteTexture,
//     transparent: true,
//     vertexColors: true,
//     alphaTest: 0.5,
//     depthWrite: false,
//   });

//   const rotatedPoints = new THREE.Points(geometry, rotatedMaterial);
//   scene.add(rotatedPoints);
// }

// // Modificar la función isFarEnough para aceptar un parámetro de distancia
// function isFarEnough(newPoint, existingPoints, minDistance = MIN_DISTANCE) {
//   for (let point of existingPoints) {
//     const distance = newPoint.distanceTo(point);
//     if (distance < minDistance) {
//       return false; // El punto está demasiado cerca de otro
//     }
//   }
//   return true; // El punto está lo suficientemente lejos
// }

// function setupEventListeners() {
//   window.addEventListener("resize", () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   });

//   window.addEventListener("mousemove", (event) => {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//   });

//   window.addEventListener("click", () => {
//     if (hoveredCraneIndex !== null) {
//       alert(`¡Clickeaste el punto destacado #${hoveredCraneIndex}!`);
//     }
//   });
// }

// function animate() {
//   requestAnimationFrame(animate);

//   backgroundParticles.update();

//   raycaster.setFromCamera(mouse, camera);

//   points.geometry.attributes.color.needsUpdate = true;
//   points.rotation.y += 0.0001;

//   controls.update();
//   renderer.render(scene, camera);
// }

// async function init() {
//   initScene();
//   backgroundParticles = createBackgroundParticles();
//   scene.add(backgroundParticles.points);

//   await createPoints();
//   setupEventListeners();
//   animate();
// }

// init();
