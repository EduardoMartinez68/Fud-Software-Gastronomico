//add profile image 
const image=document.getElementById("imgEmployee"),
input=document.getElementById('inputImg');
input.addEventListener('change',()=>{
    image.src = URL.createObjectURL(input.files[0]);
});

