document.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector("#navExpansion");
  if (!panel) return;

  const activeItem = document.querySelector(".topbar .nav-item.active");
  const closeButton = panel.querySelector(".nav-expansion-close");
  const targets = {
    overview: document.querySelector(".collection-shell") || document.querySelector("main"),
    browse: document.querySelector("#gallery, #previewGrid, .preview-grid") || document.querySelector(".collection-shell"),
    filters: document.querySelector("#filterControls, #toggleFilters") || document.querySelector("#gallery, #previewGrid, .preview-grid")
  };

  Object.entries(targets).forEach(([key, target]) => {
    const link = panel.querySelector('[data-nav-shortcut="' + key + '"]');
    if (!link || !target) return;
    link.href = "#" + (target.id || "collection-target");
    link.addEventListener("click", (event) => {
      if (!target.id) event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (key === "filters" && target.id === "toggleFilters") target.click();
      setOpen(false);
    });
  });

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
});