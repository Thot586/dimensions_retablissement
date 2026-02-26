// ============================================================
// physics.js — Logique d'effondrement et de restauration
// ============================================================

import { originalPositions, collapseStates } from './data.js';

export function triggerCollapse(index, state) {
    state.isCollapsed = true;
    state.collapsedIndex = index;
    state.collapseStartTime = Date.now();

    // Phase de levée : la sphère monte avant que le plateau ne bascule
    state.liftPhase = true;
}

export function resetSystem(state) {
    // Réinitialiser le plateau
    state.boardGroup.rotation.set(0, 0, 0);

    // Réinitialiser chaque sphère
    state.spheres.forEach((sphere, i) => {
        sphere.visible = true;
        const pos = originalPositions[i];
        sphere.position.set(pos.x, pos.y, pos.z);
        sphere.rotation.set(0, 0, 0);
        state.velocities[i].set(0, 0, 0);
    });

    state.isCollapsed = false;
    state.collapsedIndex = -1;
    state.selectedSphereIndex = -1;
    state.liftPhase = false;

    setTimeout(() => {
        state.isInteractive = true;
    }, 400);
}

export function updatePhysics(state) {
    // --- Phase de levée : la sphère retirée monte vers le haut ---
    if (state.liftPhase && state.collapsedIndex !== -1) {
        const sphere = state.spheres[state.collapsedIndex];
        sphere.position.y += 0.15;

        // Une fois assez haute, la cacher
        if (sphere.position.y > 6) {
            sphere.visible = false;
            state.liftPhase = false;
        }
        // PAS de return → le basculement commence en parallèle
    }

    // --- Phase d'effondrement (commence dès le retrait) ---
    if (state.isCollapsed && state.collapsedIndex !== -1) {
        const cs = collapseStates[state.collapsedIndex];

        if (cs.chaotic) {
            // Effondrement chaotique (Personnel retiré = centre)
            const now = Date.now();
            const elapsed = now - state.collapseStartTime;
            const t = now * 0.002;

            // Amplitude qui monte puis redescend (amortissement exponentiel)
            const ramp = Math.min(elapsed * 0.001, 1.0);       // montée 0→1 en ~1s
            const damping = Math.exp(-elapsed * 0.0008);        // décroissance exponentielle
            const amplitude = ramp * damping;                    // monte puis s'éteint

            // Oscillation amortie + convergence vers position inclinée fixe
            const targetRx = Math.sin(t * 3.7) * cs.rx * amplitude + cs.rx * 0.3 * (1 - damping);
            const targetRz = Math.cos(t * 2.3) * cs.rz * amplitude + cs.rz * 0.3 * (1 - damping);
            state.boardGroup.rotation.x += (targetRx - state.boardGroup.rotation.x) * 0.05;
            state.boardGroup.rotation.z += (targetRz - state.boardGroup.rotation.z) * 0.05;

            // Sphères poussées radialement vers l'extérieur
            state.spheres.forEach((sphere, i) => {
                if (i !== state.collapsedIndex && sphere.visible) {
                    const dx = sphere.position.x;
                    const dz = sphere.position.z;
                    const dist = Math.sqrt(dx * dx + dz * dz) || 1;

                    // Poussée radiale croissante
                    state.velocities[i].x += (dx / dist) * 0.004 * amplitude;
                    state.velocities[i].z += (dz / dist) * 0.004 * amplitude;

                    const distFromCenter = Math.sqrt(
                        sphere.position.x ** 2 + sphere.position.z ** 2
                    );

                    if (distFromCenter > 4.5) {
                        state.velocities[i].y -= 0.015;
                        sphere.rotation.x += 0.1;
                        sphere.rotation.z += 0.1;
                    }

                    sphere.position.add(state.velocities[i]);

                    if (sphere.position.y < -20) {
                        sphere.visible = false;
                    }
                }
            });
        } else {
            // Effondrement directionnel standard
            // Basculement progressif du plateau (lerp)
            state.boardGroup.rotation.x += (cs.rx - state.boardGroup.rotation.x) * 0.03;
            state.boardGroup.rotation.z += (cs.rz - state.boardGroup.rotation.z) * 0.03;

            // Glissement et chute des sphères restantes
            state.spheres.forEach((sphere, i) => {
                if (i !== state.collapsedIndex && sphere.visible) {
                    state.velocities[i].x += cs.slideX * 0.003;
                    state.velocities[i].z += cs.slideZ * 0.003;

                    const distFromCenter = Math.sqrt(
                        sphere.position.x ** 2 + sphere.position.z ** 2
                    );

                    if (distFromCenter > 4.5) {
                        state.velocities[i].y -= 0.015;
                        sphere.rotation.x += 0.1;
                        sphere.rotation.z += 0.1;
                    }

                    sphere.position.add(state.velocities[i]);

                    if (sphere.position.y < -20) {
                        sphere.visible = false;
                    }
                }
            });
        }
    } else if (!state.isCollapsed && state.isInteractive) {
        // Léger balancement naturel (respiration)
        const time = Date.now() * 0.001;
        state.boardGroup.rotation.x = Math.sin(time) * 0.02;
        state.boardGroup.rotation.z = Math.cos(time * 0.8) * 0.02;
    }
}
