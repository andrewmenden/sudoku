import * as THREE from './three.js';

const container = document.querySelector('#board-container');
if (!container) {
    throw new Error('Container element not found');
}

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    container.clientWidth / -2,
    container.clientWidth / 2,
    container.clientHeight / 2,
    container.clientHeight / -2,
    1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const paddle = new THREE.Mesh(geometry, material);
scene.add(paddle);

const ballGeometry = new THREE.SphereGeometry(5, 32, 32);
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ball);

camera.position.z = 50;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();