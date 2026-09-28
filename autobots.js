const figures = [
  {
    name: "OPTIMUS PRIME",
    manufacturer: "Hasbro",
    toyLine: "Masterpiece",
    series: "MP-44",
    year: "2023",
    alternate: "Convoy Truck",
    image: "images/autobots/optimus-prime.jpg",
    thumbs: [
      "images/autobots/optimus-prime.jpg",
      "images/autobots/optimus-prime-truck.jpg",
      "images/autobots/optimus-prime-action.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  },
  {
    name: "BUMBLEBEE",
    manufacturer: "Hasbro",
    toyLine: "Studio Series",
    series: "SS-100",
    year: "2024",
    alternate: "Volkswagen Beetle / Camaro",
    image: "images/autobots/bumblebee.jpg",
    thumbs: [
      "images/autobots/bumblebee.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  },
  {
    name: "ULTRA MAGNUS",
    manufacturer: "Hasbro",
    toyLine: "Generations",
    series: "War for Cybertron",
    year: "2020",
    alternate: "Cybertronian Carrier",
    image: "images/autobots/ultra-magnus.jpg",
    thumbs: [
      "images/autobots/ultra-magnus.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  },
  {
    name: "RATCHET",
    manufacturer: "Hasbro",
    toyLine: "Generations",
    series: "Earthrise",
    year: "2020",
    alternate: "Cybertronian Ambulance",
    image: "images/autobots/ratchet.jpg",
    thumbs: [
      "images/autobots/ratchet.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  },
  {
    name: "IRONHIDE",
    manufacturer: "Hasbro",
    toyLine: "Generations",
    series: "War for Cybertron",
    year: "2020",
    alternate: "Cybertronian Van",
    image: "images/autobots/ironhide.jpg",
    thumbs: [
      "images/autobots/ironhide.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  },
  {
    name: "JAZZ",
    manufacturer: "Hasbro",
    toyLine: "Masterpiece",
    series: "MP-20",
    year: "2017",
    alternate: "Porsche 935",
    image: "images/autobots/jazz.jpg",
    thumbs: [
      "images/autobots/jazz.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  },
  {
    name: "WHEELJACK",
    manufacturer: "Hasbro",
    toyLine: "Generations",
    series: "Earthrise",
    year: "2021",
    alternate: "Lancia Stratos",
    image: "images/autobots/wheeljack.jpg",
    thumbs: [
      "images/autobots/wheeljack.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  },
  {
    name: "GRIMLOCK",
    manufacturer: "Hasbro",
    toyLine: "Studio Series",
    series: "SS-86",
    year: "2021",
    alternate: "T. rex",
    image: "images/autobots/grimlock.jpg",
    thumbs: [
      "images/autobots/grimlock.jpg"
    ],
    notes: "Add your collection notes for this figure here."
  }
];

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const manufacturerFilter = document.getElementById("manufacturerFilter");
const seriesFilter = document.getElementById("seriesFilter");
const yearFilter = document.getElementById("yearFilter");
const clearFilters = document.getElementById("clearFilters");

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

let visibleFigures = [...figures];
let selectedIndex = 0;

function uniqueValues(key) {
  return [...new Set(figures.map(item => item[key]))].sort();
}

function fillFilters() {
  uniqueValues("manufacturer").forEach(value => {
    manufacturerFilter.insertAdjacentHTML("beforeend", `<option value="${value}">${value}</option>`);
  });

  uniqueValues("series").forEach(value => {
    seriesFilter.insertAdjacentHTML("beforeend", `<option value="${value}">${value}</option>`);
  });

  uniqueValues("year").forEach(value => {
    yearFilter.insertAdjacentHTML("beforeend", `<option value="${value}">${value}</option>`);
  });
}

function renderGallery() {
  const search = searchInput.value.trim().toLowerCase();

  visibleFigures = figures.filter(item => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.manufacturer.toLowerCase().includes(search) ||
      item.toyLine.toLowerCase().includes(search) ||
      item.series.toLowerCase().includes(search);

    const matchesManufacturer =
      !manufacturerFilter.value || item.manufacturer === manufacturerFilter.value;

    const matchesSeries =
      !seriesFilter.value || item.series === seriesFilter.value;

    const matchesYear =
      !yearFilter.value || item.year === yearFilter.value;

    return matchesSearch && matchesManufacturer && matchesSeries && matchesYear;
  });

  if (!visibleFigures.length) {
    gallery.innerHTML = `<div class="empty">No figures match the current filters.</div>`;
    return;
  }

  gallery.innerHTML = visibleFigures.map((item, index) => `
    <article class="card">
      <img class="card-image"
           src="${item.image}"
           alt="${item.name}"
           onerror="this.style.visibility='hidden'">
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.manufacturer} | ${item.toyLine}</p>
        <p>${item.series}</p>
        <button type="button" data-index="${index}">VIEW DETAILS →</button>
      </div>
    </article>
  `).join("");

  gallery.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => openDetails(Number(button.dataset.index)));
  });
}

function openDetails(index) {
  selectedIndex = index;
  const item = visibleFigures[selectedIndex];

  detailPanel.setAttribute("aria-hidden", "false");
  detailName.textContent = item.name;
  detailMainImage.style.backgroundImage = `url("${item.image}")`;

  detailSpecs.innerHTML = `
    <div class="spec"><strong>Manufacturer:</strong><span>${item.manufacturer}</span></div>
    <div class="spec"><strong>Toy Line:</strong><span>${item.toyLine}</span></div>
    <div class="spec"><strong>Series:</strong><span>${item.series}</span></div>
    <div class="spec"><strong>Year Released:</strong><span>${item.year}</span></div>
    <div class="spec"><strong>Alternate Mode:</strong><span>${item.alternate}</span></div>
  `;

  detailThumbs.innerHTML = item.thumbs.map(src => `
    <button type="button" aria-label="View image">
      <img src="${src}" alt="${item.name}" onerror="this.style.visibility='hidden'">
    </button>
  `).join("");

  detailThumbs.querySelectorAll("button").forEach((button, thumbIndex) => {
    button.addEventListener("click", () => {
      detailMainImage.style.backgroundImage = `url("${item.thumbs[thumbIndex]}")`;
    });
  });

  detailNotes.textContent = item.notes;
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

fillFilters();
renderGallery();
openDetails(0);
