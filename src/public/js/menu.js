const openMenu=document.querySelector("#open-menu-store");
const closeMenu=document.querySelector("#close-menu-store");
const aside=document.querySelector("aside");

openMenu.addEventListener("click",()=>{
    aside.classList.add("aside-visible");
});


closeMenu.addEventListener("click",()=>{
    aside.classList.remove("aside-visible");
});

console.log('ads');