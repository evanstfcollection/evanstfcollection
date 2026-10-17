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

  // Homepage gallery: seamless, slow auto-scroll with pause controls.
  const gallery = document.querySelector(".home-personal-gallery-grid");
  if (gallery) {
    const originalItems = Array.from(gallery.children);
    if (originalItems.length) {
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("img").forEach((img) => img.setAttribute("alt", ""));
        gallery.appendChild(clone);
      });

      let paused = false;
      let lastTime = 0;
      const speed = 22; // pixels per second
      // Keep moving while the pointer is over the gallery; pause only for touch interaction.
      gallery.addEventListener("touchstart", () => { paused = true; }, { passive: true });
      gallery.addEventListener("touchend", () => { paused = false; }, { passive: true });

      function scrollGallery(time) {
        if (!lastTime) lastTime = time;
        const elapsed = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        if (!paused) {
          const loopWidth = gallery.scrollWidth / 2;
          gallery.scrollLeft += speed * elapsed;
          if (loopWidth > 0 && gallery.scrollLeft >= loopWidth) {
            gallery.scrollLeft -= loopWidth;
          }
        }
        window.requestAnimationFrame(scrollGallery);
      }
      window.requestAnimationFrame(scrollGallery);
    }
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
