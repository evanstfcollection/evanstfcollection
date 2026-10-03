const buttons=document.querySelectorAll("[data-theme]");
buttons.forEach(button=>{
  button.addEventListener("click",()=>{
    document.body.dataset.theme=button.dataset.theme;
    buttons.forEach(b=>b.classList.toggle("active",b===button));
  });
});
document.querySelector('[data-theme="neutral"]').classList.add("active");

const DECEPTICON_CATEGORY="Decepticons";
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
  document.querySelector("[data-figure-name]").textContent=figure.name;
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
  const {data,error}=await supabaseClient
    .from("figures")
    .select("*, figure_images(*)")
    .eq("category",DECEPTICON_CATEGORY)
    .eq("is_published",true)
    .order("sort_order",{ascending:true})
    .order("name",{ascending:true});

  if(error||!data){
    console.error("Sandbox collection load failed:",error);
    document.querySelector("[data-collection-grid]").innerHTML='<div class="collection-error">COLLECTION UNAVAILABLE</div>';
    return;
  }

  collection=data;
  document.body.dataset.theme="decepticons";
  buttons.forEach(b=>b.classList.toggle("active",b.dataset.theme==="decepticons"));
  renderCollection();
  renderSelectedFigure(collection.find(f=>f.name==="Blitzwing")||collection[0]);
}

document.querySelectorAll(".filter-button").forEach(button=>{
  button.addEventListener("click",()=>applyFilter(button.dataset.filter));
});
loadSandboxCollection();