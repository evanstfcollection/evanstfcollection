const U="https://owshushczghacpdyvqkt.supabase.co",K="sb_publishable_3Z-pw2JX5ojxPLKBrbEYdg_AP1tYdTO",B="tf-collection",db=supabase.createClient(U,K),$=x=>document.getElementById(x);let fig=null,imgs=[],figs=[];
const S=(x,t,c="")=>{$(x).textContent=t||"";$(x).className="status"+(c?" "+c:"")},url=p=>db.storage.from(B).getPublicUrl(p).data.publicUrl,slug=s=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
async function start(){let{data}=await db.auth.getSession();$("login").hidden=!!data.session;$("editor").hidden=!data.session;if(data.session)load()}$("loginBtn").onclick=async()=>{S("loginStatus","Signing in...");let{error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error)S("loginStatus",error.message,"error");else start()};$("logoutBtn").onclick=async()=>{await db.auth.signOut();reset();start()};$("newFigureBtn").onclick=reset;$("cancelEditBtn").onclick=reset;
$("filterCategory").onchange=list;
$("searchProfiles").oninput=list;
$("expandAllBtn").onclick=()=>document.querySelectorAll(".category-group").forEach(g=>g.classList.add("open"));
$("collapseAllBtn").onclick=()=>document.querySelectorAll(".category-group").forEach(g=>g.classList.remove("open"));
function reset(){$("form").reset();fig=null;imgs=[];$("published").checked=true;$("editorTitle").textContent="ADD FIGURE";$("save").textContent="SAVE PROFILE";$("cancelEditBtn").hidden=true;$("imageManager").hidden=true;$("newUpload").hidden=false;$("imageGrid").innerHTML=""}
async function load(){let{data,error}=await db.from("figures").select("*").order("category").order("sort_order").order("name");if(error)return S("listStatus",error.message,"error");figs=data||[];let ids=figs.map(x=>x.id);if(ids.length){let r=await db.from("figure_images").select("figure_id,storage_path,image_type,sort_order").in("figure_id",ids).order("sort_order");let m={};(r.data||[]).forEach(i=>(m[i.figure_id]??=[]).push(i));figs.forEach(x=>x.im=m[x.id]||[])}list()}
function list(){
let f=$("filterCategory").value,q=$("searchProfiles").value.trim().toLowerCase(),l=$("figureList");
let a=figs.filter(x=>{
  if(f&&x.category!==f)return false;
  if(!q)return true;
  return [x.name,x.category,x.manufacturer,x.toy_line,x.series,x.movie_reference,x.alternate_mode,x.scale,x.condition,x.notes]
    .some(v=>String(v??"").toLowerCase().includes(q));
});
if(!a.length){l.innerHTML='<p class="subtext">No profiles match your search.</p>';return}
const order=["Autobots","Decepticons","Masterpiece Movie","3rd Party","The Primes"];
let groups=order.map(cat=>[cat,a.filter(x=>x.category===cat)]).filter(([,items])=>items.length);
l.innerHTML=groups.map(([cat,items])=>{
  let open=q?" open":"";
  return '<section class="category-group'+open+'" data-category="'+esc(cat)+'">'+
    '<button class="category-header" type="button" aria-expanded="'+(q?"true":"false")+'">'+
      '<span class="category-title"><span class="category-arrow">+</span><span>'+esc(cat)+'</span></span>'+
      '<span class="category-count">'+items.length+' '+(items.length===1?"PROFILE":"PROFILES")+'</span>'+
    '</button>'+
    '<div class="category-items">'+
      items.map(x=>{
        let p=x.im.find(i=>i.image_type==="main")||x.im[0];
        return '<article class="figure-row">'+
          (p?'<img src="'+url(p.storage_path)+'">':'<div class="figure-placeholder">NO IMAGE</div>')+
          '<div class="figure-info"><strong>'+esc(x.name)+'</strong><span>'+esc(x.category)+' · '+x.im.length+' images · <span class="'+(x.is_published?"published":"unpublished")+'">'+(x.is_published?"PUBLISHED":"HIDDEN")+'</span></span></div>'+
          '<div class="figure-actions"><button data-e="'+x.id+'">EDIT</button></div>'+
        '</article>';
      }).join("")+
    '</div></section>';
}).join("");
l.querySelectorAll(".category-header").forEach(b=>b.onclick=()=>{
  let g=b.closest(".category-group"),isOpen=g.classList.toggle("open");
  b.setAttribute("aria-expanded",isOpen);
});
l.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>edit(b.dataset.e));
}
async function edit(id){fig=figs.find(x=>x.id===id);let r=await db.from("figure_images").select("*").eq("figure_id",id).order("sort_order");if(r.error)return S("listStatus",r.error.message,"error");imgs=r.data||[];let flds=[["category",fig.category],["name",fig.name],["manufacturer",fig.manufacturer],["toyLine",fig.toy_line],["series",fig.series],["movieReference",fig.movie_reference],["year",fig.year],["alternate",fig.alternate_mode],["scale",fig.scale],["condition",fig.condition],["notes",fig.notes]];flds.forEach(([id,v])=>$(id).value=v??"");$("published").checked=!!fig.is_published;$("editorTitle").textContent="EDIT FIGURE";$("save").textContent="SAVE PROFILE CHANGES";$("cancelEditBtn").hidden=false;$("imageManager").hidden=false;$("newUpload").hidden=true;draw()}
function draw(){let g=$("imageGrid");g.innerHTML=imgs.map(i=>'<article class="image-card '+(i.image_type==="main"?"profile":"")+'">'+(i.image_type==="main"?'<span class="profile-badge">PROFILE IMAGE</span>':"")+'<img src="'+url(i.storage_path)+'"><div class="image-card-meta"><span>IMAGE '+(i.sort_order+1)+'</span><span>'+(i.image_type==="main"?"PROFILE":"GALLERY")+'</span></div><div class="image-card-actions">'+(i.image_type==="main"?'<button disabled>PROFILE IMAGE</button>':'<button data-p="'+i.id+'">SET AS PROFILE</button>')+'<button class="danger" data-r="'+i.id+'">REMOVE IMAGE</button></div></article>').join("");g.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>profile(b.dataset.p));g.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>remove(b.dataset.r))}
async function profile(id){await db.from("figure_images").update({image_type:"gallery"}).eq("figure_id",fig.id);let r=await db.from("figure_images").update({image_type:"main"}).eq("id",id);if(r.error)S("imageStatus",r.error.message,"error");else{S("imageStatus","Profile image updated.","success");edit(fig.id)}}
async function remove(id){let i=imgs.find(x=>x.id===id);if(!i||!confirm("Remove this image from the figure?"))return;let r=await db.storage.from(B).remove([i.storage_path]);if(r.error)return S("imageStatus",r.error.message,"error");r=await db.from("figure_images").delete().eq("id",id);if(r.error)return S("imageStatus",r.error.message,"error");let left=imgs.filter(x=>x.id!==id);if(i.image_type==="main"&&left[0])await db.from("figure_images").update({image_type:"main"}).eq("id",left[0].id);for(let n=0;n<left.length;n++)await db.from("figure_images").update({sort_order:n}).eq("id",left[n].id);S("imageStatus","Image removed.","success");edit(fig.id)}
$("additionalImages").onchange=async e=>{if(!fig)return;let files=[...e.target.files],rows=[];for(let i=0;i<files.length;i++){let f=files[i],ext=f.name.match(/\.[^.]+$/)?.[0]||"",p=fig.id+"/"+String(imgs.length+i+1).padStart(2,"0")+"-"+slug(f.name.replace(/\.[^.]+$/,""))+ext,r=await db.storage.from(B).upload(p,f,{contentType:f.type});if(r.error)return S("imageStatus",r.error.message,"error");rows.push({figure_id:fig.id,storage_path:p,image_type:"gallery",sort_order:imgs.length+i,alt_text:fig.name+" image "+(imgs.length+i+1)})}let r=await db.from("figure_images").insert(rows);if(r.error)return S("imageStatus",r.error.message,"error");e.target.value="";S("imageStatus","Images added.","success");edit(fig.id)};
$("form").onsubmit=async e=>{e.preventDefault();let row={category:$("category").value,name:$("name").value.trim(),manufacturer:$("manufacturer").value.trim()||null,toy_line:$("toyLine").value.trim()||null,series:$("series").value.trim()||null,year:Number($("year").value)||null,movie_reference:$("movieReference").value||null,alternate_mode:$("alternate").value.trim()||null,scale:$("scale").value.trim()||null,condition:$("condition").value.trim()||null,notes:$("notes").value.trim()||null,is_published:$("published").checked};S("saveStatus","Saving...");if(!fig){let files=[...$("images").files];if(!files.length)return S("saveStatus","Choose at least one image.","error");let r=await db.from("figures").insert(row).select().single();if(r.error)return S("saveStatus",r.error.message,"error");let rows=[];for(let i=0;i<files.length;i++){let f=files[i],ext=f.name.match(/\.[^.]+$/)?.[0]||"",p=r.data.id+"/"+String(i+1).padStart(2,"0")+"-"+slug(f.name.replace(/\.[^.]+$/,""))+ext,u=await db.storage.from(B).upload(p,f,{contentType:f.type});if(u.error)return S("saveStatus",u.error.message,"error");rows.push({figure_id:r.data.id,storage_path:p,image_type:i?"gallery":"main",sort_order:i,alt_text:r.data.name+" image "+(i+1)})}let ir=await db.from("figure_images").insert(rows);if(ir.error)return S("saveStatus",ir.error.message,"error");S("saveStatus",r.data.name+" added successfully.","success");await load();return edit(r.data.id)}let r=await db.from("figures").update(row).eq("id",fig.id);if(r.error)return S("saveStatus",r.error.message,"error");S("saveStatus",row.name+" updated successfully.","success");await load()};start();