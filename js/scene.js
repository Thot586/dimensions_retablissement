// ============================================================
// scene.js — Setup Three.js : scène, caméra, lumières, objets
// ============================================================

import { dimensionsData, originalPositions } from './data.js';

const labelNames = ['Social', 'Clinique', 'Fonctionnel', 'Personnel'];

export function createScene(container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);
    scene.fog = new THREE.Fog(0xf0f4f8, 10, 40);

    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    // Caméra adaptative selon la taille d'écran
    if (window.innerWidth < 480) {
        camera.position.set(0, 16, 24);
    } else if (window.innerWidth < 768) {
        camera.position.set(0, 14, 20);
    } else {
        camera.position.set(0, 10, 15);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Empêcher le scroll/zoom tactile par défaut sur le canvas
    renderer.domElement.style.touchAction = 'none';

    return { scene, camera, renderer, controls };
}

export function createLights(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);
}

// --- Labels billboard (THREE.Sprite + Canvas) ---

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function createSphereLabel(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 512;
    canvas.height = 128;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mesurer le texte pour dimensionner la pilule
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const padding = 28;

    // Pilule arrondie noire semi-transparente
    const bgW = textWidth + padding * 2;
    const bgH = 72;
    const bgX = (canvas.width - bgW) / 2;
    const bgY = (canvas.height - bgH) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    roundRect(ctx, bgX, bgY, bgW, bgH, 20);
    ctx.fill();

    // Texte blanc
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.5, 0.875, 1); // ratio 4:1 du canvas

    return sprite;
}

// --- Texture "Rétablissement" gravée sur le plateau ---

function createBoardTopTexture() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1024;
    canvas.height = 1024;

    // Fond couleur bois
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, 1024, 1024);

    // Texte gravé au centre
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate(Math.PI); // compenser l'UV flip du CylinderGeometry
    ctx.font = 'bold 68px Georgia, "Times New Roman", serif';
    ctx.fillStyle = 'rgba(101, 67, 33, 0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Rétablissement', 0, 200);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function createSceneObjects(scene) {
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0xdeb887,
        roughness: 0.8,
        metalness: 0.1
    });

    // Sol pour recevoir les ombres
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Groupe du plateau
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // Plateau avec texture gravée sur le dessus
    const topTexture = createBoardTopTexture();
    const topMaterial = new THREE.MeshStandardMaterial({
        map: topTexture,
        roughness: 0.8,
        metalness: 0.1
    });
    const boardMaterials = [woodMaterial, topMaterial, woodMaterial]; // côté, dessus, dessous

    const boardGeo = new THREE.CylinderGeometry(5, 5, 0.4, 64);
    const board = new THREE.Mesh(boardGeo, boardMaterials);
    board.castShadow = true;
    board.receiveShadow = true;
    boardGroup.add(board);

    // Les 4 sphères
    const spheres = [];
    dimensionsData.forEach((data, index) => {
        const mat = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.3,
            metalness: 0.2
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), mat);

        const pos = originalPositions[index];
        sphere.position.set(pos.x, pos.y, pos.z);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.userData = data;

        boardGroup.add(sphere);
        spheres.push(sphere);
    });

    // Labels billboard au-dessus de chaque sphère
    const labelSprites = [];
    spheres.forEach((sphere, index) => {
        const label = createSphereLabel(labelNames[index]);
        // Position initiale (sera mise à jour dans animate)
        const worldPos = new THREE.Vector3();
        sphere.getWorldPosition(worldPos);
        label.position.set(worldPos.x, worldPos.y + 1.6, worldPos.z);
        scene.add(label); // ajouté à la scène, pas au boardGroup
        labelSprites.push(label);
    });

    return { boardGroup, spheres, labelSprites };
}
