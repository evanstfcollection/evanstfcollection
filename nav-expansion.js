document.addEventListener("DOMContentLoaded", () => {
  const panel = document.querySelector("#navExpansion");
  if (!panel) return;

  const header = document.querySelector(".topbar, .site-header.unified-header");
  const activeItem = document.querySelector(".topbar .nav-item.active, .site-header .nav-item.active");
  const autobotsItem = document.querySelector(".topbar .nav-item.autobots, .site-header .nav-item.autobots");
  const triggers = [...new Set([activeItem, autobotsItem].filter(Boolean))];
  const closeButton = panel.querySelector(".nav-expansion-close");
  const targets = {
    overview: document.querySelector(".collection-shell") || document.querySelector("main"),
    browse: document.querySelector("#gallery, #previewGrid, .preview-grid") || document.querySelector(".collection-shell"),
    filters: document.querySelector("#filterControls, #toggleFilters") || document.querySelector("#gallery, #previewGrid, .preview-grid")
  };

  function positionPanel() {
    if (!header || panel.hidden) return;
    const rect = header.getBoundingClientRect();
    panel.style.left = (rect.left + window.scrollX) + "px";
    panel.style.top = (rect.bottom + window.scrollY - 123) + "px";
    panel.style.width = rect.width + "px";
  }

  function setOpen(open) {
    panel.hidden = !open;
    triggers.forEach(item => {
      item.setAttribute("aria-expanded", String(open));
      item.classList.toggle("menu-expanded", open);
    });
    if (open) positionPanel();
  }

  Object.entries(targets).forEach(([key, target]) => {
    const link = panel.querySelector('[data-nav-shortcut="' + key + '"]');
    if (!link || !target) return;
    link.href = "#" + (target.id || "collection-target");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (key === "filters" && target.id === "toggleFilters") target.click();
      setOpen(false);
    });
  });

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const isAutobotsPage = currentPath === "autobots.html";

  triggers.forEach(item => {
    item.setAttribute("aria-haspopup", "true");
    item.setAttribute("aria-expanded", "false");
    item.addEventListener("click", (event) => {
      const isAutobotsLink = item.classList.contains("autobots");

      // From another page, let Autobots navigate normally without opening
      // the expanded quick-access menu automatically.
      if (isAutobotsLink && !isAutobotsPage) {
        return;
      }

      // On the Autobots page itself, clicking the active tab toggles the menu.
      event.preventDefault();
      setOpen(panel.hidden);
    });
  });

  closeButton?.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
  window.addEventListener("resize", positionPanel);
});