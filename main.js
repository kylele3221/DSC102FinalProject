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

function initIsmRadial() {
  const svg = document.getElementById("ism-radial-svg");
  const slider = document.getElementById("ism-year-slider");
  const label = document.getElementById("ism-year-label");
  const playBtn = document.getElementById("ism-play");
  if (!svg || !slider || !label || !playBtn) return;
  const NS = "http://www.w3.org/2000/svg";
  const width = 400;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = 140;
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  let dataByYear = {};
  let years = [];
  let maxPr = 0;

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(",");
    const yearIdx = header.indexOf("year");
    const monthIdx = header.indexOf("month");
    const prIdx = header.indexOf("pr");
    lines.forEach((line) => {
      if (!line) return;
      const cols = line.split(",");
      const y = parseInt(cols[yearIdx], 10);
      const m = parseInt(cols[monthIdx], 10);
      const pr = parseFloat(cols[prIdx]);
      if (!dataByYear[y]) dataByYear[y] = {};
      dataByYear[y][m] = pr;
      if (!years.includes(y)) years.push(y);
      if (!isNaN(pr) && pr > maxPr) maxPr = pr;
    });
    years.sort((a, b) => a - b);
  }

  function createAxes() {
    const axesGroup = document.createElementNS(NS, "g");
    axesGroup.setAttribute("class", "radial-axes");
    const rings = 4;
    for (let r = 1; r <= rings; r++) {
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", (maxR * r) / rings);
      circle.setAttribute("class", "radial-ring");
      axesGroup.appendChild(circle);
    }
    const monthLabels = ["J","F","M","A","M","J","J","A","S","O","N","D"];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x2 = cx + maxR * Math.cos(angle);
      const y2 = cy + maxR * Math.sin(angle);
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("class", "radial-spoke");
      axesGroup.appendChild(line);
      const lx = cx + (maxR + 16) * Math.cos(angle);
      const ly = cy + (maxR + 16) * Math.sin(angle) + 4;
      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", lx);
      text.setAttribute("y", ly);
      text.setAttribute("class", "radial-month-label");
      text.textContent = monthLabels[i];
      axesGroup.appendChild(text);
    }
    svg.appendChild(axesGroup);
  }

  const dataGroup = document.createElementNS(NS, "g");
  dataGroup.setAttribute("class", "radial-data");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("class", "radial-path");
  const dotsGroup = document.createElementNS(NS, "g");
  dotsGroup.setAttribute("class", "radial-dots");
  dataGroup.appendChild(path);
  dataGroup.appendChild(dotsGroup);
  svg.appendChild(dataGroup);

  function drawYear(year) {
    const months = dataByYear[year];
    if (!months) return;
    label.textContent = year;
    let d = "";
    const points = [];
    dotsGroup.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const m = i + 1;
      const pr = months[m] || 0;
      const r = maxPr ? (pr / maxPr) * maxR : 0;
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push([x, y]);
      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("r", 3);
      dot.setAttribute("class", "radial-dot");
      dotsGroup.appendChild(dot);
    }
    points.forEach((p, idx) => {
      d += (idx === 0 ? "M" : "L") + p[0] + " " + p[1] + " ";
    });
    d += "Z";
    path.setAttribute("d", d.trim());
  }

  let playTimer = null;
  function startPlay() {
    if (playTimer || years.length === 0) return;
    playBtn.textContent = "Pause";
    playTimer = setInterval(() => {
      const currentYear = parseInt(slider.value, 10);
      const idx = years.indexOf(currentYear);
      const nextYear = years[(idx + 1) % years.length];
      slider.value = nextYear;
      drawYear(nextYear);
    }, 900);
  }

  function stopPlay() {
    if (!playTimer) return;
    clearInterval(playTimer);
    playTimer = null;
    playBtn.textContent = "Play";
  }

  slider.addEventListener("input", () => {
    stopPlay();
    const y = parseInt(slider.value, 10);
    drawYear(y);
  });

  playBtn.addEventListener("click", () => {
    if (playTimer) {
      stopPlay();
    } else {
      startPlay();
    }
  });

  fetch("ISM_historic.csv")
    .then((res) => res.text())
    .then((text) => {
      parseCsv(text);
      if (years.length === 0) return;
      slider.min = years[0];
      slider.max = years[years.length - 1];
      slider.value = years[0];
      createAxes();
      drawYear(years[0]);
    })
    .catch(() => {});
}

window.addEventListener("load", initIsmRadial);
