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

  // Homepage gallery: continuously auto-scroll through the images in a seamless loop.
  const gallery = document.querySelector(".home-personal-gallery-grid");
  if (gallery && gallery.children.length > 1) {
    const originalItems = Array.from(gallery.children);
    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add("gallery-loop-copy");
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("img").forEach((img) => {
        img.setAttribute("alt", "");
        img.loading = "eager";
      });
      gallery.appendChild(clone);
    });

    let paused = false;
    let lastTime = 0;
    const speed = 35; // pixels per second
    gallery.addEventListener("touchstart", () => { paused = true; }, { passive: true });
    gallery.addEventListener("touchend", () => { paused = false; }, { passive: true });
    gallery.addEventListener("touchcancel", () => { paused = false; }, { passive: true });

    function scrollGallery(time) {
      if (!lastTime) lastTime = time;
      const elapsed = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const firstCopy = gallery.querySelector(".gallery-loop-copy");
      if (!paused && firstCopy) {
        const loopWidth = firstCopy.offsetLeft - gallery.children[0].offsetLeft;
        if (loopWidth > 0) {
          gallery.scrollLeft += speed * elapsed;
          if (gallery.scrollLeft >= loopWidth) {
            gallery.scrollLeft -= loopWidth;
          }
        }
      }
      window.requestAnimationFrame(scrollGallery);
    }

    // Start at the beginning and wait for layout before calculating the loop distance.
    gallery.scrollLeft = 0;
    window.requestAnimationFrame(scrollGallery);
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
