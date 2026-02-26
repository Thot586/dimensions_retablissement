// ============================================================
// interaction.js — Raycasting, hover, tooltip, clic, modales
// ============================================================

import { dimensionsData } from './data.js';
import { triggerCollapse, resetSystem } from './physics.js';

let raycaster;
let mouse;
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

export function setupInteraction(camera, state) {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', () => onWindowResize(camera, state.renderer));
    window.addEventListener('pointermove', (e) => onPointerMove(e, camera, state));
    window.addEventListener('pointerdown', (e) => onPointerDown(e, camera, state));

    // Boutons des modales
    document.getElementById('btn-close-modal').addEventListener('click', () => closeModal(state));
    document.getElementById('btn-remove-pillar').addEventListener('click', () => removePillar(state));
    document.getElementById('btn-restore').addEventListener('click', () => handleReset(state));

    // Footer toggle
    const footerToggle = document.getElementById('footer-toggle');
    const footerPanel = document.getElementById('footer-panel');
    const footerClose = document.getElementById('footer-close');

    footerToggle.addEventListener('click', () => {
        footerPanel.classList.add('open');
    });
    footerClose.addEventListener('click', () => {
        footerPanel.classList.remove('open');
    });
}

function onWindowResize(camera, renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Caméra adaptative selon la taille d'écran
    if (window.innerWidth < 480) {
        camera.position.set(0, 16, 24);
    } else if (window.innerWidth < 768) {
        camera.position.set(0, 14, 20);
    } else {
        camera.position.set(0, 10, 15);
    }
}

function onPointerMove(event, camera, state) {
    if (!state.isInteractive || state.isCollapsed) {
        document.body.style.cursor = 'default';
        hideTooltip();
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(state.spheres);

    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        const hitSphere = intersects[0].object;
        hitSphere.scale.set(1.05, 1.05, 1.05);

        // Tooltip au survol (pas sur tactile)
        if (!isTouchDevice) {
            showTooltip(hitSphere.userData, event.clientX, event.clientY);
        }
    } else {
        document.body.style.cursor = 'default';
        state.spheres.forEach(s => s.scale.set(1, 1, 1));
        hideTooltip();
    }
}

function onPointerDown(event, camera, state) {
    if (!state.isInteractive || state.isCollapsed) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(state.spheres);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        openModal(clickedObject.userData, state);
    }
}

// --- Tooltip ---

function showTooltip(data, mouseX, mouseY) {
    const tooltip = document.getElementById('hover-tooltip');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipDesc = document.getElementById('tooltip-desc');
    const tooltipDot = document.getElementById('tooltip-dot');

    tooltipTitle.innerText = data.title;
    tooltipDesc.innerText = data.shortDesc || data.desc;

    const colorHex = '#' + data.color.toString(16).padStart(6, '0');
    tooltipDot.style.backgroundColor = colorHex;

    // Positionner près du curseur
    const offsetX = 16;
    const offsetY = 16;
    let left = mouseX + offsetX;
    let top = mouseY + offsetY;

    // Éviter le débordement à droite
    if (left + 260 > window.innerWidth) {
        left = mouseX - 260 - offsetX;
    }
    // Éviter le débordement en bas
    if (top + 100 > window.innerHeight) {
        top = mouseY - 100 - offsetY;
    }
    // Éviter le débordement à gauche
    if (left < 8) {
        left = 8;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.remove('hidden');
}

function hideTooltip() {
    const tooltip = document.getElementById('hover-tooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
    }
}

// --- Modales ---

function openModal(data, state) {
    hideTooltip();
    state.isInteractive = false;
    state.selectedSphereIndex = data.id;

    const modal = document.getElementById('info-modal');
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-desc').innerText = data.desc;

    const colorHex = '#' + data.color.toString(16).padStart(6, '0');
    document.getElementById('modal-color-indicator').style.backgroundColor = colorHex;

    modal.classList.remove('hidden', 'modal-exit-active');
    modal.classList.add('modal-enter');
    void modal.offsetWidth; // force reflow
    modal.classList.add('modal-enter-active');
}

function closeModal(state) {
    const modal = document.getElementById('info-modal');
    modal.classList.remove('modal-enter', 'modal-enter-active');
    modal.classList.add('modal-exit-active');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('modal-exit-active');
        if (!state.isCollapsed) state.isInteractive = true;
    }, 300);
}

function removePillar(state) {
    closeModal(state);

    const index = state.selectedSphereIndex;
    triggerCollapse(index, state);

    // Afficher la modale d'effondrement après un délai
    const causeText = dimensionsData[index].cause;
    document.getElementById('collapse-reason').innerText = causeText;

    setTimeout(() => {
        const collapseModal = document.getElementById('collapse-modal');
        collapseModal.classList.remove('hidden', 'collapse-exit-active');
        collapseModal.classList.add('collapse-enter');
        void collapseModal.offsetWidth;
        collapseModal.classList.add('collapse-enter-active');
    }, 2500);
}

function handleReset(state) {
    // Cacher la modale d'effondrement
    const collapseModal = document.getElementById('collapse-modal');
    collapseModal.classList.remove('collapse-enter', 'collapse-enter-active');
    collapseModal.classList.add('collapse-exit-active');
    setTimeout(() => collapseModal.classList.add('hidden'), 300);

    resetSystem(state);
}
