const themeButtons=document.querySelectorAll(".theme-switcher [data-theme]");
const navButtons=document.querySelectorAll(".cyber-nav-item[data-theme]");

function setSandboxTheme(theme){
  document.body.dataset.theme=theme;
  updateMenuBarImage(theme);
  themeButtons.forEach(b=>b.classList.toggle("active",b.dataset.theme===theme));
  navButtons.forEach(b=>b.classList.toggle("active",b.dataset.theme===theme));
}

themeButtons.forEach(button=>{
  button.addEventListener("click",()=>setSandboxTheme(button.dataset.theme));
});
navButtons.forEach(button=>{
  button.addEventListener("click",()=>setSandboxTheme(button.dataset.theme));
});

setSandboxTheme("decepticons");

const themeConfig={
  neutral:{category:null,title:"COLLECTION SYSTEM / 00",label:"TF COLLECTION"},
  autobots:{category:"Autobots",title:"COLLECTION SYSTEM / 01",label:"AUTOBOT COLLECTION"},
  decepticons:{category:"Decepticons",title:"COLLECTION SYSTEM / 02",label:"DECEPTICON COLLECTION"},
  masterpiece:{category:"Masterpiece Movie",title:"COLLECTION SYSTEM / 03",label:"MASTERPIECE MOVIE COLLECTION"},
  "third-party":{category:"3rd Party",title:"COLLECTION SYSTEM / 04",label:"3RD PARTY COLLECTION"},
  primes:{category:"The Primes",title:"COLLECTION SYSTEM / 05",label:"THE PRIMES"}
};
const initialTheme=new URLSearchParams(window.location.search).get("theme")||"decepticons";
const activeTheme=themeConfig[initialTheme]?initialTheme:"decepticons";
const DECEPTICON_CATEGORY=themeConfig[activeTheme].category;
const menuBarImages={
  neutral:"../images/contact-menubar-image.png",
  autobots:"../images/autobots-menubar-image.png",
  decepticons:"../images/decepticons-menubar-image.png",
  masterpiece:"../images/masterpiece-movie-menubar-image.png",
  "third-party":"../images/3rd-party-menubar-image.png",
  primes:"../images/the-primes-menubar-image.png"
};
function updateMenuBarImage(theme){
  const image=document.querySelector("[data-menu-bar-image]");
  if(image && menuBarImages[theme]) image.src=menuBarImages[theme];
}
let collection=[];
let selectedFigureId=null;

function publicImageUrl(path){
  return path ? supabaseClient.storage.from("tf-collection").getPublicUrl(path).data.publicUrl : "";
}
function esc(value){
  return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function imageList(figure){
  return (figure.figure_images||[]).slice().sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));
}
function mainImage(figure){
  const images=imageList(figure);
  return images.find(i=>i.image_type==="main")||images[0]||null;
}
function setFigureImage(container,src,alt){
  if(!container)return;
  container.innerHTML=src?'<img src="'+esc(src)+'" alt="'+esc(alt)+'">':'<span>NO IMAGE</span>';
}
function displayValue(value){
  return value===null||value===undefined||value===""?"—":value;
}

function renderSelectedFigure(figure){
  if(!figure)return;
  selectedFigureId=figure.id;
  const main=mainImage(figure);
  const src=main?publicImageUrl(main.storage_path):"";
  document.querySelectorAll("[data-figure-image]").forEach(el=>setFigureImage(el,src,figure.name));
  document.querySelector("[data-detail-name]").textContent=figure.name;

  ["manufacturer","toy_line","series","movie_reference","alternate_mode","scale","condition","year","notes"].forEach(key=>{
    const el=document.querySelector('[data-spec="'+key+'"]');
    if(el)el.textContent=displayValue(figure[key]);
  });

  const gallery=document.querySelector("[data-gallery]");
  const images=imageList(figure);
  gallery.innerHTML=images.map((image,index)=>{
    const url=publicImageUrl(image.storage_path);
    return '<button class="gallery-thumb'+(index===0?" active":"")+'" data-gallery-index="'+index+'" type="button"><img src="'+esc(url)+'" alt="'+esc(image.alt_text||figure.name+" image "+(index+1))+'"></button>';
  }).join("");
  gallery.querySelectorAll("[data-gallery-index]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const image=images[Number(btn.dataset.galleryIndex)];
      const url=publicImageUrl(image.storage_path);
      document.querySelectorAll("[data-figure-image]").forEach(el=>setFigureImage(el,url,figure.name));
      gallery.querySelectorAll(".gallery-thumb").forEach(b=>b.classList.toggle("active",b===btn));
    });
  });

  document.querySelectorAll(".collection-card").forEach(card=>{
    card.classList.toggle("selected",card.dataset.id===figure.id);
  });
}

function renderCollection(){
  const grid=document.querySelector("[data-collection-grid]");
  const count=document.querySelector("[data-count]");
  count.textContent=collection.length;
  grid.innerHTML=collection.map(figure=>{
    const image=mainImage(figure);
    const url=image?publicImageUrl(image.storage_path):"";
    return '<button type="button" class="collection-card'+(figure.id===selectedFigureId?" selected":"")+'" data-id="'+esc(figure.id)+'" data-manufacturer="'+esc(figure.manufacturer||"")+'" data-toy-line="'+esc(figure.toy_line||"")+'">'+
      '<span class="collection-card-image">'+(url?'<img src="'+esc(url)+'" alt="'+esc(figure.name)+'">':'<span>NO IMAGE</span>')+'</span>'+
      '<span class="collection-card-name">'+esc(figure.name)+'</span>'+
      '<span class="collection-card-series">'+esc(figure.series||"N/A")+'</span>'+
    '</button>';
  }).join("");
  grid.querySelectorAll(".collection-card").forEach(card=>{
    card.addEventListener("click",()=>{
      const figure=collection.find(item=>item.id===card.dataset.id);
      renderSelectedFigure(figure);
      document.querySelector(".detail-panel").scrollIntoView({behavior:"smooth",block:"start"});
    });
  });
}

function applyFilter(filter){
  document.querySelectorAll(".filter-button").forEach(btn=>btn.classList.toggle("active",btn.dataset.filter===filter));
  document.querySelectorAll(".collection-card").forEach(card=>{
    const show=filter==="all"||card.dataset.toyLine===filter||card.dataset.manufacturer===filter;
    card.hidden=!show;
  });
}

async function loadSandboxCollection(){
  setSandboxTheme(activeTheme);
  const config=themeConfig[activeTheme];
  const query=supabaseClient
    .from("figures")
    .select("*, figure_images(*)")
    .eq("is_published",true);
  const {data,error}=config.category
    ? await query.eq("category",config.category).order("sort_order",{ascending:true}).order("name",{ascending:true})
    : await query.order("category",{ascending:true}).order("sort_order",{ascending:true}).order("name",{ascending:true})
    .eq("is_published",true)
    .order("sort_order",{ascending:true})
    .order("name",{ascending:true});

  if(error||!data){
    console.error("Sandbox collection load failed:",error);
    document.querySelector("[data-collection-grid]").innerHTML='<div class="collection-error">COLLECTION UNAVAILABLE</div>';
    return;
  }

  collection=data;
  document.body.dataset.theme=activeTheme;
  themeButtons.forEach(b=>b.classList.toggle("active",b.dataset.theme===activeTheme));
  navButtons.forEach(b=>b.classList.toggle("active",b.dataset.theme===activeTheme));
  const headerTitle=document.querySelector("[data-collection-title]");
  if(headerTitle) headerTitle.textContent=themeConfig[activeTheme].label;

  renderCollection();
  renderSelectedFigure(collection.find(f=>f.name==="Blitzwing")||collection[0]);
}

document.querySelectorAll(".filter-button").forEach(button=>{
  button.addEventListener("click",()=>applyFilter(button.dataset.filter));
});
loadSandboxCollection();