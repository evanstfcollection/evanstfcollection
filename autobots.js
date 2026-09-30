const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const manufacturerFilter = document.getElementById("manufacturerFilter");
const seriesFilter = document.getElementById("seriesFilter");
const yearFilter = document.getElementById("yearFilter");
const clearFilters = document.getElementById("clearFilters");
const toggleFilters = document.getElementById("toggleFilters");
const filterControls = document.getElementById("filterControls");

const detailPanel = document.getElementById("detailPanel");
const closeDetails = document.getElementById("closeDetails");
const detailName = document.getElementById("detailName");
const detailMainImage = document.getElementById("detailMainImage");
const detailSpecs = document.getElementById("detailSpecs");
const detailThumbs = document.getElementById("detailThumbs");
const detailNotes = document.getElementById("detailNotes");
const detailCounter = document.getElementById("detailCounter");
const previousFigure = document.getElementById("previousFigure");
const nextFigure = document.getElementById("nextFigure");

let figures = [];
let visibleFigures = [];
let selectedIndex = 0;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicImageUrl(path) {
  if (!path) return "";
  return supabaseClient.storage.from("tf-collection").getPublicUrl(path).data.publicUrl;
}

function setFiltersOpen(open) {
  if (!toggleFilters || !filterControls) return;
  filterControls.classList.toggle("filters-open", open);
  toggleFilters.setAttribute("aria-expanded", String(open));
  const icon = toggleFilters.querySelector("span");
  if (icon) icon.textContent = open ? "−" : "+";
}

if (toggleFilters) {
  toggleFilters.addEventListener("click", () => {
    const isOpen = filterControls.classList.contains("filters-open");
    setFiltersOpen(!isOpen);
  });
}

if (window.matchMedia("(max-width: 520px)").matches) {
  setFiltersOpen(false);
}

function uniqueValues(key) {
  return [...new Set(figures.map(item => item[key]).filter(value => value !== null && value !== ""))]
    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function fillFilters() {
  manufacturerFilter.innerHTML = '<option value="">All Manufacturers</option>';
  seriesFilter.innerHTML = '<option value="">All Series</option>';
  yearFilter.innerHTML = '<option value="">All Years</option>';

  uniqueValues("manufacturer").forEach(value => {
    manufacturerFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`);
  });

  uniqueValues("series").forEach(value => {
    seriesFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`);
  });

  uniqueValues("year").forEach(value => {
    yearFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`);
  });
}

function renderGallery() {
  const search = searchInput.value.trim().toLowerCase();

  visibleFigures = figures.filter(item => {
    const searchable = [
      item.name,
      item.manufacturer,
      item.toy_line,
      item.series,
      item.alternate_mode
    ].filter(Boolean).join(" ").toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    const matchesManufacturer = !manufacturerFilter.value || item.manufacturer === manufacturerFilter.value;
    const matchesSeries = !seriesFilter.value || item.series === seriesFilter.value;
    const matchesYear = !yearFilter.value || String(item.year) === yearFilter.value;

    return matchesSearch && matchesManufacturer && matchesSeries && matchesYear;
  });

  if (!visibleFigures.length) {
    gallery.innerHTML = `<div class="empty">No figures match the current filters.</div>`;
    detailPanel.setAttribute("aria-hidden", "true");
    return;
  }

  gallery.innerHTML = visibleFigures.map((item, index) => `
    <article class="card">
      <img class="card-image"
           src="${escapeHtml(item.image)}"
           alt="${escapeHtml(item.name)}"
           onerror="this.style.visibility='hidden'">
      <div class="card-body">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.manufacturer || "Manufacturer not listed")} | ${escapeHtml(item.toy_line || "Toy line not listed")}</p>
        <p>${escapeHtml(item.series || "Series not listed")}</p>
        <button type="button" data-index="${index}">VIEW DETAILS →</button>
      </div>
    </article>
  `).join("");

  gallery.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => openDetails(Number(button.dataset.index)));
  });
}

function openDetails(index) {
  if (!visibleFigures.length) return;

  selectedIndex = index;
  const item = visibleFigures[selectedIndex];
  const thumbs = item.thumbs || [];

  detailPanel.setAttribute("aria-hidden", "false");
  detailName.textContent = item.name;
  detailMainImage.style.backgroundImage = item.image ? `url("${item.image}")` : "";

  detailSpecs.innerHTML = `
    <div class="spec"><strong>Manufacturer:</strong><span>${escapeHtml(item.manufacturer || "—")}</span></div>
    <div class="spec"><strong>Toy Line:</strong><span>${escapeHtml(item.toy_line || "—")}</span></div>
    <div class="spec"><strong>Series:</strong><span>${escapeHtml(item.series || "—")}</span></div>
    <div class="spec"><strong>Year Released:</strong><span>${escapeHtml(item.year || "—")}</span></div>
    <div class="spec"><strong>Alternate Mode:</strong><span>${escapeHtml(item.alternate_mode || "—")}</span></div>
    <div class="spec"><strong>Scale:</strong><span>${escapeHtml(item.scale || "—")}</span></div>
    <div class="spec"><strong>Condition:</strong><span>${escapeHtml(item.condition || "—")}</span></div>
  `;

  detailThumbs.innerHTML = thumbs.length
    ? thumbs.map((src, thumbIndex) => `
        <button type="button" aria-label="View image ${thumbIndex + 1}">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(item.name)}" onerror="this.style.visibility='hidden'">
        </button>
      `).join("")
    : "";

  detailThumbs.querySelectorAll("button").forEach((button, thumbIndex) => {
    button.addEventListener("click", () => {
      detailMainImage.style.backgroundImage = `url("${thumbs[thumbIndex]}")`;
    });
  });

  detailNotes.textContent = item.notes || "No collection notes have been added yet.";
  detailCounter.textContent = `${selectedIndex + 1} of ${visibleFigures.length}`;

  previousFigure.disabled = visibleFigures.length < 2;
  nextFigure.disabled = visibleFigures.length < 2;
}

function closeDetailPanel() {
  detailPanel.setAttribute("aria-hidden", "true");
}

function moveSelection(direction) {
  if (!visibleFigures.length) return;
  selectedIndex = (selectedIndex + direction + visibleFigures.length) % visibleFigures.length;
  openDetails(selectedIndex);
}

async function loadFigures() {
  gallery.innerHTML = '<div class="empty">Loading collection...</div>';

  const { data, error } = await supabaseClient
    .from("figures")
    .select("*, figure_images(*)")
    .eq("category", "Autobots")
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Unable to load Autobots:", error);
    gallery.innerHTML = '<div class="empty">Unable to load the Autobots collection right now.</div>';
    return;
  }

  figures = (data || []).map(item => {
    const images = (item.figure_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(image => publicImageUrl(image.storage_path))
      .filter(Boolean);

    return {
      ...item,
      image: images[0] || "",
      thumbs: images
    };
  });

  fillFilters();
  renderGallery();

  if (visibleFigures.length) {
    openDetails(0);
  }
}

[searchInput, manufacturerFilter, seriesFilter, yearFilter].forEach(control => {
  control.addEventListener("input", renderGallery);
  control.addEventListener("change", renderGallery);
});

clearFilters.addEventListener("click", () => {
  searchInput.value = "";
  manufacturerFilter.value = "";
  seriesFilter.value = "";
  yearFilter.value = "";
  renderGallery();
});

closeDetails.addEventListener("click", closeDetailPanel);
previousFigure.addEventListener("click", () => moveSelection(-1));
nextFigure.addEventListener("click", () => moveSelection(1));

loadFigures();
