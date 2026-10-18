document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const menu = document.querySelector("#mobile-site-menu");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  };

  toggle.addEventListener("click", () => {
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
  });

  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
});
