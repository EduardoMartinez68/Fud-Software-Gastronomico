//const Swal = require('sweetalert');
function regularMessage(title, text) {
    Swal.fire({
        title: title,
        text: text,
        customClass: {
            confirmButton: "btn-confirm-message",
            cancelButton: "btn-cancel-message"
        }
    });
}

function confirmationMessage(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success'
    });
}

function errorMessage(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error'
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
            if (result.isConfirmed) {
                // User clicked the "Confirm" button
                resolve(true);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked the "Cancel" button
                resolve(false);
            }
        });
    });
}

async function informationMessage() {
    Swal.bindClickHandler();
    Swal.mixin({
        toast: true
    }).bindClickHandler("data-swal-toast-template");
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

async function edit_data_departments(title, name, description) {
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

function warningMessage(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'warning'
    });
}

function infoMessage(title, text) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'info'
    });
}

function notificationMessage(title, text) {
    Swal.fire({
        title: title,
        text: text,
        position: 'top-end',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        icon: 'success'
    });
}

function notificationMessageError(title, text) {
    Swal.fire({
        title: title,
        text: text,
        position: 'top-end',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        icon: 'error'
    });
}

function discount_message(title, text) {
    Swal.fire({
        title: title,
        text: text,

        input: 'text',
        inputPlaceholder: 'Discount',
        inputValue: '',
        confirmButtonColor: 'rgb(204,3,40)',
    })
}

/////////////////////////////////combo//////////////////////////////////////////////

async function edit_cant_combo(title, cant) {
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
async function edit_supplies_company(title, id, id_company, img, barcode, name, description, use_inventory) {
    var containerHtml = `
        <style>
            .save-button {
                background-color: rgb(25, 135, 84); /* Color de fondo */
                color: white; /* Color del texto */
                padding: 10px 20px; /* Espaciado interno */
                border: none; /* Sin borde */
                border-radius: 5px; /* Bordes redondeados */
                cursor: pointer; /* Cursor al pasar */
                transition: background-color 0.3s; /* Transición suave */
            }
            
            .save-button:hover {
                background-color: #45a049; /* Color de fondo al pasar */
            }
        </style>
        <form action="/fud/${id_company}/${id}/edit-supplies-form" method="post" enctype="multipart/form-data">
            <div class="form-group">
                <center>
                    <img src="${img}" class="img-from-supplies_products" id="imgId">
                </center>
            </div>
            <div class="form-group">
                <label for="inputImg2" class="custom-file-upload">
                    <input type="file" name="image" accept="image/*" id="inputImg2" style="display: none;" onchange="previewImage2(event)">
                    <i class="fas fa-upload"></i> Subir imagen
                </label>
            </div>        

            <input id="barcode" class="swal2-input" placeholder="Barcode" value="${barcode}" name="barcode"><br>
            <input id="name" class="swal2-input" placeholder="Nombre" value="${name}" name="name"><br>
            <input id="description" class="swal2-input" placeholder="Descripcion" value="${description}" name="description"><br>

            <input class="form-check-input" type="checkbox" id="invalidCheck2" name="inventory" ${use_inventory == 'true' ? 'checked' : ''}>
            <label class="form-check-label" for="invalidCheck2">
            Usar inventario
            </label>
            <br><br>
            <button class="save-button">Guardar</button>
        </form>
    `;
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: title,
            html: containerHtml,
            focusConfirm: false,
            confirmButtonText: 'Cancelar',
            confirmButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const data = [''];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
    /*
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
                const image = Swal.getPopup().querySelector('#inputImg2').files[0];;
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
    */
}

async function edit_supplies_branch(title, img, barcode, name, existence, purchase_amount) {
    var containerHtml = `
        <div class="form-group">
            <center>
                <img src="${img}" class="img-from-supplies_products" id="imgEmployee"><br>
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


///////////////////////////////box//////////////////////////////////////////////////
async function edit_box_message(number, ipPrinter) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Edit the box',
            html:
                `
            <img src="https://cdn-icons-png.flaticon.com/512/1198/1198290.png" class="img-message"><br>
            <div class="row">
                <div class="col-4">
                    <label for="exampleInputEmail1">Number of Box *</label>
                    <input type="number" class="form-control" id="number" aria-describedby="emailHelp" placeholder="Number..." min="0" name="number" required value=${number}>
                </div>
                <div class="col-6">
                    <label>Ip Printer</label>
                    <input type="text" class="form-control" id="ipPrinter" placeholder="Ip Printer..." name="ipPrinter" value=${ipPrinter}>
                </div>
                <br>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const number = Swal.getPopup().querySelector('#number').value;
                const ipPrinter = Swal.getPopup().querySelector('#ipPrinter').value;
                const data = [number, ipPrinter];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}
/////////////////////////////////cart//////////////////////////////////////////////

async function edit_cant_car(title, cant) {
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

async function edit_client_car(email) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Select the client for this buy',
            html:
                `
            <img src="https://cdn-icons-png.flaticon.com/512/8339/8339939.png" class="img-message"><br>
            <label>Escribe el email de el usuario</label>
            <input id="email" type="text" class="swal2-input" placeholder="write the email of the client" value=${email}>
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

async function edit_price_car(title, price1, price2, price3) {
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

async function show_message_buy_car(title, customer, total, typeOfCurrency) {
    var containerHtml = `
    <style>
        .container-buy {
        background-color: white;
        }

        .total-buy {
        font-size: 4rem;
        }

        .buy {
        font-size: 2rem;
        }

        .btn-store {
        background-color: white;
        color: #7E7E7F;
        font-size: 2rem;
        width: 25%;
        height: 100%;
        border-color: transparent;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-delete {
        font-size: 2rem;
        width: 25%;
        height: 100%;
        border-color: transparent;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
        }

        .btn-buy {
        border-radius: 5%;
        border-color: transparent;
        background-color: #5AB75D;
        color: white;
        width: 23%;
        height: 10%;
        font-size: 1rem;
        }

        .btn-cancel {
        color: red;
        border: 0;
        border-color: transparent;
        background-color: transparent;
        }

        .card-buy {
        background-color: #F1F4F5;
        }

        .pocketMoney {
        font-size: 1.5rem;
        }

        .swal2-popup {
        width: 80%; /* Ajusta el ancho del cuadro de contenido */
        height: 100%; /* Ajusta la altura del cuadro de contenido */
        }

        .input-buy {
        text-align: center;
        }

        .card-input {
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }

        .input-search-menu {
        border-radius: 15px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }

        @media screen and (max-width: 600px) {
        .total-buy {
            font-size: 1.7rem;
        }

        .swal2-popup {
            width: 80%; /* Ajusta el ancho del cuadro de contenido */
            height: 50%; /* Ajusta la altura del cuadro de contenido */
        }

        .btn-store {
            font-size: 1rem;
        }
        }

        .input-buy.selected {
        border: 2px solid #0D6EFD; /* Cambia el estilo para inputs seleccionados */
        box-shadow: 0 0 5px #0D6EFD;
        }
    </style>
    
    <div class="container mt-5 container-buy pc">
      <label><i class="fi fi-sr-user"></i>${customer}</label><br>
      <h5 class="title-company">${title}</h5>
      <div class="row justify-content-center">
        <div class="col-6">
          <div class="card card-buy">
            <div class="card-body">
                <div class="row">
                    <div class="col">
                      <button class="btn btn-primary btn-block btn-store" onclick="updateNumber(100)">$ 100</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="updateNumber(200)">$ 200</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="updateNumber(500)">$ 500</button>
                    </div>
                </div>
              <div class="row mt-4">
                <div class="col">
                  <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(1)">1</button>
                  <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(2)">2</button>
                  <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(3)">3</button>
                </div>
              </div>
              <div class="row mt-2">
                <div class="col">
                    <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(4)">4</button>
                    <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(5)">5</button>
                    <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(6)">6</button>
                  </div>
              </div>
              <div class="row mt-2">
                  <div class="col">
                      <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(7)">7</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(8)">8</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(9)">9</button>
                  </div>
              </div>
              <div class="row mt-2">
                <div class="col">
                    <button class="btn btn-primary btn-block  btn-store" onclick="agregarNumero('.')">.</button>
                    <button class="btn btn-primary btn-block  btn-store" onclick="agregarNumero(0)">0</button>
                    <button class="btn btn-danger btn-block  btn-delete" onclick="borrarNumero()"><i class="fi fi-rr-delete"></i></button>
                </div>
            </div>
            </div>
          </div>
        </div>
        <div class="col-6">
        <div class="row">
            <b><label for="" class="total-buy">TOTAL: $</label><label for="" class="total-buy" id="total">${total}</label></b>
        </div>
        <div class="row">
            <label for="" class="pocketMoney">Cambio: $</label><label for="" class="pocketMoney" id="pocketMoney">0.00</label>
        </div>
        <div class="row">
            <div class="">
            <center><label for="" class="pocketMoney"><i class="fi fi-sr-money-bill-wave"></i> Efectivo</label></center>
            <input type="text" class="form-control mb-3 buy input-buy selected" id="money" name="money" readonly placeholder="$0.00" onclick="selectInput(this)">
            </div>
        </div>
        <div class="row">
            <div class="col">
            <div class="">
                <center><label for="" class="pocketMoney"><i class="fi fi-sr-credit-card"></i> Tarjeta de Debito</label></center>
                <input type="text" class="form-control mb-3 buy input-buy" id="money-credit-debit" name="money-credit-debit" readonly placeholder="$0.00" onclick="selectInput(this)">
            </div>
            </div>
            <div class="col">
            <div class="">
                <center><label for="" class="pocketMoney"><i class="fi fi-sr-credit-card"></i> Tarjeta de Credito</label></center>
                <input type="text" class="form-control mb-3 buy input-buy" id="money-credit-card" name="money-credit-card" readonly placeholder="$0.00" onclick="selectInput(this)">
            </div>
            </div>
        </div>
        <div class="form-group">
            <div class="">
            <label for="exampleFormControlTextarea1">💬 Comentario</label>
            <textarea class="form-control" rows="3" name="comment" id="comment" placeholder="Comentario..."></textarea>
            </div>
        </div>
        <br><br>
        </div>
      </div>
    </div>




    <div class="container mt-5 container-buy cellphone">
      <label><i class="fi fi-sr-user"></i>${customer}</label><br>
      <h5 class="title-company">${title}</h5>
      <div class="row justify-content-center">
        <div class="col">
            <b><label for="" class="total-buy">TOTAL: $</label><label for="" class="total-buy" id="total-cellphone">${total}</label></b>
            <br>
            <label for="" class="pocketMoney">Cambio: $</label><label for="" class="pocketMoney" id="pocketMoney-cellphone">0.00</label>
            <input type="text" class="form-control mb-3 buy" id="money-cellphone" name="money-cellphone" readonly>
            <div class="form-group">
                <label for="exampleFormControlTextarea1">💬 Comentario</label>
                <textarea class="form-control" rows="3" name="comment-cellphone" id="comment-cellphone" placeholder="Comentario..."></textarea>
            </div>
            <br>
            <div class="card-body">
                <div class="row">
                    <div class="col">
                      <button class="btn btn-primary btn-block btn-store" onclick="updateNumber(100)">$ 100</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="updateNumber(200)">$ 200</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="updateNumber(500)">$ 500</button>
                    </div>
                </div>
              <div class="row mt-4">
                <div class="col">
                  <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(1)">1</button>
                  <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(2)">2</button>
                  <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(3)">3</button>
                </div>
              </div>
              <div class="row mt-2">
                <div class="col">
                    <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(4)">4</button>
                    <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(5)">5</button>
                    <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(6)">6</button>
                  </div>
              </div>
              <div class="row mt-2">
                  <div class="col">
                      <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(7)">7</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(8)">8</button>
                      <button class="btn btn-primary btn-block btn-store" onclick="agregarNumero(9)">9</button>
                  </div>
              </div>
              <div class="row mt-2">
                <div class="col">
                    <button class="btn btn-primary btn-block  btn-store" onclick="agregarNumero('.')">.</button>
                    <button class="btn btn-primary btn-block  btn-store" onclick="agregarNumero(0)">0</button>
                    <button class="btn btn-danger btn-block  btn-delete" onclick="borrarNumero()"><i class="fi fi-rr-delete"></i></button>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
    `;

    return new Promise((resolve, reject) => {
        Swal.fire({
            title: '',
            html: containerHtml,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '❤️ Pagar',
            cancelButtonText: 'Exit',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const cash = Swal.getPopup().querySelector('#money').value;
                const debitCard = Swal.getPopup().querySelector('#money-credit-debit').value;
                const creditCard = Swal.getPopup().querySelector('#money-credit-card').value;
                const comment = Swal.getPopup().querySelector('#comment').value;

                const cashCellphone = Swal.getPopup().querySelector('#money-cellphone').value;
                const debitCardCellphone = 0//Swal.getPopup().querySelector('#money-credit-debit').value;
                const creditCardCellphone = 0//Swal.getPopup().querySelector('#money-credit-card').value;
                const commentCellphone = Swal.getPopup().querySelector('#comment-cellphone').value;
                data = [cash, debitCard, creditCard, comment, cashCellphone, debitCardCellphone, creditCardCellphone, commentCellphone];

                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading(),
            customClass: {
                content: 'my-content-class'
            }
        });
    });
}

async function cash_movement_message() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Movimiento de caja',
            html:
                '<img src="https://cdn-icons-png.flaticon.com/512/6149/6149018.png" class="img-message">' +
                '<br> <label>Dinero ingresado o retirado *</label>' +
                '<input id="money" class="swal2-input" placeholder="Dinero que movere">' +
                '<br><br> <label>Motivo del movimiento de caja *</label>' +
                '<br> <textarea class="form-control" id="comment" rows="3" placeholder="Comentario"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const cash = Swal.getPopup().querySelector('#money').value;
                const comment = Swal.getPopup().querySelector('#comment').value;
                const data = [cash, comment];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}


////////////////////////pedidos
async function show_create_new_order(oldDataOrder) {
    var containerHtml = `
        <div class="container mt-5">
            <h1 class="text-center">Realiza Pedido a Domicilio🚚</h1>
            <hr>
            <form>
                <div class="form-group">
                    <label for="inputName">Nombre</label>
                    <input type="text" class="form-control" id="name" placeholder="Nombre" value='${oldDataOrder.name}'>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="inputName">Celular</label>
                            <input type="text" class="form-control" id="cellphone" placeholder="Celular" value=${oldDataOrder.cellphone}>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="inputPhone">Teléfono</label>
                            <input type="tel" class="form-control" id="phone" placeholder="Teléfono" value=${oldDataOrder.phone}>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="inputAddress">Dirección</label>
                    <input type="text" class="form-control" id="address" placeholder="Dirección" name="address" value=${oldDataOrder.address}>
                </div>
                <div class="form-group">
                    <label for="inputNotes">Notas adicionales</label>
                    <textarea class="form-control" id="comment" rows="3" placeholder="Notas adicionales" value=${oldDataOrder.comment}></textarea>
                </div>
            </form>
        </div>
    `;

    return new Promise((resolve, reject) => {
        Swal.fire({
            title: '',
            html: containerHtml,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar información',
            cancelButtonText: 'Borrar información',
            confirmButtonColor: '#0D6EFD',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const cellphone = Swal.getPopup().querySelector('#cellphone').value;
                const phone = Swal.getPopup().querySelector('#phone').value;
                const address = Swal.getPopup().querySelector('#address').value;
                const comment = Swal.getPopup().querySelector('#comment').value;
    
                const data = [name, cellphone, phone, address, comment];
    
                return data; // Esto se enviará a resolve(data)
            },
            allowOutsideClick: () => !Swal.isLoading(),
            customClass: {
                content: 'my-content-class'
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                resolve(null); // Usuario canceló, devolvemos null
            } else {
                resolve(result.value); // Usuario confirmó, devolvemos los datos
            }
        });
    });
}


function show_description_dish(nombre, descripcion, precio, imagen) {
    // Construir el mensaje con la información del platillo
    const mensaje = `
        <div>
            <img src="${imagen}" alt="${nombre}" style="width: 100%; max-height: 300px;">
            <h5>${nombre}</h5>
            <p>${descripcion}</p>
            <p>Precio: $${precio}</p>
        </div>
    `;

    // Llamar a la función infoMessage con el título y el mensaje
    infoDish('Información del Platillo', mensaje);
}

function infoDish(title, text) {
    Swal.fire({
        title: title,
        html: text, // Usar 'html' para permitir contenido HTML en el mensaje
    });
}

/////////////////////////////////suscription//////////////////////////////////////////////
async function get_id_subscription() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Delete, subscription 💔',
            html:
                `
            <img src="https://cdn-icons-png.flaticon.com/512/7406/7406952.png" class="img-message"><br><br>
            <label>Lamentamos que cancele la suscripcion y esperamos que su negocio se recupere pronto 🙌</label>
            <label>Escribe el ID de la suscripcion que deseas cancelar</label>
            <input id="idSubscription" type="text" class="swal2-input" placeholder="Escribe el ID de la suscripcion">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'search',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const emailInput = Swal.getPopup().querySelector('#idSubscription').value;
                const data = [emailInput];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}

async function get_name_branch() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Link branch 🤩',
            html:
                `
            <img src="https://cdn-icons-png.flaticon.com/512/2037/2037105.png" class="img-message"><br><br>
            <label>Escribe el nombre de la sucursal que deseas enlazar con esta suscripción</label>
            <input id="idSubscription" type="text" class="swal2-input" placeholder="Nombre sucursal">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'search',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const emailInput = Swal.getPopup().querySelector('#idSubscription').value;
                const data = [emailInput];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}