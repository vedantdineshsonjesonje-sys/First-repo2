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
  return `<article class="service-card">
    <div class="card-top"><span class="category-label">${service.category}</span><span class="card-icon" aria-hidden="true">${service.icon}</span></div>
    <h3>${service.name}</h3><p class="description">${service.description}</p>
    <p class="card-detail"><span aria-hidden="true">◎</span><span>${service.address}</span></p>
    <p class="card-detail"><span aria-hidden="true">◷</span><span>${service.hours}</span></p>
    <p class="card-detail"><span aria-hidden="true">☎</span><a class="phone-link" href="tel:${rawService.phone.replace(/[^+\d]/g, "")}">${service.phone}</a></p>
    <div class="card-footer"><span class="verified">${service.verified}</span><a class="card-link" href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" rel="noreferrer">Directions ↗</a></div>
  </article>`;
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

renderServices();
loadServices();
