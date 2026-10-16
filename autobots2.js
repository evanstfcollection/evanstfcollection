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
  const detailCounter = $("detailCounter");
  const previousFigure = $("previousFigure");
  const nextFigure = $("nextFigure");
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
      if (mode === "manufacturer") return String(a.manufacturer||"").localeCompare(String(b.manufacturer||"")) || String(a.name||"").localeCompare(String(b.name||""));
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
      detailCounter.textContent = "—";
      return;
    }
    gallery.innerHTML = visibleFigures.map((item,index) => `
      <article class="card${index === selectedIndex ? " selected" : ""}" data-index="${index}" tabindex="0" role="button" aria-label="View ${escapeHtml(item.name)}">
        <div class="card-image-wrap">${item.image ? `<img class="card-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.opacity='0.15'">` : '<span class="image-placeholder">IMAGE<br>UNAVAILABLE</span>'}</div>
        <div class="card-body"><h4>${escapeHtml(item.name || "Unnamed figure")}</h4>
          <p class="card-meta">${escapeHtml(item.manufacturer || "Manufacturer not listed")}</p>
          <p class="card-meta">${escapeHtml(item.toy_line || item.series || "Series not listed")}</p>
          <div class="card-link">VIEW PROFILE &nbsp; →</div>
        </div>
      </article>`).join("");
    gallery.querySelectorAll(".card").forEach(card => {
      const open = () => openDetails(Number(card.dataset.index));
      card.addEventListener("click",open);
      card.addEventListener("keydown",event => { if(event.key==="Enter"||event.key===" "){event.preventDefault();open();} });
    });
  }
  function openDetails(index) {
    if (!visibleFigures.length) return;
    selectedIndex = (index + visibleFigures.length) % visibleFigures.length;
    const item = visibleFigures[selectedIndex];
    const thumbs = item.thumbs || [];
    selectedImageUrl = item.image || "";
    detailPanel.setAttribute("aria-hidden","false");
    detailName.textContent = item.name || "Unnamed figure";
    detailMainImage.innerHTML = selectedImageUrl
      ? '<img src="' + escapeHtml(selectedImageUrl) + '" alt="' + escapeHtml(item.name) + '">'
      : '<div class="image-placeholder">NO IMAGE<br><span>AVAILABLE FOR THIS FIGURE</span></div>';
    detailSpecs.innerHTML = [
      ["Manufacturer",item.manufacturer],["Toy Line",item.toy_line],["Series",item.series],
      ["Year Released",item.year],["Alternate Mode",item.alternate_mode],["Scale",item.scale],["Condition",item.condition]
    ].map(([label,value]) => '<div class="spec"><strong>'+label+'</strong><span>'+escapeHtml(value || "—")+'</span></div>').join("");
    detailThumbs.innerHTML = thumbs.map((src,i) => '<button type="button" class="'+(src===selectedImageUrl?"active":"")+'" data-image-index="'+i+'" aria-label="Show image '+(i+1)+'"><img src="'+escapeHtml(src)+'" alt="" loading="lazy"></button>').join("");
    detailThumbs.querySelectorAll("button").forEach(button => button.addEventListener("click",() => {
      selectedImageUrl = thumbs[Number(button.dataset.imageIndex)];
      detailMainImage.innerHTML = '<img src="'+escapeHtml(selectedImageUrl)+'" alt="'+escapeHtml(item.name)+'">';
      detailThumbs.querySelectorAll("button").forEach(b => b.classList.toggle("active",b===button));
    }));
    detailNotes.textContent = item.notes || "No collection notes have been added yet.";
    detailCounter.textContent = (selectedIndex+1) + " / " + visibleFigures.length;
    previousFigure.disabled = visibleFigures.length < 2;
    nextFigure.disabled = visibleFigures.length < 2;
    gallery.querySelectorAll(".card").forEach((card,i) => card.classList.toggle("selected",i===selectedIndex));
  }
  function moveSelection(direction) { if (visibleFigures.length) openDetails(selectedIndex+direction); }
  async function loadFigures() {
    if (typeof supabaseClient === "undefined") {
      gallery.innerHTML = '<div class="empty-state">The collection connection could not start. Please check supabase-config.js.</div>';
      collectionCount.textContent = "CONNECTION ERROR";
      return;
    }
    gallery.innerHTML = '<div class="empty-state">Connecting to the Autobots archive…</div>';
    try {
      const {data,error} = await supabaseClient.from("figures").select("*, figure_images(*)")
        .eq("category","Autobots").eq("is_published",true).order("name",{ascending:true});
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
      else gallery.innerHTML = '<div class="empty-state">No published Autobots figures were found in the archive.</div>';
    } catch(error) {
      console.error("Unable to load Autobots collection:",error);
      gallery.innerHTML = '<div class="empty-state">Unable to load the Autobots collection. Please try again later.</div>';
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
  previousFigure.addEventListener("click",()=>moveSelection(-1));
  nextFigure.addEventListener("click",()=>moveSelection(1));
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