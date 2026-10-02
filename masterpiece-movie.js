const previewGrid = document.getElementById("previewGrid");
const infoImage = document.getElementById("infoImage");
const infoName = document.getElementById("infoName");
const infoSpecs = document.getElementById("infoSpecs");
const infoThumbs = document.getElementById("infoThumbs");
const infoNotes = document.getElementById("infoNotes");
const infoCounter = document.getElementById("infoCounter");
const infoClose = document.getElementById("infoClose");
const previousFigure = document.getElementById("previousFigure");
const nextFigure = document.getElementById("nextFigure");
const imageLightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeImageLightbox = document.getElementById("closeImageLightbox");

let figures = [];
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

function imageList(item) {
  return (item.figure_images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(image => publicImageUrl(image.storage_path))
    .filter(Boolean);
}

function renderPreviewGrid() {
  if (!figures.length) {
    previewGrid.innerHTML = '<div class="collection-placeholder"><h3>No Masterpiece Movie Figures Added Yet</h3><p>Published Masterpiece Movie figures will appear here automatically.</p></div>';
    return;
  }

  previewGrid.innerHTML = figures.map((item, index) => {
    const images = imageList(item);
    return `
      <article class="collection-card">
        <button class="preview-window" type="button" data-index="${index}" aria-label="View ${escapeHtml(item.name)}">
          ${images[0]
            ? `<img src="${escapeHtml(profileUrl)}" alt="${escapeHtml(item.name)}">`
            : '<span>NO IMAGE</span>'}
        </button>
        <div class="card-caption">${escapeHtml(item.name)}</div>
      </article>
    `;
  }).join("");

  previewGrid.querySelectorAll(".collection-card").forEach(card => {
    const open = () => openDetails(Number(card.dataset.index));
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function openDetails(index) {
  if (!figures.length) return;

  selectedIndex = index;
  const item = figures[selectedIndex];
  const images = imageList(item);
  const profile = (item.figure_images || []).find(image => image.image_type === "main") || (item.figure_images || [])[0];
  const profileUrl = profile ? publicImageUrl(profile.storage_path) : "";

  document.getElementById("collectionInfo").setAttribute("aria-hidden", "false");

  infoName.textContent = item.name || "FIGURE NAME";

  infoImage.innerHTML = profileUrl
    ? `<img src="${escapeHtml(images[0])}" alt="${escapeHtml(item.name)}">`
    : "<span>FIGURE PREVIEW</span>";

  infoSpecs.innerHTML = `
    <div><strong>Manufacturer:</strong><span>${escapeHtml(item.manufacturer || "—")}</span></div>
    <div><strong>Toy Line:</strong><span>${escapeHtml(item.toy_line || "—")}</span></div>
    <div><strong>Series:</strong><span>${escapeHtml(item.series || "—")}</span></div>
    <div><strong>Movie Reference:</strong><span>${escapeHtml(item.movie_reference || "—")}</span></div>
    <div><strong>Release Year:</strong><span>${escapeHtml(item.year || "—")}</span></div>
    <div><strong>Alternate Mode:</strong><span>${escapeHtml(item.alternate_mode || "—")}</span></div>
    <div><strong>Scale:</strong><span>${escapeHtml(item.scale || "—")}</span></div>
    <div><strong>Condition:</strong><span>${escapeHtml(item.condition || "—")}</span></div>
  `;

  infoThumbs.innerHTML = images.map((src, thumbIndex) => `
    <button type="button" aria-label="View image ${thumbIndex + 1}">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(item.name)}">
    </button>
  `).join("");

  infoThumbs.querySelectorAll("button").forEach((button, thumbIndex) => {
    button.addEventListener("click", () => setInfoImage(images[thumbIndex], item.name));
  });

  infoNotes.textContent = item.notes || "No collection notes have been added yet.";
  infoCounter.textContent = `${selectedIndex + 1} of ${figures.length}`;
  previousFigure.disabled = figures.length < 2;
  nextFigure.disabled = figures.length < 2;
}

function setInfoImage(src, name) {
  infoImage.innerHTML = src
    ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(name)}">`
    : "<span>FIGURE PREVIEW</span>";
}

function moveSelection(direction) {
  if (!figures.length) return;
  selectedIndex = (selectedIndex + direction + figures.length) % figures.length;
  openDetails(selectedIndex);
}

function openImageLightbox() {
  const image = infoImage.querySelector("img");
  if (!image) return;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  imageLightbox.showModal();
}

function closeLightbox() {
  if (imageLightbox.open) imageLightbox.close();
}

async function loadFigures() {
  previewGrid.innerHTML = '<div class="collection-placeholder"><h3>Loading Collection...</h3><p>Connecting to the Masterpiece Movie database.</p></div>';

  const { data, error } = await supabaseClient
    .from("figures")
    .select("*, figure_images(*)")
    .eq("category", "Masterpiece Movie")
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Unable to load Masterpiece Movie figures:", error);
    previewGrid.innerHTML = '<div class="collection-placeholder"><h3>Unable to Load Collection</h3><p>Please refresh the page and try again.</p></div>';
    return;
  }

  figures = data || [];
  renderPreviewGrid();

  if (figures.length) {
    openDetails(0);
  }
}

infoImage.addEventListener("click", openImageLightbox);
infoClose.addEventListener("click", () => {
  document.getElementById("collectionInfo").setAttribute("aria-hidden", "true");
});
previousFigure.addEventListener("click", () => moveSelection(-1));
nextFigure.addEventListener("click", () => moveSelection(1));
closeImageLightbox.addEventListener("click", closeLightbox);
imageLightbox.addEventListener("click", event => {
  if (event.target === imageLightbox) closeLightbox();
});

loadFigures();
