const color_company='#0A74CC'//'rgb(204,3,40)' rgb(255,0,42);
const color_hover='#004080;'
const color_session1='#0A74CC';
const color_session2='#0A74CC';

///
function set_color_company(rgb){
    return color_company=rgb;
}

function set_hover(rgb){
    return color_hover=rgb;;
}

function get_session1(rgb){
    return color_session1=rgb;;
}

function set_session2(rgb){
    return color_session2=rgb;;
}
////
function get_color_company(){
    return color_company;
}

function get_hover(){
    return color_hover;
}

function get_session1(){
    return color_session1;
}

function get_session2(){
    return color_session2;
}
//get the reference about the element <link> of the css files
const elementLink = document.querySelector('link[href="/css/Styles.css"]');

// we will watch if the be elementLink
if (elementLink) {
    //get the styleSheet object of the <link> for modify 
    const styleSheet = elementLink.sheet;

    // change the style of the root:{}
    styleSheet.cssRules[0].style.setProperty('--color-company', get_color_company());
    styleSheet.cssRules[0].style.setProperty('--color-hover', get_color_company());
    styleSheet.cssRules[0].style.setProperty('--color-session1', get_color_company());
    styleSheet.cssRules[0].style.setProperty('--color-session2', get_color_company());
}
else{
    console.log('style file not found');
}