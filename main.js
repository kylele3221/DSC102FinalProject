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
  const delay = Math.random() * 2;

  drop.style.left = `${left}vw`;
  drop.style.height = `${height}px`;
  drop.style.width = `${thickness}px`;
  drop.style.animationDuration = `${duration}s`;
  drop.style.animationDelay = `${delay}s`;

  rainContainer.appendChild(drop);
}

/***********************
 * 2. GLOBE + MONSOON  *
 ************************/
document.addEventListener("DOMContentLoaded", () => {
  const globeEl = document.getElementById("monsoon-globe");
  if (!globeEl) return;

  const INITIAL_ALT = 1.8;

  const worldGlobe = Globe()
    .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor("#9ee7ff")
    .atmosphereAltitude(0.18)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.2)
    .hexPolygonColor(() => "rgba(0, 10, 40, 0.3)")
    .arcsData([])
    .arcColor(() => ["#ffd166", "#ff6b6b"])
    .arcStroke(0.6)
    .arcAltitudeAutoScale(0.6)
    .arcDashLength(0.7)
    .arcDashGap(0.15)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime(5000)
    .pointAltitude(0.05)
    .pointRadius(0.5)
    .pointColor((d) => d.color || "#ffd166")
    .width(globeEl.clientWidth)
    .height(globeEl.clientHeight);

  worldGlobe(globeEl);

  const monsoonZones = [
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

  const zonePoints = [];

  monsoonZones.forEach((zone) => {
    const stepsLat = 10;
    const stepsLon = 10;
    for (let i = 0; i <= stepsLat; i++) {
      const lat =
        zone.latMin + ((zone.latMax - zone.latMin) * i) / stepsLat;
      for (let j = 0; j <= stepsLon; j++) {
        const lon =
          zone.lonMin + ((zone.lonMax - zone.lonMin) * j) / stepsLon;

        const isEdge =
          i === 0 || i === stepsLat || j === 0 || j === stepsLon;

        if (isEdge) {
          zonePoints.push({
            id: zone.id,
            name: zone.name,
            lat,
            lng: lon,
            color: zone.color,
          });
        }
      }
    }
  });

  worldGlobe.pointsData(zonePoints);

  const arcPairs = [
    ["ISM", "WAM"],
    ["ISM", "SAMS"],
    ["WAM", "SAMS"],
  ];

  const arcData = arcPairs.map(([fromId, toId]) => {
    const fromPoints = zonePoints.filter((p) => p.id === fromId);
    const toPoints = zonePoints.filter((p) => p.id === toId);
    const from =
      fromPoints[Math.floor(Math.random() * fromPoints.length)];
    const to = toPoints[Math.floor(Math.random() * toPoints.length)];
    return {
      startLat: from.lat,
      startLng: from.lng,
      endLat: to.lat,
      endLng: to.lng,
    };
  });

  worldGlobe.arcsData(arcData);

  worldGlobe.pointOfView({ lat: 5, lng: 0, altitude: INITIAL_ALT }, 0);

  const controls = worldGlobe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.enableZoom = false;
  controls.enablePan = false;

  function resizeGlobe() {
    const { clientWidth, clientHeight } = globeEl;
    if (clientWidth && clientHeight) {
      worldGlobe.width(clientWidth);
      worldGlobe.height(clientHeight);
    }
  }
  window.addEventListener("resize", resizeGlobe);
  resizeGlobe();

  const stepEls = document.querySelectorAll(".monsoon-step");

  function focusMonsoon(id, smooth = true) {
    const zone = monsoonZones.find((z) => z.id === id);
    if (!zone) return;

    stepEls.forEach((el) => {
      el.classList.toggle(
        "active",
        el.getAttribute("data-monsoon") === id
      );
    });

    const targetLat = (zone.latMin + zone.latMax) / 2;
    const targetLon = (zone.lonMin + zone.lonMax) / 2;

    worldGlobe.pointOfView(
      { lat: targetLat, lng: targetLon, altitude: INITIAL_ALT },
      smooth ? 1000 : 0
    );
  }

  let rotateTimeout = null;
  function stopAutoRotateOnce() {
    controls.autoRotate = false;
    if (rotateTimeout) {
      clearTimeout(rotateTimeout);
    }
    rotateTimeout = setTimeout(() => {
      controls.autoRotate = true;
    }, 4000);
  }

  stepEls.forEach((step) => {
    step.addEventListener("click", () => {
      const id = step.getAttribute("data-monsoon");
      stopAutoRotateOnce();
      focusMonsoon(id, true);
    });
  });

  worldGlobe.onPointClick((d) => {
    if (!d || !d.id) return;
    stopAutoRotateOnce();
    focusMonsoon(d.id, true);
  });

  focusMonsoon("ISM", false);
});

// ===============================
// Radial charts for monsoon data
// ===============================

function createRadialChartMulti(config) {
  const svg = document.getElementById(config.svgId);
  const slider = document.getElementById(config.sliderId);
  const label = document.getElementById(config.labelId);
  const playBtn = document.getElementById(config.playId);
  if (!svg || !slider || !label || !playBtn) return;

  const NS = "http://www.w3.org/2000/svg";
  const width = 400;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = 140;
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);

  const seriesList = config.series;
  const seriesData = seriesList.map(() => ({ dataByYear: {} }));
  let allYears = new Set();
  let maxPr = 0;

  function parseCsv(text, idx) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(",");
    const yearIdx = header.indexOf("year");
    const monthIdx = header.indexOf("month");
    const prIdx = header.indexOf("pr");
    const store = seriesData[idx].dataByYear;

    lines.forEach((line) => {
      if (!line) return;
      const cols = line.split(",");
      const y = parseInt(cols[yearIdx], 10);
      const m = parseInt(cols[monthIdx], 10);
      const pr = parseFloat(cols[prIdx]);
      if (!store[y]) store[y] = {};
      store[y][m] = pr;
      if (!isNaN(y)) allYears.add(y);
      if (!isNaN(pr) && pr > maxPr) maxPr = pr;
    });
  }

  function createAxes() {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "radial-axes");

    const rings = 4;
    for (let r = 1; r <= rings; r++) {
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", (maxR * r) / rings);
      circle.setAttribute("class", "radial-ring");
      g.appendChild(circle);
    }

    const labels = ["J","F","M","A","M","J","J","A","S","O","N","D"];
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
      g.appendChild(line);

      const lx = cx + (maxR + 16) * Math.cos(angle);
      const ly = cy + (maxR + 16) * Math.sin(angle) + 4;
      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", lx);
      text.setAttribute("y", ly);
      text.setAttribute("class", "radial-month-label");
      text.textContent = labels[i];
      g.appendChild(text);
    }

    svg.appendChild(g);
  }

  const dataGroup = document.createElementNS(NS, "g");
  dataGroup.setAttribute("class", "radial-data");
  svg.appendChild(dataGroup);

  const seriesGraphics = seriesList.map((s) => {
    const path = document.createElementNS(NS, "path");
    path.setAttribute("class", "radial-path " + s.pathClass);
    const dots = document.createElementNS(NS, "g");
    dots.setAttribute("class", "radial-dots");
    dataGroup.appendChild(path);
    dataGroup.appendChild(dots);
    return { path, dots };
  });

  let years = [];
  let playTimer = null;

  function drawYear(year) {
    label.textContent = year;

    seriesList.forEach((s, idx) => {
      const store = seriesData[idx].dataByYear;
      const months = store[year] || {};
      const g = seriesGraphics[idx];
      const pts = [];
      g.dots.innerHTML = "";

      for (let i = 0; i < 12; i++) {
        const m = i + 1;
        const pr = months[m] || 0;
        const r = maxPr ? (pr / maxPr) * maxR : 0;
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        pts.push([x, y]);

        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 3);
        dot.setAttribute("class", "radial-dot " + s.dotClass);
        g.dots.appendChild(dot);
      }

      if (!pts.length) return;
      let d = "";
      pts.forEach((p, i) => {
        d += (i === 0 ? "M " : "L ") + p[0] + " " + p[1] + " ";
      });
      d += "Z";
      g.path.setAttribute("d", d.trim());
    });
  }

  function startPlay() {
    if (playTimer || !years.length) return;
    playBtn.textContent = "Pause";
    playTimer = setInterval(() => {
      const cur = parseInt(slider.value, 10);
      const idx = years.indexOf(cur);
      const next = years[(idx + 1) % years.length];
      slider.value = next;
      drawYear(next);
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
    drawYear(parseInt(slider.value, 10));
  });

  playBtn.addEventListener("click", () => {
    if (playTimer) stopPlay();
    else startPlay();
  });

  Promise.all(
    seriesList.map((s, idx) =>
      fetch(s.csvFile)
        .then((r) => r.text())
        .then((t) => parseCsv(t, idx))
    )
  )
    .then(() => {
      const yearsSet = new Set();
      seriesData.forEach((sd) => {
        Object.keys(sd.dataByYear).forEach((y) =>
          yearsSet.add(parseInt(y, 10))
        );
      });
      years = Array.from(yearsSet).sort((a, b) => a - b);
      if (!years.length) return;

      slider.min = years[0];
      slider.max = years[years.length - 1];
      slider.value = years[0];

      createAxes();
      drawYear(years[0]);
    })
    .catch((e) => console.error("Error loading radial CSVs:", e));
}

window.addEventListener("load", () => {
  createRadialChartMulti({
    svgId: "ism-radial-svg",
    sliderId: "ism-year-slider",
    labelId: "ism-year-label",
    playId: "ism-play",
    series: [
      {
        csvFile: "ISM_historic.csv",
        pathClass: "radial-path-ism",
        dotClass: "radial-dot-ism",
      },
      {
        csvFile: "WAM_historic.csv",
        pathClass: "radial-path-wam",
        dotClass: "radial-dot-wam",
      },
      {
        csvFile: "SAM_historic.csv",
        pathClass: "radial-path-sam",
        dotClass: "radial-dot-sam",
      },
    ],
  });

  createRadialChartMulti({
    svgId: "ism-future-radial-svg",
    sliderId: "ism-future-year-slider",
    labelId: "ism-future-year-label",
    playId: "ism-future-play",
    series: [
      {
        csvFile: "ISM_future.csv",
        pathClass: "radial-path-ism",
        dotClass: "radial-dot-ism",
      },
    ],
  });
});
