const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
const closeMenu = document.querySelector('.close-menu');

menuToggle.addEventListener('click', () => {
    menu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    menu.classList.remove('active');
});