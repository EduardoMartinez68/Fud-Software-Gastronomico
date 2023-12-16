//const Swal = require('sweetalert');
function regularMessage(title,text){
    Swal.fire({
        title:title,
        text: text,
        customClass:{
            confirmButton:"btn-confirm-message",
            cancelButton:"btn-cancel-message"
        }
    });


}

function confirmationMessage(title,text){
    Swal.fire({
        title:title,
        text: text,
        icon:'success'
    });
}

function errorMessage(title,text){
    Swal.fire({
        title:title,
        text: text,
        icon:'error'
    });
}

async function questionMessage(title, text) {
    return new Promise((resolve) => {
        Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonText: 'Cancel',
            cancelButtonColor: 'rgb(220, 53, 69)',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed){
                // User clicked the "Confirm" button
                resolve(true);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked the "Cancel" button
                resolve(false);
            }
        });
    });
}

async function new_data_departments(title) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Name">' +
                '<br> <input id="swal-input2" class="swal2-input" placeholder="Description">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#swal-input1').value;
                const description = Swal.getPopup().querySelector('#swal-input2').value;
                const data = [name, description];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}

async function edit_data_departments(title,name,description) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Name" value="' + name + '">' +
                '<br> <input id="swal-input2" class="swal2-input" placeholder="Description" value="' + description + '">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#swal-input1').value;
                const description = Swal.getPopup().querySelector('#swal-input2').value;
                const data = [name, description];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}



function warningMessage(title,text){
    Swal.fire({
        title:title,
        text: text,
        icon:'warning'
    });
}

function infoMessage(title,text){
    Swal.fire({
        title:title,
        text: text,
        icon:'info'
    });
}

function notificationMessage(title,text){
    Swal.fire({
        title:title,
        text: text,
        position: 'top-end',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        icon:'success'
    });
}

function notificationMessageError(title,text){
    Swal.fire({
        title:title,
        text: text,
        position: 'top-end',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        icon:'error'
    });
}

function discount_message(title,text){
    Swal.fire({
        title:title,
        text: text,
    
        input:'text',
        inputPlaceholder:'Discount',
        inputValue:'',
        confirmButtonColor: 'rgb(204,3,40)',
    })
}

async function edit_cant_car(title,cant) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Cant." value="' + cant + '">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const cant = Swal.getPopup().querySelector('#swal-input1').value;
                const data = [cant];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}

/* mensaje pedir informacion
Swal.fire({
    title:"Welcome!",
    text: "I would like that you be a kawaii girl",

    input:'text',
    inputPlaceholder:'Product Name',
    inputValue:''
})*/