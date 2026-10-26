// Fallback listings, used until /api/services responds (or if it can't be reached).
let services = [
  {name:"Neighborhood Food Shelf",category:"Food",icon:"🥕",description:"Groceries and pantry staples for individuals and families.",address:"214 Maple Street, Springfield",hours:"Mon–Fri, 9 am–4 pm",phone:"(555) 010-0142",verified:"Example listing",search:"food pantry groceries neighborhood maple"},
  {name:"Open Table Community Kitchen",category:"Food",icon:"🍲",description:"A warm meal and a welcoming place at the table.",address:"8 Oak Avenue, Springfield",hours:"Weekdays, 12–2 pm",phone:"(555) 010-0198",verified:"Example listing",search:"meal kitchen lunch food oak"},
  {name:"Fresh Start Produce Market",category:"Food",icon:"🍎",description:"Affordable fresh produce and nutrition resources.",address:"Market Square, Springfield",hours:"Sat, 8 am–1 pm",phone:"(555) 010-0130",verified:"Example listing",search:"produce market fruit vegetables saturday"},
  {name:"Maple Street Health Clinic",category:"Health",icon:"✚",description:"Low-cost primary care and help finding a provider.",address:"42 Maple Street, Springfield",hours:"Mon–Thu, 8 am–5 pm",phone:"(555) 010-0111",verified:"Example listing",search:"health clinic doctor medical care maple"},
  {name:"Community Care Counseling",category:"Health",icon:"♡",description:"Confidential counseling and mental health support.",address:"120 River Road, Springfield",hours:"By appointment",phone:"(555) 010-0155",verified:"Example listing",search:"mental health therapy counseling care"},
  {name:"Springfield Community Gym",category:"Fitness",icon:"💪",description:"Affordable gym access and beginner-friendly group workouts.",address:"25 Park Avenue, Springfield",hours:"Mon–Sat, 6 am–9 pm",phone:"(555) 010-0184",verified:"Example listing",search:"gym fitness workout exercise strength classes park"},
  {name:"Open Door Fitness Center",category:"Fitness",icon:"🏋️",description:"Low-cost exercise classes and a welcoming place to get active.",address:"90 Elm Street, Springfield",hours:"Mon–Fri, 7 am–8 pm",phone:"(555) 010-0193",verified:"Example listing",search:"gym fitness exercise workout yoga classes elm"},
  {name:"Haven Family Resource Center",category:"Housing",icon:"⌂",description:"Housing guidance and referrals for local families.",address:"6 Cedar Lane, Springfield",hours:"Mon–Fri, 9 am–4 pm",phone:"(555) 010-0177",verified:"Example listing",search:"housing shelter family haven cedar"},
  {name:"Safe Steps Night Shelter",category:"Housing",icon:"☾",description:"Emergency shelter referrals and overnight support.",address:"Downtown Springfield",hours:"Call for availability",phone:"(555) 010-0124",verified:"Example listing",search:"shelter emergency housing downtown safe"},
  {name:"Springfield Welcome Hub",category:"Community",icon:"☼",description:"Help with forms, job searches, and community connections.",address:"18 Main Street, Springfield",hours:"Tue–Sat, 10 am–6 pm",phone:"(555) 010-0166",verified:"Example listing",search:"community jobs forms welcome main"}
];

const grid = document.querySelector("#service-grid");
const searchInput = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const resultCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const chips = [...document.querySelectorAll(".chip")];
let activeCategory = "all";

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);

function cardTemplate(rawService) {
  const query = encodeURIComponent(rawService.address);
  const service = Object.fromEntries(Object.entries(rawService).map(([key, value]) => [key, escapeHtml(value)]));
  return `<article class="service-card" data-category="${service.category}">
    <div class="card-glare" aria-hidden="true"></div>
    <div class="card-inner">
      <div class="card-top">
        <span class="category-label">${service.category}</span>
        <span class="card-icon" aria-hidden="true">${service.icon}</span>
      </div>
      <h3>${service.name}</h3>
      <p class="description">${service.description}</p>
      <p class="card-detail"><span aria-hidden="true">◎</span><span>${service.address}</span></p>
      <p class="card-detail"><span aria-hidden="true">◷</span><span>${service.hours}</span></p>
      <p class="card-detail"><span aria-hidden="true">☎</span><a class="phone-link" href="tel:${rawService.phone.replace(/[^+\d]/g, "")}">${service.phone}</a></p>
      <div class="card-footer">
        <span class="verified">${service.verified}</span>
        <a class="card-link" href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" rel="noreferrer">Directions ↗</a>
      </div>
    </div>
  </article>`;
}

/* ========================================================
   3D Interactive Card Physics & Specular Glare
   ======================================================== */
function init3DCards() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cards = document.querySelectorAll(".service-card");

  cards.forEach(card => {
    let rect = null;

    function handleMouseEnter() {
      rect = card.getBoundingClientRect();
    }

    function handleMouseMove(e) {
      if (!rect) rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Normalize -1 to 1
      const xPct = (mouseX / rect.width - 0.5) * 2;
      const yPct = (mouseY / rect.height - 0.5) * 2;

      const rotX = -yPct * 11;
      const rotY = xPct * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px)`;

      const glare = card.querySelector(".card-glare");
      if (glare) {
        glare.style.background = `radial-gradient(circle 200px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.4), transparent 75%)`;
      }
    }

    function handleMouseLeave() {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
      const glare = card.querySelector(".card-glare");
      if (glare) {
        glare.style.background = "none";
      }
      rect = null;
    }

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
  });
}

function renderServices() {
  const query = searchInput.value.trim().toLowerCase();
  const category = activeCategory;
  const filtered = services.filter(service => {
    const matchesCategory = category === "all" || service.category === category;
    const haystack = `${service.name} ${service.category} ${service.description} ${service.address} ${service.hours} ${service.search}`.toLowerCase();
    return matchesCategory && haystack.includes(query);
  });
  grid.innerHTML = filtered.map(cardTemplate).join("");
  grid.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length > 0;
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "service" : "services"}`;

  // Re-attach 3D interactive physics to newly rendered cards
  init3DCards();
}

function setCategory(category) {
  activeCategory = category;
  categorySelect.value = category;
  chips.forEach(chip => {
    const selected = chip.dataset.category === category;
    chip.classList.toggle("active", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });
  renderServices();
}

searchInput.addEventListener("input", renderServices);
categorySelect.addEventListener("change", () => setCategory(categorySelect.value));
chips.forEach(chip => chip.addEventListener("click", () => setCategory(chip.dataset.category)));
document.querySelector("#reset-search").addEventListener("click", () => {
  searchInput.value = "";
  setCategory("all");
  searchInput.focus();
});

document.querySelector("#correction-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector("#form-status");
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Sending…";
  try {
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Could not send your suggestion. Please try again.");
    form.reset();
    status.textContent = "Suggestion received. Thanks for helping your community!";
  } catch (error) {
    status.textContent = error.message || "Could not send your suggestion. Please try again.";
  } finally {
    button.disabled = false;
  }
});

async function loadServices() {
  try {
    const response = await fetch("/api/services");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.services) && data.services.length) {
      services = data.services;
      renderServices();
    }
  } catch {
    // Keep showing the fallback listings.
  }
}

/* ========================================================
   3D Community Biosphere Diorama (Three.js WebGL)
   ======================================================== */
function initHero3D() {
  const canvas = document.getElementById("hero-3d-canvas");
  const wrapper = document.getElementById("hero-3d-wrapper");
  const fallback = document.getElementById("hero-art-fallback");
  const hint = document.getElementById("diorama-hint");

  if (!canvas || typeof window.THREE === "undefined") {
    if (fallback) fallback.hidden = false;
    return;
  }

  const THREE = window.THREE;
  let width = wrapper.clientWidth || 500;
  let height = wrapper.clientHeight || 440;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 8.5, 13.5);
  camera.lookAt(0, 0.6, 0);

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (e) {
    if (fallback) fallback.hidden = false;
    return;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.95);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xd9e9a2, 0x4a3b32, 0.55);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.35);
  sunLight.position.set(11, 17, 9);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 40;
  sunLight.shadow.camera.left = -8;
  sunLight.shadow.camera.right = 8;
  sunLight.shadow.camera.top = 8;
  sunLight.shadow.camera.bottom = -8;
  sunLight.shadow.bias = -0.001;
  scene.add(sunLight);

  // Point lights for lanterns & streetlamps
  const lampGroup = new THREE.Group();
  scene.add(lampGroup);

  // Island Base Group (rotates together)
  const islandGroup = new THREE.Group();
  scene.add(islandGroup);

  // 1. Terrain: Upper Meadow & Bedrock Core
  const topGrassGeo = new THREE.CylinderGeometry(4.7, 4.4, 0.65, 26);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x477d52,
    roughness: 0.75,
    metalness: 0.05,
    flatShading: true
  });
  const topGrass = new THREE.Mesh(topGrassGeo, grassMat);
  topGrass.position.y = 0;
  topGrass.receiveShadow = true;
  islandGroup.add(topGrass);

  // Lower bedrock core
  const rockGeo = new THREE.ConeGeometry(4.4, 3.4, 18);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x5a5147,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true
  });
  const rockMesh = new THREE.Mesh(rockGeo, rockMat);
  rockMesh.position.y = -1.95;
  rockMesh.rotation.x = Math.PI;
  islandGroup.add(rockMesh);

  // Gentle elevation hill
  const hillGeo = new THREE.SphereGeometry(2.0, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const hillMat = new THREE.MeshStandardMaterial({
    color: 0x3d6e48,
    roughness: 0.8,
    flatShading: true
  });
  const hillMesh = new THREE.Mesh(hillGeo, hillMat);
  hillMesh.position.set(-1.4, 0.3, -0.6);
  hillMesh.scale.set(1.4, 0.65, 1.2);
  hillMesh.receiveShadow = true;
  islandGroup.add(hillMesh);

  // Sparkling Water Pond
  const pondGeo = new THREE.CylinderGeometry(1.35, 1.15, 0.16, 18);
  const pondMat = new THREE.MeshStandardMaterial({
    color: 0x3ea7cc,
    roughness: 0.1,
    metalness: 0.35,
    transparent: true,
    opacity: 0.88
  });
  const pond = new THREE.Mesh(pondGeo, pondMat);
  pond.position.set(1.7, 0.33, 1.2);
  pond.scale.set(1.2, 1, 0.9);
  islandGroup.add(pond);

  // Winding stone pathway
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0xd6cebe,
    roughness: 0.85,
    flatShading: true
  });
  const pathPoints = [
    [0, 0.34, 0], [0.65, 0.34, 0.4], [1.2, 0.34, 0.2],
    [-0.8, 0.34, 0.3], [-1.5, 0.34, 0.8], [0.2, 0.34, -1.2],
    [-0.9, 0.34, -1.1]
  ];
  pathPoints.forEach(([px, py, pz]) => {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.06, 7), pathMat);
    stone.position.set(px, py, pz);
    stone.rotation.y = Math.random() * Math.PI;
    stone.receiveShadow = true;
    islandGroup.add(stone);
  });

  // Windows material (illuminates in evening & night)
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffe6a3,
    emissive: 0xffb535,
    emissiveIntensity: 0.2,
    roughness: 0.3
  });

  // 2. Low-Poly Buildings
  // Building A: Springfield Community Town Hall / Welcome Hub
  const townHall = new THREE.Group();
  const hallBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.3, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xeeece2, roughness: 0.7, flatShading: true })
  );
  hallBase.position.y = 0.65;
  hallBase.castShadow = true;
  hallBase.receiveShadow = true;
  townHall.add(hallBase);

  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 2.0, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xded8c8, roughness: 0.7, flatShading: true })
  );
  tower.position.set(0, 1.3, 0.32);
  tower.castShadow = true;
  townHall.add(tower);

  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 1.0, 4),
    new THREE.MeshStandardMaterial({ color: 0x315b3e, roughness: 0.5, flatShading: true })
  );
  spire.position.set(0, 2.8, 0.32);
  spire.rotation.y = Math.PI / 4;
  spire.castShadow = true;
  townHall.add(spire);

  // Tiny clock face
  const townClockFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  );
  townClockFace.position.set(0, 1.8, 0.68);
  townClockFace.rotation.x = Math.PI / 2;
  townHall.add(townClockFace);

  // Windows
  const hWin1 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.42, 0.05), windowMaterial);
  hWin1.position.set(-0.5, 0.72, 0.71);
  townHall.add(hWin1);
  const hWin2 = hWin1.clone();
  hWin2.position.set(0.5, 0.72, 0.71);
  townHall.add(hWin2);

  townHall.position.set(-0.2, 0.32, -1.4);
  townHall.rotation.y = 0.1;
  islandGroup.add(townHall);

  // Building B: Health & Care Clinic
  const clinic = new THREE.Group();
  const clinicBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 1.05, 1.15),
    new THREE.MeshStandardMaterial({ color: 0xf5f9f6, roughness: 0.6, flatShading: true })
  );
  clinicBody.position.y = 0.53;
  clinicBody.castShadow = true;
  clinicBody.receiveShadow = true;
  clinic.add(clinicBody);

  const clinicRoof = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.18, 1.25),
    new THREE.MeshStandardMaterial({ color: 0x8aa892, roughness: 0.6, flatShading: true })
  );
  clinicRoof.position.y = 1.12;
  clinic.add(clinicRoof);

  // Medical Cross
  const crossMat = new THREE.MeshStandardMaterial({ color: 0x315b3e, roughness: 0.4 });
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.04), crossMat);
  crossV.position.set(0, 0.68, 0.6);
  clinic.add(crossV);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.04), crossMat);
  crossH.position.set(0, 0.68, 0.6);
  clinic.add(crossH);

  const cWin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), windowMaterial);
  cWin.position.set(0, 0.28, 0.59);
  clinic.add(cWin);

  clinic.position.set(-2.3, 0.32, 0.4);
  clinic.rotation.y = 0.55;
  islandGroup.add(clinic);

  // Building C: Food Pantry & Fresh Market
  const pantry = new THREE.Group();
  const pantryBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.9, 1.05),
    new THREE.MeshStandardMaterial({ color: 0xfbf6ea, roughness: 0.7, flatShading: true })
  );
  pantryBody.position.y = 0.45;
  pantryBody.castShadow = true;
  pantryBody.receiveShadow = true;
  pantry.add(pantryBody);

  const pantryRoof = new THREE.Mesh(
    new THREE.ConeGeometry(1.05, 0.65, 4),
    new THREE.MeshStandardMaterial({ color: 0xd46845, roughness: 0.6, flatShading: true })
  );
  pantryRoof.position.y = 1.2;
  pantryRoof.rotation.y = Math.PI / 4;
  pantry.add(pantryRoof);

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.08, 0.45),
    new THREE.MeshStandardMaterial({ color: 0xed895f, roughness: 0.5 })
  );
  awning.position.set(0, 0.68, 0.68);
  awning.rotation.x = 0.28;
  pantry.add(awning);

  // Produce crate
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.2, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x9c7a52, roughness: 0.85 })
  );
  crate.position.set(0.3, 0.1, 0.78);
  pantry.add(crate);

  const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshStandardMaterial({ color: 0xde5135 }));
  fruit.position.set(0.3, 0.24, 0.78);
  pantry.add(fruit);

  pantry.position.set(1.3, 0.32, -0.6);
  pantry.rotation.y = -0.4;
  islandGroup.add(pantry);

  // Building D: Fitness & Wellness Pavilion
  const fitness = new THREE.Group();
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.1, 1.05),
    new THREE.MeshStandardMaterial({ color: 0xbfa382, roughness: 0.8 })
  );
  deck.position.y = 0.05;
  fitness.add(deck);

  const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x7c5d3d });
  [[-0.5, 0.45, -0.4], [0.5, 0.45, -0.4], [-0.5, 0.45, 0.4], [0.5, 0.45, 0.4]].forEach(([ox, oy, oz]) => {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(ox, oy, oz);
    fitness.add(post);
  });

  for (let s = -0.4; s <= 0.4; s += 0.2) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.08), postMat);
    slat.position.set(0, 0.88, s);
    fitness.add(slat);
  }

  fitness.position.set(-1.0, 0.32, 1.6);
  fitness.rotation.y = 0.3;
  islandGroup.add(fitness);

  // Building E: Cozy Housing Cottages
  const cottage = new THREE.Group();
  const cBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.75, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xf0e5d5, roughness: 0.7, flatShading: true })
  );
  cBody.position.y = 0.38;
  cBody.castShadow = true;
  cottage.add(cBody);

  const cRoof = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 0.55, 4),
    new THREE.MeshStandardMaterial({ color: 0x94503e, roughness: 0.6, flatShading: true })
  );
  cRoof.position.y = 0.98;
  cRoof.rotation.y = Math.PI / 4;
  cottage.add(cRoof);

  const cWin1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.04), windowMaterial);
  cWin1.position.set(0, 0.38, 0.41);
  cottage.add(cWin1);

  cottage.position.set(2.4, 0.32, 0.2);
  cottage.rotation.y = -0.6;
  islandGroup.add(cottage);

  // 3. Low-Poly Trees
  function createDeciduousTree(colorHex, scale = 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.8 * scale, 6),
      new THREE.MeshStandardMaterial({ color: 0x6e523b, roughness: 0.9 })
    );
    trunk.position.y = 0.4 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55 * scale, 1),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8, flatShading: true })
    );
    foliage.position.y = 0.95 * scale;
    foliage.castShadow = true;
    tree.add(foliage);
    return tree;
  }

  function createPineTree(scale = 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 0.6 * scale, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a432f, roughness: 0.9 })
    );
    trunk.position.y = 0.3 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    const levels = [
      { r: 0.55 * scale, h: 0.6 * scale, y: 0.65 * scale, c: 0x275532 },
      { r: 0.42 * scale, h: 0.5 * scale, y: 0.95 * scale, c: 0x336b3f },
      { r: 0.28 * scale, h: 0.4 * scale, y: 1.25 * scale, c: 0x418150 }
    ];
    levels.forEach(lvl => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(lvl.r, lvl.h, 7),
        new THREE.MeshStandardMaterial({ color: lvl.c, roughness: 0.75, flatShading: true })
      );
      cone.position.y = lvl.y;
      cone.castShadow = true;
      tree.add(cone);
    });
    return tree;
  }

  const treeConfigs = [
    { type: "deciduous", x: 2.9, z: 0.4, c: 0x57935f, s: 1.2 },
    { type: "deciduous", x: 2.2, z: 1.9, c: 0xd9823b, s: 1.0 },
    { type: "pine", x: -2.8, z: -1.4, s: 1.15 },
    { type: "pine", x: -3.3, z: -0.4, s: 0.85 },
    { type: "deciduous", x: -0.3, z: 2.7, c: 0x76a55b, s: 0.95 },
    { type: "pine", x: 2.0, z: -2.3, s: 1.25 },
    { type: "deciduous", x: -2.7, z: 1.6, c: 0x487d54, s: 1.05 }
  ];

  treeConfigs.forEach(tc => {
    const t = tc.type === "pine" ? createPineTree(tc.s) : createDeciduousTree(tc.c, tc.s);
    t.position.set(tc.x, 0.32, tc.z);
    islandGroup.add(t);
  });

  // 4. Street Lamps with Light Bulbs
  const lampLightMat = new THREE.MeshStandardMaterial({
    color: 0xfff0aa,
    emissive: 0xffda55,
    emissiveIntensity: 0.2
  });
  const lampBulbs = [];
  const lampPointLights = [];

  [[-0.4, 0.32, 0.8], [0.95, 0.32, 0.25]].forEach(([lx, ly, lz]) => {
    const lamp = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.88, 6),
      new THREE.MeshStandardMaterial({ color: 0x20281f, roughness: 0.5 })
    );
    pole.position.y = 0.44;
    lamp.add(pole);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), lampLightMat);
    head.position.y = 0.88;
    lamp.add(head);
    lampBulbs.push(head);

    const pLight = new THREE.PointLight(0xffbe42, 0, 4.0);
    pLight.position.set(lx, ly + 0.88, lz);
    lampGroup.add(pLight);
    lampPointLights.push(pLight);

    lamp.position.set(lx, ly, lz);
    islandGroup.add(lamp);
  });

  // 5. Floating Clouds
  const cloudGroup = new THREE.Group();
  scene.add(cloudGroup);

  function createCloud(scale = 1) {
    const cloud = new THREE.Group();
    const cMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });
    const parts = [
      { r: 0.48 * scale, x: 0, y: 0, z: 0 },
      { r: 0.38 * scale, x: 0.36 * scale, y: -0.05, z: 0 },
      { r: 0.40 * scale, x: -0.34 * scale, y: -0.04, z: 0 },
      { r: 0.30 * scale, x: 0.16 * scale, y: 0.26 * scale, z: 0 }
    ];
    parts.forEach(p => {
      const sp = new THREE.Mesh(new THREE.DodecahedronGeometry(p.r, 1), cMat);
      sp.position.set(p.x, p.y, p.z);
      cloud.add(sp);
    });
    return cloud;
  }

  const clouds = [
    { mesh: createCloud(1.2), radius: 7.2, speed: 0.003, angle: 0.2, y: 3.4 },
    { mesh: createCloud(0.9), radius: 6.4, speed: 0.004, angle: 2.3, y: 2.9 },
    { mesh: createCloud(1.1), radius: 7.6, speed: 0.0025, angle: 4.4, y: 3.6 }
  ];
  clouds.forEach(c => cloudGroup.add(c.mesh));

  // 6. Twinkling Star Field (Night mode)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 200;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    const r = 18 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i + 1] = Math.abs(r * Math.cos(phi)) + 1.5;
    starPositions[i + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.25,
    transparent: true,
    opacity: 0
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // 7. Floating Ambient Pollen / Fireflies
  const pollenGeo = new THREE.BufferGeometry();
  const pollenCount = 45;
  const pollenPositions = new Float32Array(pollenCount * 3);
  for (let i = 0; i < pollenCount * 3; i += 3) {
    pollenPositions[i] = (Math.random() - 0.5) * 6.5;
    pollenPositions[i + 1] = 0.5 + Math.random() * 3.5;
    pollenPositions[i + 2] = (Math.random() - 0.5) * 6.5;
  }
  pollenGeo.setAttribute("position", new THREE.BufferAttribute(pollenPositions, 3));
  const pollenMat = new THREE.PointsMaterial({
    color: 0xd9e9a2,
    size: 0.18,
    transparent: true,
    opacity: 0.7
  });
  const pollenParticles = new THREE.Points(pollenGeo, pollenMat);
  islandGroup.add(pollenParticles);

  // 8. Floating 3D Category Orbital Badges
  const categoryBadges = [
    { category: "Food", icon: "🥕", color: "#ed895f", ring: 0xed895f, angle: 0, radius: 5.6, y: 1.5 },
    { category: "Health", icon: "✚", color: "#315b3e", ring: 0x315b3e, angle: 1.25, radius: 5.8, y: 2.3 },
    { category: "Fitness", icon: "💪", color: "#4f7da8", ring: 0x4f7da8, angle: 2.5, radius: 5.5, y: 1.4 },
    { category: "Housing", icon: "⌂", color: "#9c5b7f", ring: 0x9c5b7f, angle: 3.75, radius: 5.9, y: 2.2 },
    { category: "Community", icon: "☼", color: "#d19a28", ring: 0xd19a28, angle: 5.0, radius: 5.7, y: 1.7 }
  ];

  function createBadgeTexture(icon, name, color) {
    const bCanvas = document.createElement("canvas");
    bCanvas.width = 256;
    bCanvas.height = 256;
    const ctx = bCanvas.getContext("2d");

    // Circular background
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 12;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Inner subtle ring
    ctx.beginPath();
    ctx.arc(128, 128, 108, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.stroke();

    // Icon
    ctx.font = "76px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, 128, 92);

    // Label
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = "#20281f";
    ctx.fillText(name.toUpperCase(), 128, 162);

    // Subtext
    ctx.font = "600 16px sans-serif";
    ctx.fillStyle = color;
    ctx.fillText("FILTER ↗", 128, 194);

    return new THREE.CanvasTexture(bCanvas);
  }

  const badgeMeshes = [];
  const badgeDiscGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.12, 32);

  categoryBadges.forEach(cfg => {
    const badgeGroup = new THREE.Group();
    const tex = createBadgeTexture(cfg.icon, cfg.category, cfg.color);

    const discMat = [
      new THREE.MeshStandardMaterial({ color: cfg.ring, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    ];

    const disc = new THREE.Mesh(badgeDiscGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    disc.castShadow = true;
    badgeGroup.add(disc);

    // Glowing halo ring
    const ringGeo = new THREE.RingGeometry(0.76, 0.88, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: cfg.ring,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = -0.01;
    badgeGroup.add(ring);

    badgeGroup.userData = {
      category: cfg.category,
      baseRadius: cfg.radius,
      baseAngle: cfg.angle,
      baseY: cfg.y,
      ringMesh: ring,
      isHovered: false
    };

    scene.add(badgeGroup);
    badgeMeshes.push(badgeGroup);
  });

  // Interaction: Raycasting & Click to filter
  const raycaster = new THREE.Raycaster();
  const mousePos = new THREE.Vector2(-999, -999);
  let hoveredBadge = null;

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onClick() {
    if (hoveredBadge) {
      const category = hoveredBadge.userData.category;
      setCategory(category);
      const dirSection = document.getElementById("directory");
      if (dirSection) {
        dirSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("click", onClick);

  // Interaction: Drag to Rotate Island & Camera Parallax
  let isDragging = false;
  let prevPointer = { x: 0, y: 0 };
  let islandTargetRotY = 0;
  let islandTargetRotX = 0;
  let autoSpin = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  canvas.addEventListener("pointerdown", e => {
    isDragging = true;
    prevPointer = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture?.(e.pointerId);
    if (hint) hint.style.opacity = "0.4";
  });

  window.addEventListener("pointerup", e => {
    isDragging = false;
  });

  window.addEventListener("pointermove", e => {
    if (isDragging) {
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      islandTargetRotY += dx * 0.009;
      islandTargetRotX = Math.max(-0.35, Math.min(0.35, islandTargetRotX + dy * 0.006));
      prevPointer = { x: e.clientX, y: e.clientY };
    }
  });

  // Mouse Parallax on wrapper
  let parallaxX = 0;
  let parallaxY = 0;
  wrapper.addEventListener("mousemove", e => {
    const r = wrapper.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    parallaxX = nx * 1.5;
    parallaxY = ny * 0.8;
  });
  wrapper.addEventListener("mouseleave", () => {
    parallaxX = 0;
    parallaxY = 0;
  });

  // HUD Controls
  const moodButtons = document.querySelectorAll(".mood-btn");
  function setMood(mood) {
    moodButtons.forEach(b => {
      const active = b.dataset.mood === mood;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    if (mood === "day") {
      sunLight.color.setHex(0xfff5e6);
      sunLight.intensity = 1.35;
      sunLight.position.set(11, 17, 9);
      ambientLight.color.setHex(0xfff6ea);
      ambientLight.intensity = 0.95;
      windowMaterial.emissiveIntensity = 0.2;
      lampBulbs.forEach(b => b.material.emissiveIntensity = 0.2);
      lampPointLights.forEach(l => l.intensity = 0);
      starMat.opacity = 0;
      pollenMat.color.setHex(0xd9e9a2);
    } else if (mood === "sunset") {
      sunLight.color.setHex(0xff7a38);
      sunLight.intensity = 1.6;
      sunLight.position.set(16, 5, 8);
      ambientLight.color.setHex(0x9a6b68);
      ambientLight.intensity = 0.7;
      windowMaterial.emissiveIntensity = 0.8;
      lampBulbs.forEach(b => b.material.emissiveIntensity = 0.7);
      lampPointLights.forEach(l => l.intensity = 0.9);
      starMat.opacity = 0.3;
      pollenMat.color.setHex(0xffb066);
    } else if (mood === "night") {
      sunLight.color.setHex(0x6a89c8);
      sunLight.intensity = 0.45;
      sunLight.position.set(-8, 14, -6);
      ambientLight.color.setHex(0x1a243b);
      ambientLight.intensity = 0.6;
      windowMaterial.emissiveIntensity = 1.4;
      lampBulbs.forEach(b => b.material.emissiveIntensity = 1.5);
      lampPointLights.forEach(l => l.intensity = 1.8);
      starMat.opacity = 0.95;
      pollenMat.color.setHex(0xfff078);
    }
  }

  moodButtons.forEach(btn => btn.addEventListener("click", () => setMood(btn.dataset.mood)));

  const spinToggle = document.getElementById("diorama-spin-toggle");
  if (spinToggle) {
    spinToggle.addEventListener("click", () => {
      autoSpin = !autoSpin;
      spinToggle.textContent = autoSpin ? "⏸ Pause" : "↻ Spin";
      spinToggle.setAttribute("aria-pressed", String(autoSpin));
    });
  }

  const resetBtn = document.getElementById("diorama-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      islandTargetRotX = 0;
      islandTargetRotY = 0;
      parallaxX = 0;
      parallaxY = 0;
    });
  }

  // Handle Resize
  function handleResize() {
    width = wrapper.clientWidth || 500;
    height = wrapper.clientHeight || 440;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener("resize", handleResize);

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Auto-spin island
    if (autoSpin && !isDragging) {
      islandTargetRotY += 0.0035;
    }

    // Smooth inertia interpolation
    islandGroup.rotation.y += (islandTargetRotY - islandGroup.rotation.y) * 0.1;
    islandGroup.rotation.x += (islandTargetRotX - islandGroup.rotation.x) * 0.1;

    // Camera parallax
    camera.position.x += (parallaxX * 2.5 - camera.position.x) * 0.05;
    camera.position.y += ((8.5 - parallaxY * 1.5) - camera.position.y) * 0.05;
    camera.lookAt(0, 0.6, 0);

    // Orbiting clouds
    clouds.forEach(c => {
      c.angle += c.speed;
      c.mesh.position.x = Math.sin(c.angle) * c.radius;
      c.mesh.position.z = Math.cos(c.angle) * c.radius;
      c.mesh.position.y = c.y + Math.sin(time + c.angle) * 0.1;
    });

    // Twinkling stars
    if (starMat.opacity > 0.05) {
      starMat.size = 0.22 + Math.sin(time * 3) * 0.05;
    }

    // Floating category badges
    badgeMeshes.forEach((bg, idx) => {
      const curAngle = bg.userData.baseAngle + (autoSpin ? time * 0.12 : islandGroup.rotation.y * 0.5);
      const r = bg.userData.baseRadius;
      bg.position.x = Math.sin(curAngle) * r;
      bg.position.z = Math.cos(curAngle) * r;
      bg.position.y = bg.userData.baseY + Math.sin(time * 2.2 + idx * 1.3) * 0.14;

      // Always billboard toward camera
      bg.quaternion.copy(camera.quaternion);

      // Hover scale
      const targetScale = bg.userData.isHovered ? 1.25 : 1.0;
      bg.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
      bg.userData.ringMesh.material.opacity = bg.userData.isHovered ? 0.85 : 0.35;
    });

    // Raycast hover check
    raycaster.setFromCamera(mousePos, camera);
    const intersects = raycaster.intersectObjects(badgeMeshes, true);
    let hitBadge = null;
    if (intersects.length > 0) {
      let top = intersects[0].object;
      while (top.parent && top.parent !== scene) {
        if (badgeMeshes.includes(top)) {
          hitBadge = top;
          break;
        }
        top = top.parent;
      }
      if (badgeMeshes.includes(top)) hitBadge = top;
    }

    badgeMeshes.forEach(b => {
      b.userData.isHovered = (b === hitBadge);
    });
    hoveredBadge = hitBadge;

    if (!isDragging) {
      canvas.style.cursor = hitBadge ? "pointer" : "grab";
    }

    renderer.render(scene, camera);
  }

  animate();
}

// Initialize on page load
renderServices();
loadServices();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHero3D);
} else {
  initHero3D();
}
