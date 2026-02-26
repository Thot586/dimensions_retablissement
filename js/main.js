// ============================================================
// main.js — Point d'entrée, initialisation, boucle de rendu
// ============================================================

import { createScene, createLights, createSceneObjects } from './scene.js';
import { updatePhysics } from './physics.js';
import { setupInteraction } from './interaction.js';

// État global partagé entre les modules
const state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    boardGroup: null,
    spheres: [],
    labelSprites: [],
    velocities: [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
    ],
    isInteractive: true,
    selectedSphereIndex: -1,
    isCollapsed: false,
    collapsedIndex: -1,
    liftPhase: false,
    collapseStartTime: 0
};

const _worldPos = new THREE.Vector3();

function init() {
    const container = document.getElementById('canvas-container');

    // Setup scène
    const sceneSetup = createScene(container);
    state.scene = sceneSetup.scene;
    state.camera = sceneSetup.camera;
    state.renderer = sceneSetup.renderer;
    state.controls = sceneSetup.controls;

    // Lumières
    createLights(state.scene);

    // Objets 3D
    const objects = createSceneObjects(state.scene);
    state.boardGroup = objects.boardGroup;
    state.spheres = objects.spheres;
    state.labelSprites = objects.labelSprites;

    // Interactions
    setupInteraction(state.camera, state);

    // Démarrer la boucle
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    state.controls.update();
    updatePhysics(state);

    // Mise à jour des labels billboard (suivi des sphères)
    state.spheres.forEach((sphere, i) => {
        const label = state.labelSprites[i];
        if (label) {
            label.visible = sphere.visible;
            if (sphere.visible) {
                sphere.getWorldPosition(_worldPos);
                label.position.set(_worldPos.x, _worldPos.y + 1.6, _worldPos.z);
            }
        }
    });

    state.renderer.render(state.scene, state.camera);
}

window.onload = init;
