document.addEventListener("DOMContentLoaded", () => {

  const folderSections = [
    ...document.querySelectorAll(".folder-section")
  ];

  const folderTabs = [
    ...document.querySelectorAll(".folder-tab")
  ];

  const navButtons = [
    ...document.querySelectorAll(".nav-tab")
  ];

  const dropdownLinks = [
    ...document.querySelectorAll(".dropdown-link")
  ];

  const navItems = [
    ...document.querySelectorAll(".nav-item")
  ];

  const menuToggle =
    document.querySelector(".menu-toggle");

  const mobileNav =
    document.querySelector("#mobile-nav");

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

  function closeAllFolders(except = null) {
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

  function closeNavItems(except = null) {
    navItems.forEach((item) => {
      if (item !== except) {
        item.classList.remove("open");
        const button = item.querySelector(".nav-tab");
        if (button) {
          button.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const item = button.closest(".nav-item");
      if (!item) return;
      const isOpen = item.classList.contains("open");
      if (isOpen) {
        closeNavItems();
      } else {
        closeNavItems(item);
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  dropdownLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const target = document.getElementById(targetId);
      if (!target) return;
      closeNavItems();
      if (target.classList.contains("folder-section")) {
        openFolder(target);
      } else {
        closeAllFolders();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener(
      "click",
      () => {
        const isOpen =
          mobileNav.classList.toggle("open");
        menuToggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );
      }
    );
  }

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
