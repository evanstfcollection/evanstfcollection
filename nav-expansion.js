document.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector("#navExpansion");
  if (!panel) return;

  const activeItem = document.querySelector(".topbar .nav-item.active");
  const closeButton = panel.querySelector(".nav-expansion-close");
  const overview = panel.querySelector('[data-nav-shortcut="overview"]');
  const browse = panel.querySelector('[data-nav-shortcut="browse"]');
  const filters = panel.querySelector('[data-nav-shortcut="filters"]');

  const collection = document.querySelector(".collection-shell") || document.querySelector("main");
  const gallery = document.querySelector("#gallery, #previewGrid, .preview-grid") || collection;
  const filterTarget = document.querySelector("#filterControls, #toggleFilters") || gallery;

  if (overview && collection) overview.href = "#" + (collection.id || "");
  if (browse && gallery) browse.href = "#" + (gallery.id || "");
  if (filters && filterTarget) filters.href = "#" + (filterTarget.id || "");

  function setOpen(open) {
    panel.hidden = !open;
    if (activeItem) {
      activeItem.setAttribute("aria-expanded", String(open));
      activeItem.classList.toggle("menu-expanded", open);
    }
  }

  if (activeItem) {
    activeItem.setAttribute("aria-haspopup", "true");
    activeItem.setAttribute("aria-expanded", "false");
    activeItem.addEventListener("click", (event) => {
      event.preventDefault();
      setOpen(panel.hidden);
    });
  }

  closeButton?.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
  panel.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setOpen(false));
  });
});