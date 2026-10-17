(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const gallery = $("gallery");
  const searchInput = $("searchInput");
  const seriesFilter = $("seriesFilter");
  const yearFilter = $("yearFilter");
  const sortFilter = $("sortFilter");
  const clearFilters = $("clearFilters");
  const detailPanel = $("detailPanel");
  const detailName = $("detailName");
  const detailMainImage = $("detailMainImage");
  const detailSpecs = $("detailSpecs");
  const detailThumbs = $("detailThumbs");
  const detailNotes = $("detailNotes");

  const collectionCount = $("collectionCount");
  const resultCount = $("resultCount");
  const imageLightbox = $("imageLightbox");
  const lightboxImage = $("lightboxImage");
  const closeImageLightbox = $("closeImageLightbox");

  let figures = [];
  let visibleFigures = [];
  let selectedIndex = 0;
  let selectedImageUrl = "";

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function publicImageUrl(path) {
    if (!path || typeof supabaseClient === "undefined") return "";
    return supabaseClient.storage.from("tf-collection").getPublicUrl(path).data.publicUrl;
  }
  function uniqueValues(key) {
    return [...new Set(figures.map(item => item[key]).filter(value => value !== null && value !== "" && value !== undefined))]
      .sort((a,b) => String(a).localeCompare(String(b), undefined, {numeric:true}));
  }
  function fillFilters() {
    [[seriesFilter,"toy_line","All Toy Lines"],[yearFilter,"year","All Years"]].forEach(([select,key,label]) => {
      select.innerHTML = '<option value="">' + label + '</option>';
      uniqueValues(key).forEach(value => {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = String(value);
        select.appendChild(option);
      });
    });
  }
  function sortItems(items) {
    const mode = sortFilter.value;
    return items.sort((a,b) => {
      if (mode === "name-desc") return String(b.name||"").localeCompare(String(a.name||""),undefined,{numeric:true});
      if (mode === "year-desc") return Number(b.year||0)-Number(a.year||0) || String(a.name||"").localeCompare(String(b.name||""));
      if (mode === "year-asc") return Number(a.year||0)-Number(b.year||0) || String(a.name||"").localeCompare(String(b.name||""));
      if (mode === "model-asc") return String(a.series||"").localeCompare(String(b.series||""),undefined,{numeric:true}) || String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true});
      return String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true});
    });
  }
  function renderGallery() {
    const query = searchInput.value.trim().toLowerCase();
    visibleFigures = sortItems(figures.filter(item => {
      const searchable = [item.name,item.manufacturer,item.toy_line,item.series,item.alternate_mode,item.year].filter(Boolean).join(" ").toLowerCase();
      return (!query || searchable.includes(query)) &&
        (!seriesFilter.value || String(item.toy_line) === seriesFilter.value) &&
        (!yearFilter.value || String(item.year) === yearFilter.value);
    }));
    resultCount.textContent = visibleFigures.length + (visibleFigures.length === 1 ? " FIGURE" : " FIGURES");
    if (!visibleFigures.length) {
      gallery.innerHTML = '<div class="empty-state">No figures match the current search or filters.</div>';
      detailPanel.setAttribute("aria-hidden","true");

      return;
    }
    gallery.innerHTML = visibleFigures.map((item,index) => `
      <article class="card${index === selectedIndex ? " selected" : ""}" data-index="${index}" tabindex="0" role="button" aria-label="View ${escapeHtml(item.name)}">
        <div class="card-image-wrap">${item.image ? `<img class="card-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.opacity='0.15'">` : '<span class="image-placeholder">IMAGE<br>UNAVAILABLE</span>'}
          <img class="card-frame" src="images/decorative%20elements/icon-frame-square_result.webp" alt="" aria-hidden="true">
          <h4 class="card-name">${escapeHtml(item.name || "Unnamed figure")}</h4>
        </div>
      </article>`).join("");
    gallery.querySelectorAll(".card").forEach(card => {
      const open = () => openDetails(Number(card.dataset.index));
      card.addEventListener("click",open);
      card.addEventListener("keydown",event => { if(event.key==="Enter"||event.key===" "){event.preventDefault();open();} });
    });
  }

  function setFramedMainImage(src, alt) {
    if (!src) {
      detailMainImage.style.setProperty("--frame-aspect", "0.72");
      detailMainImage.innerHTML = '<div class="image-placeholder">NO IMAGE<br><span>AVAILABLE FOR THIS FIGURE</span></div>';
      return;
    }
    detailMainImage.style.setProperty("--frame-aspect", "0.72");
    detailMainImage.innerHTML = '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '">';
    const image = detailMainImage.querySelector("img");
    const applyRatio = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const photoRatio = image.naturalWidth / image.naturalHeight;
      /* Frame dimensions are calculated from the photo ratio; the photo itself is never stretched. */
      const frameRatio = Math.max(0.52, Math.min(2.10, photoRatio * (90.8 / 74)));
      /* Fit a ratio-aware frame inside a fixed stage; landscape and portrait selections reshape the frame. */
      const maxFrameWidth = window.matchMedia("(max-width: 760px)").matches ? 315 : 420;
      const maxFrameHeight = window.matchMedia("(max-width: 760px)").matches ? 270 : 365;
      let frameWidth = Math.min(maxFrameWidth, maxFrameHeight * frameRatio);
      let frameHeight = frameWidth / frameRatio;
      if (frameHeight > maxFrameHeight) {
        frameHeight = maxFrameHeight;
        frameWidth = frameHeight * frameRatio;
      }
      detailMainImage.style.setProperty("--frame-aspect", String(frameRatio));
      detailMainImage.style.setProperty("--photo-ratio", String(photoRatio));
      detailMainImage.style.setProperty("--frame-width", frameWidth + "px");
      detailMainImage.style.setProperty("--frame-height", frameHeight + "px");
      detailMainImage.style.width = frameWidth + "px";
      detailMainImage.style.height = frameHeight + "px";
      detailMainImage.style.minHeight = frameHeight + "px";
      detailMainImage.style.maxHeight = frameHeight + "px";
      detailMainImage.style.flexBasis = frameHeight + "px";
      detailMainImage.dataset.photoOrientation = photoRatio < 0.88 ? "portrait" : photoRatio > 1.12 ? "landscape" : "square";
    };
    if (image.complete) applyRatio();
    else image.addEventListener("load", applyRatio, {once:true});
    image.addEventListener("error", () => detailMainImage.dataset.photoOrientation = "unknown", {once:true});
  }

  function openDetails(index) {
    if (!visibleFigures.length) return;
    selectedIndex = (index + visibleFigures.length) % visibleFigures.length;
    const item = visibleFigures[selectedIndex];
    const thumbs = item.thumbs || [];
    selectedImageUrl = item.image || "";
    detailPanel.setAttribute("aria-hidden","false");
    detailName.textContent = item.name || "Unnamed figure";
    setFramedMainImage(selectedImageUrl, item.name || "Unnamed figure");
    detailSpecs.innerHTML = [
      ["Manufacturer",item.manufacturer],["Toy Line",item.toy_line],["Model",item.series],
      ["Year Released",item.year],["Alternate Mode",item.alternate_mode],["Scale",item.scale],["Condition",item.condition]
    ].map(([label,value]) => '<div class="spec"><strong>'+label+'</strong><span>'+escapeHtml(value || "—")+'</span></div>').join("");
    detailThumbs.innerHTML = thumbs.map((src,i) => '<button type="button" class="detail-thumb'+(src===selectedImageUrl?" active":"")+'" data-image-index="'+i+'" aria-label="Show image '+(i+1)+'"><span class="detail-thumb-frame-wrap"><img class="detail-thumb-photo" src="'+escapeHtml(src)+'" alt="" loading="lazy"><img class="detail-thumb-frame" src="images/decorative%20elements/icon-frame-square_result.webp" alt="" aria-hidden="true"></span></button>').join("");
    detailThumbs.querySelectorAll("button").forEach(button => button.addEventListener("click",() => {
      selectedImageUrl = thumbs[Number(button.dataset.imageIndex)];
      setFramedMainImage(selectedImageUrl, item.name || "Unnamed figure");
      detailThumbs.querySelectorAll("button").forEach(b => b.classList.toggle("active",b===button));
    }));
    detailNotes.textContent = item.notes || "No collection notes have been added yet.";

    gallery.querySelectorAll(".card").forEach((card,i) => card.classList.toggle("selected",i===selectedIndex));
  }

  async function loadFigures() {
    if (typeof supabaseClient === "undefined") {
      gallery.innerHTML = '<div class="empty-state">The collection connection could not start. Please check supabase-config.js.</div>';
      collectionCount.textContent = "CONNECTION ERROR";
      return;
    }
    gallery.innerHTML = '<div class="empty-state">Connecting to the 3RD PARTY archive…</div>';
    try {
      const {data,error} = await supabaseClient.from("figures").select("*, figure_images(*)")
        .eq("category","3rd Party").eq("is_published",true).order("name",{ascending:true});
      if (error) throw error;
      figures = (data||[]).map(item => {
        const imageRecords = (item.figure_images||[]).slice().sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
        const profileRecord = imageRecords.find(image=>image.image_type==="main") || imageRecords[0];
        const images = imageRecords.map(image=>publicImageUrl(image.storage_path)).filter(Boolean);
        return {...item,image:profileRecord?publicImageUrl(profileRecord.storage_path):"",thumbs:images};
      });
      collectionCount.textContent = figures.length + " PUBLISHED UNITS";
      fillFilters();
      renderGallery();
      if (visibleFigures.length) openDetails(0);
      else gallery.innerHTML = '<div class="empty-state">No published 3RD PARTY figures were found in the archive.</div>';
    } catch(error) {
      console.error("Unable to load 3RD PARTY collection:",error);
      gallery.innerHTML = '<div class="empty-state">Unable to load the 3RD PARTY collection. Please try again later.</div>';
      collectionCount.textContent = "ARCHIVE UNAVAILABLE";
      resultCount.textContent = "0 FIGURES";
    }
  }
  [searchInput,seriesFilter,yearFilter,sortFilter].forEach(control => {
    control.addEventListener("input",renderGallery);
    control.addEventListener("change",renderGallery);
  });
  clearFilters.addEventListener("click",() => {
    searchInput.value="";seriesFilter.value="";yearFilter.value="";sortFilter.value="name-asc";
    renderGallery();
    if(visibleFigures.length) openDetails(0);
  });

  detailMainImage.addEventListener("click",() => {
    if(!selectedImageUrl) return;
    lightboxImage.src=selectedImageUrl;
    lightboxImage.alt=detailName.textContent || "Collection figure";
    imageLightbox.showModal();
  });
  closeImageLightbox.addEventListener("click",()=>imageLightbox.close());
  imageLightbox.addEventListener("click",event=>{if(event.target===imageLightbox)imageLightbox.close();});
  loadFigures();
})();