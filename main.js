// main.js

/***********************
 * 1. RAIN ANIMATION   *
 ************************/
const rainContainer = document.querySelector(".rain");
const NUM_DROPS = 140;

for (let i = 0; i < NUM_DROPS; i++) {
  const drop = document.createElement("div");
  drop.classList.add("raindrop");

  const left = Math.random() * 100;
  const height = 50 + Math.random() * 80;
  const thickness = 0.7 + Math.random() * 1.2;
  const duration = 1.8 + Math.random() * 1.8;
  const delay = Math.random() * 2.5;

  drop.style.left = `${left}vw`;
  drop.style.height = `${height}px`;
  drop.style.width = `${thickness}px`;
  drop.style.animationDuration = `${duration}s`;
  drop.style.animationDelay = `${delay}s`;

  rainContainer.appendChild(drop);
}

/**********************************
 * 2. FADE RAIN ON SCROLL         *
 **********************************/
const heroSection = document.querySelector(".hero");

function updateRainOpacity() {
  const heroHeight = heroSection.offsetHeight || window.innerHeight;
  const scrollY = window.scrollY || window.pageYOffset;
  const t = Math.min(scrollY / (heroHeight * 0.7), 1);
  const newOpacity = 1 - t;
  rainContainer.style.opacity = newOpacity;
}

window.addEventListener("scroll", updateRainOpacity);
window.addEventListener("resize", updateRainOpacity);
updateRainOpacity();

/**********************************
 * 3. GLOBE + MONSOON POINTS      *
 **********************************/

window.addEventListener("load", () => {
  const globeEl = document.getElementById("monsoon-globe");
  if (!globeEl || typeof Globe === "undefined") return;

  // Monsoon regions (for centers only)
  const monsoonRegions = [
    {
      id: "ISM",
      name: "Indian Summer Monsoon",
      latMin: 5,
      latMax: 35,
      lonMin: 60,
      lonMax: 100,
      color: "#ffb347",
    },
    {
      id: "WAM",
      name: "West African Monsoon",
      latMin: 5,
      latMax: 20,
      lonMin: -20,
      lonMax: 20,
      color: "#ff6b6b",
    },
    {
      id: "SAMS",
      name: "South American Monsoon",
      latMin: -25,
      latMax: 5,
      lonMin: -70,
      lonMax: -35,
      color: "#9ee7ff",
    },
  ];

  const monsoonPoints = monsoonRegions.map((r) => ({
    id: r.id,
    name: r.name,
    lat: (r.latMin + r.latMax) / 2,
    lng: (r.lonMin + r.lonMax) / 2,
    color: r.color,
  }));

    const worldGlobe = Globe()(globeEl);

  // Blue globe WITH countries visible, no grid lines
  worldGlobe
  .globeImageUrl(
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
  ) // bright, realistic but light texture
  .bumpImageUrl(null)
  .backgroundColor("rgba(0,0,0,0)")
  .showAtmosphere(false)
  .showGraticules(false);

// LIGHT BLUE TINT
const mat = worldGlobe.globeMaterial();
mat.color = new THREE.Color("#6aa0ff");     // light blue tint
mat.emissive = new THREE.Color("#1a2e6f");  // soft navy glow
mat.emissiveIntensity = 0.4;
mat.specular = new THREE.Color("#000000");



  // Big clickable points for each monsoon
  worldGlobe
    .pointsData(monsoonPoints)
    .pointLat("lat")
    .pointLng("lng")
    .pointAltitude(0.08)
    .pointRadius(0.75) // bigger dots
    .pointColor((d) => d.color)
    .pointResolution(32)
    .pointLabel((d) => d.name);

  // Initial view
  const INITIAL_ALT = 1.35; // closer = bigger globe
  worldGlobe.pointOfView({ lat: 5, lng: 0, altitude: INITIAL_ALT }, 0);

  const controls = worldGlobe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.enableZoom = false; // no zoom
  controls.enablePan = false; // optional: lock pan

  // Fit globe to container
  function resizeGlobe() {
    const { clientWidth, clientHeight } = globeEl;
    if (clientWidth && clientHeight) {
      worldGlobe.width(clientWidth);
      worldGlobe.height(clientHeight);
    }
  }
  window.addEventListener("resize", resizeGlobe);
  resizeGlobe();

  /**********************************
   * 4. CLICK-DRIVEN FOCUS          *
   **********************************/
  const stepEls = document.querySelectorAll(".monsoon-step");
  let activeMonsoonId = "ISM";
  let autoRotateStopped = false;

  function setActiveCard(id) {
    stepEls.forEach((el) => {
      el.classList.toggle("is-active", el.dataset.monsoon === id);
    });
  }

  function stopAutoRotateOnce() {
    if (!autoRotateStopped) {
      controls.autoRotate = false;
      autoRotateStopped = true;
    }
  }

  function focusMonsoon(id, animate = true) {
    const region = monsoonPoints.find((r) => r.id === id);
    if (!region) return;

    activeMonsoonId = id;

    worldGlobe.pointOfView(
      {
        lat: region.lat,
        lng: region.lng,
        altitude: INITIAL_ALT,
      },
      animate ? 1000 : 0
    );

    worldGlobe.pointAltitude((d) =>
      d.id === activeMonsoonId ? 0.13 : 0.08
    );

    setActiveCard(id);
  }

  // Clicking cards
  stepEls.forEach((step) => {
    step.addEventListener("click", () => {
      const id = step.getAttribute("data-monsoon");
      stopAutoRotateOnce();
      focusMonsoon(id, true);
    });
  });

  // Clicking points on the globe
  worldGlobe.onPointClick((d) => {
    if (!d || !d.id) return;
    stopAutoRotateOnce();
    focusMonsoon(d.id, true);
  });

  // Initial state
  focusMonsoon("ISM", false);
});
