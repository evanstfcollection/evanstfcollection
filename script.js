document.addEventListener("DOMContentLoaded", () => {
  const folderSections = [...document.querySelectorAll(".folder-section")];
  const folderTabs = [...document.querySelectorAll(".folder-tab")];
  const navButtons = [...document.querySelectorAll("[data-target]")];
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const year = document.querySelector("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function closeAllFolders(except = null) {
    folderSections.forEach((section) => {
      if (section !== except) {
        section.classList.remove("open");

        const tab = section.querySelector(".folder-tab");
        if (tab) {
          tab.setAttribute("aria-expanded", "false");
          const arrow = tab.querySelector(".tab-arrow");
          if (arrow) arrow.textContent = "+";
        }
      }
    });
  }

  function openFolder(section, shouldScroll = true) {
    closeAllFolders(section);
    section.classList.add("open");

    const tab = section.querySelector(".folder-tab");
    if (tab) {
      tab.setAttribute("aria-expanded", "true");
      const arrow = tab.querySelector(".tab-arrow");
      if (arrow) arrow.textContent = "−";
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
      if (section) toggleFolder(section);
    });
  });

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const target = document.getElementById(targetId);

      if (!target) return;

      if (target.classList.contains("folder-section")) {
        openFolder(target);
      } else {
        closeAllFolders();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      if (mobileNav) {
        mobileNav.classList.remove("open");
      }

      if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (formStatus) {
        formStatus.textContent =
          "Message form is ready. Email delivery will be connected when the contact service is added.";
      }
    });
  }
});
