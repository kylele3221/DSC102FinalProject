// main.js

/***********************
 * 1. RAIN ANIMATION   *
 ***********************/
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

  worldGlobe
    .globeImageUrl(
      "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
    )
    .bumpImageUrl(null)
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(false)
    .showGraticules(false);

  const mat = worldGlobe.globeMaterial();
  mat.color = new THREE.Color("#6aa0ff");
  mat.emissive = new THREE.Color("#1a2e6f");
  mat.emissiveIntensity = 0.55;
  mat.specular = new THREE.Color("#000000");

  worldGlobe
    .pointsData(monsoonPoints)
    .pointLat("lat")
    .pointLng("lng")
    .pointAltitude(0.16)
    .pointRadius(1)
    .pointColor((d) => d.color)
    .pointResolution(32)
    .pointLabel((d) => d.name);

  worldGlobe
    .ringsData(monsoonPoints)
    .ringLat("lat")
    .ringLng("lng")
    .ringAltitude(0.01)
    .ringMaxRadius(1.6)
    .ringPropagationSpeed(1.5)
    .ringRepeatPeriod(1300)
    .ringColor((d) => (t) => {
      const colors = {
        ISM: "255, 179, 71",
        WAM: "255, 107, 107",
        SAMS: "158, 231, 255",
      };
      const rgb = colors[d.id] || "255,255,255";
      const alpha = 0.7 * (1 - t);
      return `rgba(${rgb}, ${alpha})`;
    });

  const INITIAL_ALT = 1.35;
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
      d.id === activeMonsoonId ? 0.22 : 0.16
    );

    setActiveCard(id);
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

/* =========================================
 * 4. RADIAL CHART – HISTORIC ONLY
 * =======================================*/

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

  // Tooltip (one per page)
  let tooltip = document.querySelector(".radial-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "radial-tooltip";
    const s = tooltip.style;
    s.position = "fixed";
    s.pointerEvents = "none";
    s.visibility = "hidden";
    s.padding = "6px 10px";
    s.background = "rgba(7, 14, 40, 0.95)";
    s.border = "1px solid rgba(158, 231, 255, 0.7)";
    s.borderRadius = "6px";
    s.color = "#f5f7ff";
    s.fontSize = "0.8rem";
    s.zIndex = "999";
    document.body.appendChild(tooltip);
  }

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const seriesList = config.series;
  const seriesData = seriesList.map(() => ({ dataByYear: {} }));
  let maxPr = 0;

  // CSV: year,month,pr
  function parseCsv(text, idx) {
    const lines = text.trim().split(/\r?\n/);
    lines.shift(); // header
    const store = seriesData[idx].dataByYear;

    lines.forEach((line) => {
      if (!line) return;
      const cols = line.split(",");
      if (cols.length < 3) return;
      const y = parseInt(cols[0], 10);
      const m = parseInt(cols[1], 10);
      const pr = parseFloat(cols[2]);
      if (isNaN(y) || isNaN(m) || isNaN(pr)) return;
      if (!store[y]) store[y] = {};
      store[y][m] = pr;
      if (pr > maxPr) maxPr = pr;
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
    path.style.fillOpacity = 0; // start with no fill visible
    const dots = document.createElementNS(NS, "g");
    dots.setAttribute("class", "radial-dots");
    dataGroup.appendChild(path);
    dataGroup.appendChild(dots);
    return { path, dots };
  });

  let years = [];
  let playTimer = null;
  let isAnimating = false;

  function showTooltip(evt, year, monthIndex, prVal) {
    if (isNaN(prVal)) return;
    const mmPerDay = prVal * 1000; // m/day → mm/day

    tooltip.style.visibility = "visible";
    tooltip.textContent =
      monthNames[monthIndex - 1] +
      " " +
      year +
      ": " +
      mmPerDay.toFixed(3) +
      " mm/day";
    tooltip.style.left = evt.clientX + 14 + "px";
    tooltip.style.top = evt.clientY + 14 + "px";
  }

  function hideTooltip() {
    tooltip.style.visibility = "hidden";
  }

  // options:
  //  { animate?: true, noFill?: true, hideStroke?: true }
  function drawYear(year, options) {
    const animate = options && options.animate;
    const noFill = options && options.noFill;
    const hideStroke = options && options.hideStroke;

    label.textContent = year;

    const dotBaseDelay = 150;   // ms before first dot appears
    const dotStepDelay = 70;    // ms between dots

    seriesList.forEach((s, idx) => {
      const store = seriesData[idx].dataByYear;
      const months = store[year] || {};
      const g = seriesGraphics[idx];
      const pts = [];
      g.dots.innerHTML = "";

      for (let i = 0; i < 12; i++) {
        const m = i + 1;
        const raw = months[m];
        const pr = typeof raw === "number" && !isNaN(raw) ? raw : 0;
        const r = maxPr ? (pr / maxR) * maxR : 0; // keep relative
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        pts.push([x, y]);

        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 3);
        dot.setAttribute("class", "radial-dot " + s.dotClass);

        dot.addEventListener("mouseenter", (evt) =>
          showTooltip(evt, year, m, pr)
        );
        dot.addEventListener("mousemove", (evt) =>
          showTooltip(evt, year, m, pr)
        );
        dot.addEventListener("mouseleave", hideTooltip);

        if (animate) {
          dot.style.opacity = 0;
          dot.style.transformOrigin = "center";
          dot.style.transform = "scale(0.2)";
          dot.style.transition =
            "opacity 0.3s ease-out, transform 0.3s ease-out";
          const delay = dotBaseDelay + i * dotStepDelay;
          setTimeout(() => {
            dot.style.opacity = 1;
            dot.style.transform = "scale(1)";
          }, delay);
        } else {
          dot.style.opacity = 1;
          dot.style.transform = "scale(1)";
          dot.style.transition = "none";
        }

        g.dots.appendChild(dot);
      }

      if (!pts.length) return;
      let d = "";
      pts.forEach((p, i) => {
        d += (i === 0 ? "M " : "L ") + p[0] + " " + p[1] + " ";
      });
      d += "Z";
      g.path.setAttribute("d", d.trim());

      if (animate) {
        try {
          const len = g.path.getTotalLength();
          g.path.style.transition = "none";
          g.path.style.strokeDasharray = `${len} ${len}`;
          g.path.style.strokeDashoffset = `${len}`;
          g.path.style.fillOpacity = 0; // no fill yet

          const lineDuration = 1400; // ms
          const totalAnim = lineDuration + dotBaseDelay + 11 * dotStepDelay;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              g.path.style.transition =
                "stroke-dashoffset 1.4s ease-out, fill-opacity 0.8s ease-in";
              g.path.style.strokeDashoffset = "0";

              // fade in fill after the line draws
              setTimeout(() => {
                g.path.style.fillOpacity = 0.25; // tweak strength if you want
              }, lineDuration);
            });
          });

          // mark anim over after everything is done
          setTimeout(() => {
            isAnimating = false;
          }, totalAnim + 200);
        } catch (e) {
          g.path.style.transition = "none";
          g.path.style.strokeDasharray = "";
          g.path.style.strokeDashoffset = "";
          g.path.style.fillOpacity = 0.25;
          isAnimating = false;
        }
      } else {
        g.path.style.transition = "none";

        if (hideStroke) {
          try {
            const len = g.path.getTotalLength();
            g.path.style.strokeDasharray = `${len} ${len}`;
            g.path.style.strokeDashoffset = `${len}`;
          } catch {
            g.path.style.strokeDasharray = "";
            g.path.style.strokeDashoffset = "";
          }
        } else {
          g.path.style.strokeDasharray = "";
          g.path.style.strokeDashoffset = "";
        }

        g.path.style.fillOpacity = noFill ? 0 : 0.25;
      }
    });
  }

  function resetLineAndFill() {
    // hide line & fill, keep dots as-is
    seriesGraphics.forEach((g) => {
      try {
        const len = g.path.getTotalLength();
        g.path.style.transition = "none";
        g.path.style.strokeDasharray = `${len} ${len}`;
        g.path.style.strokeDashoffset = `${len}`;
        g.path.style.fillOpacity = 0;
      } catch {
        g.path.style.strokeDasharray = "";
        g.path.style.strokeDashoffset = "";
        g.path.style.fillOpacity = 0;
      }
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
      drawYear(next); // normal, no animation
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
    drawYear(parseInt(slider.value, 10)); // normal, no animation
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
      // initial: draw dots & geometry, but hide stroke & fill
      drawYear(years[0], { noFill: true, hideStroke: true });

      // Replay animation every time section re-enters view
      if ("IntersectionObserver" in window) {
        const target = document.getElementById(config.svgId);
        if (target) {
          const obs = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const currentYear =
                  parseInt(slider.value, 10) || years[0];

                if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
                  if (isAnimating) return;
                  isAnimating = true;
                  // redraw with animation (dots stagger + line draw + fill fade)
                  drawYear(currentYear, { animate: true });
                } else if (!entry.isIntersecting) {
                  // left viewport: reset line & fill so coming back replays
                  resetLineAndFill();
                  isAnimating = false;
                }
              });
            },
            { threshold: [0, 0.4, 0.6] }
          );
          obs.observe(target);
        }
      }
    })
    .catch((e) => console.error("Error loading radial CSVs:", e));
}



/* =========================================
 * 5. IMPACT SCROLLY
 * =======================================*/

function initImpactScrolly() {
  const cards = document.querySelectorAll(".impact-viewport .impact-card");
  const steps = document.querySelectorAll(".impact-scroll-steps .impact-step");
  const dots = document.querySelectorAll(".impact-dot");
  if (!cards.length || !steps.length) return;

  const activate = (slideId) => {
    cards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.slide === slideId);
    });
    dots.forEach((dot) => {
      dot.classList.toggle("is-active", dot.dataset.slide === slideId);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slideId = entry.target.dataset.slide;
          if (slideId != null) activate(slideId);
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  steps.forEach((step) => observer.observe(step));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const slideId = dot.dataset.slide;
      const targetStep = document.querySelector(
        `.impact-step[data-slide="${slideId}"]`
      );
      if (targetStep) {
        targetStep.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
  });
}

/* =========================================
 * 6. INIT – RADIAL + SCROLLY
 * =======================================*/

window.addEventListener("load", () => {
  // Historic monsoon radial only
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

  initImpactScrolly();
});

/* =========================================
 * 7. FATALITY PEOPLE-GRID
 * =======================================*/

window.addEventListener("load", () => {
  const data = {
    india: { flood: 35.1, storm: 40.2, drought: 12.5, other: 12.2 },
    brazil: { flood: 47.8, storm: 30.1, drought: 10.4, other: 11.7 },
    niger: { flood: 56.3, storm: 18.2, drought: 20.9, other: 4.6 },
  };

  const raw_data = {
    india: { flood: 60733, storm: 320, drought: 26313 },
    brazil: { flood: 5575, storm: 772, drought: 20 },
    niger: { flood: 1333, storm: 4, drought: 0 },
  };

  const countryCards = document.querySelectorAll(".country-card");
  const peopleGrid = document.getElementById("people-grid");
  const rawNumbers = document.getElementById("raw-numbers");

  function generatePeople(countryKey) {
    peopleGrid.innerHTML = "";
    const d = data[countryKey];
    const e = raw_data[countryKey];

    const flood = Math.round(d.flood);
    const storm = Math.round(d.storm);
    const drought = Math.round(d.drought);
    const other = 100 - (flood + storm + drought);

    const types = [
      ...Array(flood).fill("flood"),
      ...Array(storm).fill("storm"),
      ...Array(drought).fill("drought"),
      ...Array(other).fill("other"),
    ];

    types.forEach((type) => {
      const div = document.createElement("div");
      div.classList.add("person", type);
      div.innerHTML = `
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="6" r="4"></circle>
          <rect x="8" y="10" width="8" height="10" rx="3"></rect>
        </svg>`;
      peopleGrid.appendChild(div);
    });

    rawNumbers.innerHTML = `
      <strong>Raw Death Counts:</strong><br>
      Flood: ${e.flood}<br>
      Storm: ${e.storm}<br>
      Drought: ${e.drought}<br>
    `;
  }

  countryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const selected = card.dataset.country;

      countryCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      generatePeople(selected);
    });
  });

  // Default state (empty people, dashes)
  peopleGrid.innerHTML = Array(100)
    .fill(0)
    .map(
      () => `
    <div class="person other">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="6" r="4"></circle>
        <rect x="8" y="10" width="8" height="10" rx="3"></rect>
      </svg>
    </div>`
    )
    .join("");

  rawNumbers.innerHTML = `<strong>Raw Death Counts:</strong><br> - <br> - <br> - <br> -`;
});

/* =========================================
 * 8. REFERENCES COLLAPSIBLE
 * =======================================*/

document.addEventListener("DOMContentLoaded", function () {
  const coll = document.querySelector(".collapsible");
  const content = document.querySelector(".content-collapsible");

  if (!coll || !content) return;

  coll.addEventListener("click", function () {
    this.classList.toggle("active");

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      coll.innerHTML = "References ▼";
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      coll.innerHTML = "References ▲";
    }
  });
});
