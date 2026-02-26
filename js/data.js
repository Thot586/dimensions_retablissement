// ============================================================
// data.js — Données des 4 dimensions du rétablissement
// Basé sur van der Stel (2012) adapté par Franck (2018)
// ============================================================

export const dimensionsData = [
    {
        id: 0,
        title: "Rétablissement Social",
        shortDesc: "Logement, emploi, liens sociaux et intégration citoyenne",
        desc: "Implique l'autonomie en termes de logement, d'emploi, de revenu et la richesse des relations sociales. Cela reflète l'intégration citoyenne.",
        color: 0x3b82f6,
        cause: "La perte des liens sociaux et de l'autonomie matérielle isole l'individu. Sans ancrage dans la communauté, l'exclusion sociale s'installe, entraînant la chute des autres piliers."
    },
    {
        id: 1,
        title: "Rétablissement Clinique",
        shortDesc: "Rémission symptomatique et gestion de la pathologie",
        desc: "Concerne la rémission symptomatique via des interventions psychologiques et pharmacologiques. C'est la gestion de la pathologie.",
        color: 0xef4444,
        cause: "Sans une gestion adéquate et apaisée des symptômes, la souffrance psychique et cognitive sature l'espace mental, rendant le fonctionnement quotidien et social impraticables."
    },
    {
        id: 2,
        title: "Rétablissement Fonctionnel",
        shortDesc: "Capacité à affronter le quotidien et gérer ses limitations",
        desc: "Restauration de la capacité à affronter des situations quotidiennes, à utiliser ses capacités et à compenser ou gérer ses limitations.",
        color: 0xeab308,
        cause: "L'incapacité à accomplir les activités de la vie quotidienne crée une dépendance invalidante. Cette perte de capacité entrave directement l'espoir personnel et l'intégration sociale."
    },
    {
        id: 3,
        title: "Rétablissement Personnel",
        shortDesc: "Espoir, identité, sens de l'existence et empowerment",
        desc: "Processus intime de restauration du sens de l'existence, de l'identité, de l'espoir et du pouvoir d'agir (empowerment).",
        color: 0x14b8a6,
        cause: "L'absence d'espoir, de sens et d'estime de soi détruit la motivation intrinsèque. Sans ce moteur intime, les traitements cliniques et les aides sociales perdent leur utilité subjective."
    }
];

export const originalPositions = [
    { x:  2.425, y: 1.2, z: -1.4 },  // 0: Social (arrière-droite)
    { x: -2.425, y: 1.2, z: -1.4 },  // 1: Clinique (arrière-gauche)
    { x:  0,     y: 1.2, z:  2.8 },  // 2: Fonctionnel (avant-centre)
    { x:  0,     y: 1.2, z:  0   }   // 3: Personnel (CENTRE)
];

export const collapseStates = [
    { rx:  0.4, rz:  0.4, slideX: -1, slideZ:  1 },                  // 0 retiré → bascule avant-gauche (côté lourd)
    { rx:  0.4, rz: -0.4, slideX:  1, slideZ:  1 },                  // 1 retiré → bascule avant-droite (côté lourd)
    { rx: -0.5, rz:  0,   slideX:  0, slideZ: -1 },                   // 2 retiré → bascule arrière (côté lourd)
    { rx:  0.7, rz:  0.7, slideX:  0, slideZ:  0, chaotic: true }     // 3 retiré → chaotique (centre)
];
