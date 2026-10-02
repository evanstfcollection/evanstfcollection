document.addEventListener("DOMContentLoaded", async () => {
  const SUPABASE_URL = "https://owshushczghacpdyvqkt.supabase.co";
  const SUPABASE_KEY = "sb_publishable_3Z-pw2JX5ojxPLKBrbEYdg_AP1tYdTO";
  const BUCKET = "tf-collection";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const body = document.body;
  const category = body.dataset.category;
  const grid = document.querySelector(".preview-grid");
  const info = document.querySelector(".collection-info");
  if (!category || !grid || !info) return;

  const title = info.querySelector(".info-title h2");
  const titleIcon = info.querySelector(".info-title img");
  const infoImage = info.querySelector(".info-image");
  const thumbs = info.querySelector(".info-thumbs");
  const notes = info.querySelector(".info-notes p");
  const nav = info.querySelector(".info-navigation");
  const previousButton = nav?.querySelector("button:first-child");
  const nextButton = nav?.querySelector("button:last-child");
  const counter = nav?.querySelector("span");
  const closeButton = info.querySelector(".info-close");

  const categoryIcons = {
    "Autobots": "images/autobots-icon.png",
    "Decepticons": "images/decepticons-icon.png",
    "Masterpiece Movie": "images/masterpiece-movie-icon.png",
    "3rd Party": "images/3rd-party-icon.png",
    "The Primes": "images/primes-icon.png"
  };

  let figures = [];
  let currentIndex = 0;

  function publicUrl(path) {
    return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  function value(value) {
    return value === null || value === undefined || value === "" ? "—" : value;
  }

  function setInfoField(label, fieldValue) {
    const rows = [...info.querySelectorAll(".info-specs > div")];
    const row = rows.find((item) => item.querySelector("strong")?.textContent.replace(":", "").trim() === label);
    if (row) {
      row.querySelector("span").textContent = value(fieldValue);
    }
  }

  function showFigure(index) {
    if (!figures.length) return;

    currentIndex = (index + figures.length) % figures.length;
    const figure = figures[currentIndex];
    const images = figure.images || [];
    const profile = images.find((image) => image.image_type === "main") || images[0];
    const profileUrl = profile ? publicUrl(profile.storage_path) : "";

    title.textContent = value(figure.name);
    if (titleIcon) titleIcon.src = categoryIcons[category] || "";
    infoImage.innerHTML = profileUrl
      ? '<img src="' + profileUrl + '" alt="' + value(figure.name) + '">'
      : "<span>NO PROFILE IMAGE</span>";

    setInfoField("Manufacturer", figure.manufacturer);
    setInfoField("Toy Line", figure.toy_line);
    setInfoField("Series", figure.series);
    setInfoField("Movie Reference", figure.movie_reference);
    setInfoField("Release Year", figure.year);
    setInfoField("Version", figure.series);
    setInfoField("Alternate Mode", figure.alternate_mode);
    setInfoField("Scale", figure.scale);
    setInfoField("Condition", figure.condition);

    notes.textContent = value(figure.notes);

    thumbs.innerHTML = "";
    images.forEach((image) => {
      const button = document.createElement("button");
      button.type = "button";
      button.title = "View image";
      const img = document.createElement("img");
      img.src = publicUrl(image.storage_path);
      img.alt = image.alt_text || figure.name || "Figure image";
      button.appendChild(img);
      button.addEventListener("click", () => {
        infoImage.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '">';
      });
      thumbs.appendChild(button);
    });

    counter.textContent = (currentIndex + 1) + " of " + figures.length;
    previousButton.disabled = figures.length < 2;
    nextButton.disabled = figures.length < 2;

  }

  function buildCards() {
    grid.innerHTML = "";
    figures.forEach((figure, index) => {
      const card = document.createElement("article");
      card.className = "collection-card";

      const window = document.createElement("div");
      window.className = "preview-window";

      const images = figure.images || [];
      const profile = images.find((image) => image.image_type === "main") || images[0];

      if (profile) {
        const img = document.createElement("img");
        img.src = publicUrl(profile.storage_path);
        img.alt = profile.alt_text || figure.name || "Figure image";
        window.appendChild(img);
      } else {
        window.innerHTML = "<span>NO IMAGE</span>";
      }

      const caption = document.createElement("div");
      caption.className = "card-caption";
      caption.textContent = figure.name || "Unnamed Figure";

      card.appendChild(window);
      card.appendChild(caption);
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "View details for " + (figure.name || "figure"));
      card.addEventListener("click", () => showFigure(index));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showFigure(index);
        }
      });
      grid.appendChild(card);
    });
  }

  try {
    const { data: figureData, error: figureError } = await client
      .from("figures")
      .select("id,category,name,manufacturer,toy_line,series,year,alternate_mode,scale,condition,notes,movie_reference,sort_order")
      .eq("category", category)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (figureError) throw figureError;

    const ids = (figureData || []).map((figure) => figure.id);
    let imageData = [];

    if (ids.length) {
      const { data, error } = await client
        .from("figure_images")
        .select("id,figure_id,storage_path,image_type,sort_order,alt_text")
        .in("figure_id", ids)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      imageData = data || [];
    }

    figures = (figureData || []).map((figure) => ({
      ...figure,
      images: imageData.filter((image) => image.figure_id === figure.id)
    }));

    if (!figures.length) {
      grid.innerHTML = '<div class="collection-placeholder"><h3>COLLECTION EMPTY</h3><p>No published figures are currently available in this collection.</p></div>';
      counter.textContent = "0 of 0";
      return;
    }

    buildCards();
    showFigure(0);
  } catch (error) {
    console.error("Collection database error:", error);
    grid.innerHTML = '<div class="collection-placeholder"><h3>DATABASE CONNECTION ERROR</h3><p>The collection could not be loaded right now. Please refresh the page and try again.</p></div>';
  }

  previousButton?.addEventListener("click", () => showFigure(currentIndex - 1));
  nextButton?.addEventListener("click", () => showFigure(currentIndex + 1));

  closeButton?.addEventListener("click", () => {
    info.classList.toggle("info-collapsed");
  });
});