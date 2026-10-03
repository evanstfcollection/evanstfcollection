const buttons=document.querySelectorAll("[data-theme]");
buttons.forEach(button=>{
  button.addEventListener("click",()=>{
    document.body.dataset.theme=button.dataset.theme;
    buttons.forEach(b=>b.classList.toggle("active",b===button));
  });
});
document.querySelector('[data-theme="neutral"]').classList.add("active");

function publicImageUrl(path){
  return path ? supabaseClient.storage.from("tf-collection").getPublicUrl(path).data.publicUrl : "";
}

function setFigureImage(container, src, alt){
  if(!container) return;
  container.innerHTML = src
    ? '<img src="'+src.replaceAll('"','&quot;')+'" alt="'+alt.replaceAll('"','&quot;')+'">'
    : '<span>NO IMAGE</span>';
}

async function loadSandboxFigure(){
  const {data,error}=await supabaseClient
    .from("figures")
    .select("*, figure_images(*)")
    .eq("id","1efbfdb6-0e1d-422d-be98-ba9a30907ed9")
    .eq("is_published",true)
    .single();

  if(error || !data){
    console.error("Sandbox figure load failed:",error);
    document.querySelectorAll("[data-figure-image]").forEach(el=>el.innerHTML="<span>FIGURE UNAVAILABLE</span>");
    return;
  }

  const images=(data.figure_images||[]).sort((a,b)=>a.sort_order-b.sort_order);
  const main=images.find(image=>image.image_type==="main")||images[0];
  const src=main ? publicImageUrl(main.storage_path) : "";
  const name=data.name||"FIGURE";

  document.querySelectorAll("[data-figure-image]").forEach(el=>setFigureImage(el,src,name));
  const nameCard=document.querySelector("[data-figure-name]");
  const nameDetail=document.querySelector("[data-detail-name]");
  if(nameCard) nameCard.textContent=name;
  if(nameDetail) nameDetail.textContent=name;

  ["manufacturer","toy_line","series","movie_reference","alternate_mode","scale"].forEach(key=>{
    const el=document.querySelector('[data-spec="'+key+'"]');
    if(el) el.textContent=data[key]||"—";
  });

  document.body.dataset.theme="decepticons";
  buttons.forEach(b=>b.classList.toggle("active",b.dataset.theme==="decepticons"));
}
loadSandboxFigure();