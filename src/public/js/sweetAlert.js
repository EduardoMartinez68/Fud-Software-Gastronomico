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


/////////////////////////////////cart//////////////////////////////////////////////

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

async function show_message_buy_car(title,customer,total,typeOfCurrency) {
    var containerHtml=`
        <style>
            table {
            border-collapse: collapse;
            width: 100%;
            }

            th, td {
            padding: 8px;
            text-align: left;
            }

            tr {
            margin-bottom: 1rem; /* Agrega espacio entre las filas */
            }
        </style>
        
        <br>
        <label><i class="fi fi-sr-user"></i>${customer}</label><br>
        <h5 class="title-company">${title}</h5>
        <h1>$${total}<h1>
        <hr>
        <table border="1">
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
                <label>💵 Cash</label><br>
                <div class="input-group mb-3">
                    <input id="money" type="text" class="form-control" placeholder="$0.00">

                    <select class="form-select" aria-label="Default select ${typeOfCurrency}">
                        <option value="MXN">$MXN 🇲🇽</option>
                        <option value="USA">$USD 🇺🇸</option>
                    </select>
                </div>
            </td>
            <td>
                <label>💳 Debit Card</label><br>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" aria-label="Amount (to the nearest dollar)" placeholder="$0.00">

                    <select class="form-select" aria-label="Default select ${typeOfCurrency}">
                        <option value="MXN">$MXN 🇲🇽</option>
                        <option value="USA">$USD 🇺🇸</option>
                    </select>
                </div>
            </td>
          </tr>
          <tr>
            <td>
                <label>💳 Credit Card</label><br>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" aria-label="Amount (to the nearest dollar)" placeholder="$0.00">

                    <select class="form-select" aria-label="Default select ${typeOfCurrency}">
                        <option value="MXN">$MXN 🇲🇽</option>
                        <option value="USA">$USD 🇺🇸</option>
                    </select>
                </div>
            </td>
            <td>
                <label>📑 Cheque</label><br>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" aria-label="Amount (to the nearest dollar)" placeholder="$0.00">

                    <select class="form-select" aria-label="Default select ${typeOfCurrency}">
                        <option value="MXN">$MXN 🇲🇽</option>
                        <option value="USA">$USD 🇺🇸</option>
                    </select>
                </div>
            </td>
          </tr>
          <tr>
            <td>
                <label>🏷️ Points</label><br>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" aria-label="Amount (to the nearest dollar)" placeholder="$0.00">
                </div>
            </td>
          </tr>
        </tbody>
      </table>

        <div class="form-group">
            <label for="exampleFormControlTextarea1">Comment</label>
            <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea placeholder="Comment">
        </div>
    `
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: '',
            html:containerHtml,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Buy',
            cancelButtonText: 'Exit',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const cant = Swal.getPopup().querySelector('#money').value;
                const data = [cant];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}