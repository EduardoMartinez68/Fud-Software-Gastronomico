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

/////////////////////////////////combo//////////////////////////////////////////////

async function edit_cant_combo(title,cant) {
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

/////////////////////////////////supplies//////////////////////////////////////////////
async function edit_supplies_company(title,img,barcode,name,description,use_inventory) {
    var containerHtml = `
        <div class="form-group">
            <center>
                <img src="/img/uploads/${img}" class="img-from-supplies_products" id="imgEmployee">
            </center>
        </div>
        <div class="form-group">
            <input type="file" name="image" accept="image/*" class="form-control" id="inputImg">
        </div>        

        <input id="barcode" class="swal2-input" placeholder="Barcode" value="${barcode}"><br>
        <input id="name" class="swal2-input" placeholder="Name" value="${name}"><br>
        <input id="description" class="swal2-input" placeholder="Description" value="${description}"><br>

        <input class="form-check-input" type="checkbox" id="invalidCheck2" name="inventory" ${use_inventory=='true' ? 'checked' : ''}>
        <label class="form-check-label" for="invalidCheck2">
            Use inventory
        </label>
    `;


    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html: containerHtml,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const image = Swal.getPopup().querySelector('#inputImg').value;
                const barcode = Swal.getPopup().querySelector('#barcode').value;
                const name = Swal.getPopup().querySelector('#name').value;
                const description = Swal.getPopup().querySelector('#description').value;
                const use_inventory = Swal.getPopup().querySelector('#invalidCheck2').checked;
                const data = [image,barcode,name, description,use_inventory];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}
/*
                <select id="unidad_medida" name="unidad_medida" class="form-select">
                    <option value="g">Gramos (g)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="l">Litros (l)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="u">Unidades (u)</option>
                </select>
 */
async function edit_supplies_branch(title,img,barcode,name,existence,purchase_amount) {
    var containerHtml = `
        <div class="form-group">
            <center>
                <img src="/img/uploads/${img}" class="img-from-supplies_products" id="imgEmployee"><br>
                <label>${barcode}</label><br>
            </center>
        </div>  
        <br><br>
        <label>Current existence: ${existence} ${purchase_amount}</label>
        <hr>
        <div class="row">
            <label>Existence</label>
            <br><br>
            <div class="col">
                <input id="existence" class="form-control" placeholder="Existence" value="${existence}">
            </div>
            <div class="col">
                <input id="type" class="form-control" placeholder="Existence" value="${purchase_amount}" readonly>
            </div>
        </div>
        <br><br>
    `;


    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html: containerHtml,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const image = Swal.getPopup().querySelector('#existence').value;
                const data = [image];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
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

async function edit_client_car(email){
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Select the client for this buy',
            html:
            `
            <label>Escribe el email de el usuario</label>
            <input id="email" type="text" class="form-control" placeholder="write the email of the client" value=${email}>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'search',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const emailInput = Swal.getPopup().querySelector('#email').value;
                const data = [emailInput];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}

async function edit_price_car(title,price1,price2,price3){
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html:
            `<select id="price_select" class="form-select form-select-lg mb-3">'
                '<option value=${price1}>${price1}</option>'
                '<option value=${price2}>${price2}</option>'
                '<option value=${price3}>${price3}</option>'
            '</select>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const price = Swal.getPopup().querySelector('#price_select').value;
                const data = [price];
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
