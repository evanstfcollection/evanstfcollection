const buttons=document.querySelectorAll("[data-theme]");
buttons.forEach(button=>{
  button.addEventListener("click",()=>{
    document.body.dataset.theme=button.dataset.theme;
    buttons.forEach(b=>b.classList.toggle("active",b===button));
  });
});
document.querySelector('[data-theme="neutral"]').classList.add("active");