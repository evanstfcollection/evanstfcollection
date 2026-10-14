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
    if (open) {
      const themeItem = document.querySelector(".topbar .nav-item.active, .site-header .nav-item.active") || activeItem || autobotsItem;
      const themeClasses = ["autobots", "decepticons", "masterpiece", "third-party", "primes", "contact"];
      const theme = themeClasses.find(name => themeItem && themeItem.classList.contains(name)) || "autobots";
      document.body.dataset.cyberTheme = theme;

      /* Apply the active faction lighting directly to the rendered elements.
         Inline styles avoid the layered legacy CSS rules masking the accents. */
      const accentMap = {
        autobots: "#ff302f",
        decepticons: "#b44aff",
        masterpiece: "#ffc34c",
        "third-party": "#39e879",
        primes: "#00d5f5",
        contact: "#d8e5f4"
      };
      const accent = accentMap[theme] || accentMap.autobots;
      panel.style.setProperty("--menu-accent", accent);
      /* Keep the outer menu artwork clean; place one accent frame around
         the complete row of shortcut buttons, not around each button. */
      panel.style.border = "0";
      panel.style.boxShadow = "none";
      panel.style.filter = "none";
      const linksFrame = panel.querySelector(".nav-expansion-links");
      if (linksFrame) {
        linksFrame.style.setProperty("--menu-accent", accent);
        /* Apply the shared frame directly to the live element. This avoids
           pseudo-element stacking and CSS override conflicts entirely. */
        linksFrame.style.boxSizing = "border-box";
        /* Match the horizontal span of the inset opening in expanded-menu-panel.png. */
        linksFrame.style.width = "82%";
        linksFrame.style.maxWidth = "none";
        linksFrame.style.marginLeft = "auto";
        linksFrame.style.marginRight = "auto";
        linksFrame.style.padding = "14.4px 16px";
        linksFrame.style.position = "relative";
        linksFrame.style.border = "0";
        linksFrame.style.background = "transparent";
        linksFrame.style.boxShadow = "none";


      }
      panel.querySelectorAll(".nav-expansion-links a").forEach((link) => {
        link.style.setProperty("--menu-accent", accent);
        link.style.border = "0";
        link.style.outline = "0";
        link.style.boxShadow = "none";
        link.style.filter = "none";
      });
    }
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
  const isAutobotsPage = currentPath === "autobots.html" || currentPath === "autobots2.html";

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