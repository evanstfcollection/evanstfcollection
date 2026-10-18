document.addEventListener("DOMContentLoaded", () => {

  const folderSections = [
    ...document.querySelectorAll(".folder-section")
  ];

  const folderTabs = [
    ...document.querySelectorAll(".folder-tab")
  ];

  const contactForm =
    document.querySelector("#contact-form");

  const formStatus =
    document.querySelector("#form-status");

  const year =
    document.querySelector("#year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  // Homepage gallery: continuous horizontal movement, with click-to-enlarge.
  const gallery = document.querySelector(".home-personal-gallery-grid");
  if (gallery && gallery.children.length > 1) {
    const originalItems = Array.from(gallery.children);
    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add("gallery-loop-copy");
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("img").forEach((img) => {
        img.alt = "";
        img.loading = "eager";
      });
      gallery.appendChild(clone);
    });

    let paused = false;
    let lastTime = 0;
    const speed = 38;

    gallery.addEventListener("mouseenter", () => { paused = true; });
    gallery.addEventListener("mouseleave", () => { paused = false; });
    gallery.addEventListener("touchstart", () => { paused = true; }, { passive: true });
    gallery.addEventListener("touchend", () => { paused = false; }, { passive: true });
    gallery.addEventListener("touchcancel", () => { paused = false; }, { passive: true });

    function scrollGallery(time) {
      if (!lastTime) lastTime = time;
      const elapsed = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const firstCopy = gallery.querySelector(".gallery-loop-copy");
      if (!paused && firstCopy && gallery.children[0]) {
        const loopWidth = firstCopy.getBoundingClientRect().left -
          gallery.children[0].getBoundingClientRect().left;
        if (loopWidth > 1) {
          gallery.scrollLeft += speed * elapsed;
          if (gallery.scrollLeft >= loopWidth) {
            gallery.scrollLeft -= loopWidth;
          }
        }
      }
      window.requestAnimationFrame(scrollGallery);
    }

    gallery.scrollLeft = 0;
    window.requestAnimationFrame(scrollGallery);

    // A lightweight lightbox displays the selected image at full size.
    const lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Expanded gallery image");
    lightbox.innerHTML = '<button class="gallery-lightbox-close" type="button" aria-label="Close image">×</button><img alt=""><p class="gallery-lightbox-caption"></p>';
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector(".gallery-lightbox-caption");
    const closeButton = lightbox.querySelector(".gallery-lightbox-close");

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightboxImage.removeAttribute("src");
      paused = false;
    }
    function openLightbox(img) {
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || "Expanded gallery photograph";
      lightboxCaption.textContent = img.alt || "";
      lightbox.classList.add("is-open");
      paused = true;
    }

    gallery.addEventListener("click", (event) => {
      const img = event.target.closest(".home-personal-shot img");
      if (img) openLightbox(img);
    });
    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  function closeAllFolders(except = null) {
    document.body.classList.remove("autobots-active");
    folderSections.forEach((section) => {
      if (section !== except) {
        section.classList.remove("open");
        const tab = section.querySelector(".folder-tab");
        if (tab) {
          tab.setAttribute("aria-expanded", "false");
          const arrow = tab.querySelector(".tab-arrow");
          if (arrow) {
            arrow.textContent = "+";
          }
        }
      }
    });
  }

  function openFolder(section, shouldScroll = true) {
    closeAllFolders(section);
    section.classList.add("open");
    if (section.id === "autobots") {
      document.body.classList.add("autobots-active");
    }
    const tab = section.querySelector(".folder-tab");
    if (tab) {
      tab.setAttribute("aria-expanded", "true");
      const arrow = tab.querySelector(".tab-arrow");
      if (arrow) {
        arrow.textContent = "−";
      }
    }
    if (shouldScroll) {
      setTimeout(() => {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 80);
    }
  }

  function toggleFolder(section) {
    const isOpen = section.classList.contains("open");
    if (isOpen) {
      closeAllFolders();
    } else {
      openFolder(section);
    }
  }

  folderTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const section = tab.closest(".folder-section");
      if (section) {
        toggleFolder(section);
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        if (formStatus) {
          formStatus.textContent =
            "Message form is ready. Email delivery will be connected when the contact service is added.";
        }
      }
    );
  }
});


/* Mobile collection search/filter collapsible panel. */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".controls-toggle").forEach((toggle) => {
    const panel = toggle.closest(".controls-panel");
    const controls = panel?.querySelector("#filterControls");
    if (!panel || !controls) return;

    const setExpanded = (expanded) => {
      controls.hidden = !expanded;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "HIDE" : "SHOW";
      panel.classList.toggle("controls-collapsed", !expanded);
    };

    setExpanded(false);
    toggle.addEventListener("click", () => {
      setExpanded(toggle.getAttribute("aria-expanded") !== "true");
    });
  });
});
