let numeroMostrado;
let totalId;
let pocketMoney;
let tabla;
if (window.innerWidth >= 768) { // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
    numeroMostrado = document.getElementById("money");
    totalId = document.getElementById('total');
    pocketMoney=document.getElementById('pocketMoney');
    tabla = document.getElementById("table-car-home");
} else {
    numeroMostrado = document.getElementById("money-cellphone");
    totalId = document.getElementById('total-cellphone');
    pocketMoney=document.getElementById('pocketMoney-cellphone');
    tabla = document.getElementById("table-car-home-cellphone");
}


function update_variable_car(){
    if (window.innerWidth >= 768) { // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
        numeroMostrado = document.getElementById("money");
        totalId = document.getElementById('total');
        pocketMoney=document.getElementById('pocketMoney');
        tabla = document.getElementById("table-car-home");
    } else {
        numeroMostrado = document.getElementById("money-cellphone");
        totalId = document.getElementById('total-cellphone');
        pocketMoney=document.getElementById('pocketMoney-cellphone');
        tabla = document.getElementById("table-car-home-cellphone");
    }    
}

//////--------------------------screen load
const loadingOverlay = document.getElementById("loadingOverlay");

async function delete_all_car(total,moneyReceived,exchange,comment) {
    // Show loading overlay
    loadingOverlay.style.display = "flex";

    const combos = get_all_combo(total,moneyReceived,exchange,comment);

    try {
        //get the email and the id of the customer 
        const button = document.getElementById('emailClient');
        const idClient = button.getAttribute('idClient');

        //we will watching if the server can complete the pay and setting the inventory
        const link = '/fud/' + idClient + '/car-post';
        const answerServer = await get_answer_server(combos,link);

        //we will see if save the commander 
        if (!isNaN(answerServer.message)) {
            //we will see if the user would like do a send to his house 
            var dataOrder = document.getElementById('customer-name').value;
            if (dataOrder !== "" && dataOrder !== null){ //we will see if exist information about the order 
                const idCommander=answerServer.message;
                const answerServerOrder=await get_answer_server_for_add_order(idCommander);
            }

            //if the server can do the pay we will to delete all the cart and send a message of success
            delete_all_fish();

            //restart the email of the customer
            button.innerHTML = '<i class="fi-icon fi-sr-following"></i> Client';
            button.setAttribute('idClient', null);

            //we will playing a effect sound 
            var sound = new Audio('/effect/buy.mp3');
            sound.play();

            var text = (exchange != 0) ? 'Tu Cambio es de ' + exchange + '💲' : 'Vuelve pronto 😄';
            confirmationMessage(text, 'Gracias por su compra ❤️'); //we will watching if exist exchange in the buy
        } else {
            //if the server not can complete the pay we going to send a message of error
            errorMessage('ERROR 👁️', answerServer.message + ' 👉👈');
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage('ERROR 👁️', 'Se produjo un error al procesar su solicitud.');
    } finally {
        // Hide loading overlay regardless of success or failure
        loadingOverlay.style.display = "none";
    }
}

async function get_answer_server(combos, link) {
    try {
        const url = link;

        // Configurar la solicitud
        const options = {
            method: 'POST', // Puedes usar POST en lugar de GET si necesitas enviar muchos datos
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(combos)
        };

        // Realizar la solicitud y esperar la respuesta
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }

        // Convertir la respuesta a JSON y devolverla
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function get_answer_server_for_add_order(idCommander) {
    try {
        const url = '/fud/add-order-post';
        var dataOrder=get_data_order()
        dataOrder.idCommander=idCommander;
        
        // Configurar la solicitud
        const options = {
            method: 'POST', // Puedes usar POST en lugar de GET si necesitas enviar muchos datos
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataOrder)
        };

        // Realizar la solicitud y esperar la respuesta
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }

        // Convertir la respuesta a JSON y devolverla
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

///////////
async function select_customer(idCompany) {
    const button = document.getElementById('emailClient');
    const emailClient = button.textContent;
    const client = await edit_client_car(emailClient); //we going to get the email of the customer 
    client.push(idCompany)

    var customerFound=false
    if (client != '') {
        loadingOverlay.style.display = "flex";
        const answer = await get_answer_server(client, '/fud/client');

        if (answer.idCustomer != null) {
            const idCustomer = answer.idCustomer
            const firstName = answer.firstName
            const lastName = answer.lastName
            const email = answer.email
            //update the name of the customer
            button.textContent = email;
            button.innerHTML = '<i class="fi-icon fi-sr-following"></i> ' + email;
            button.setAttribute('idClient', idCustomer);
            customerFound=true;
        } else {
            button.innerHTML = '<i class="fi-icon fi-sr-following"></i> Client';
            button.setAttribute('idClient', null);
        }
    } else {
        button.innerHTML = '<i class="fi-icon fi-sr-following"></i> Client';
        button.setAttribute('idClient', null);
    }
    loadingOverlay.style.display = "none";

    //show a message of that we not found to the customer
    if(!customerFound){
        errorMessage('UPS 😅', 'El cliente no fue encontrado. Por favor busque de nuevo');
    }
}

//----------------------
document.addEventListener("DOMContentLoaded", function() {
    var inputMoneyCellphone = document.getElementById("money-cellphone");

    // Verifica si el elemento fue encontrado
    if (inputMoneyCellphone) {
        // Agrega el event listener al input
        inputMoneyCellphone.addEventListener("input", function() {
            update_pocket_money();
        });
    } else {
        console.error("El elemento con id 'money-cellphone' no fue encontrado.");
    }
});

function updateNumber(number){
    var numeroMostrado;
    if (window.innerWidth >= 768) { // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
        numeroMostrado = document.getElementById("money");
    } else {
        numeroMostrado = document.getElementById("money-cellphone");
    }
    numeroMostrado.value = number;
    update_pocket_money()        
}

function agregarNumero(numero) {
    if (window.innerWidth >= 768) { // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
        numeroMostrado = document.getElementById("money");
        pocketMoney=document.getElementById('pocketMoney');
    } else {
        numeroMostrado = document.getElementById("money-cellphone");
        pocketMoney=document.getElementById('pocketMoney-cellphone');
    }  
    numeroMostrado.value += numero;
    update_pocket_money()
}

function update_pocket_money(){
    var numeroMostrado;
    var totalId;
    var pocketMoney=document.getElementById('pocketMoney-cellphone');

    if (window.innerWidth >= 768) { // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
        numeroMostrado = document.getElementById("money");
        totalId = document.getElementById('total');
        pocketMoney=document.getElementById('pocketMoney');
    } else {
        numeroMostrado = document.getElementById("money-cellphone");
        totalId = document.getElementById('total-cellphone');
        pocketMoney=document.getElementById('pocketMoney-cellphone');
    }
    var total = parseFloat(totalId.innerText);
    pocketMoney.innerText = parseFloat(numeroMostrado.value)-total;
}

function borrarNumero() {
    var numeroMostrado;
    var pocketMoney;
    if (window.innerWidth >= 768) { // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
        numeroMostrado = document.getElementById("money");
        pocketMoney=document.getElementById('pocketMoney');
    } else {
        numeroMostrado = document.getElementById("money-cellphone");
        pocketMoney=document.getElementById('pocketMoney-cellphone');
    }  
    numeroMostrado.value = numeroMostrado.value.slice(0, -1);
    if (numeroMostrado.value === '') {
        pocketMoney.innerText = '0.00';
    }else{
        update_pocket_money()
    }
}

///-------------------------------------------------------------this script is for add a combo to the car

//get the table for his id

function addFish(idProduct, product, price, price2, price3) {
    // get the body of the table
    var bodyTable = tabla.getElementsByTagName("tbody")[0];
    if (!this_product_exists_in_the_cart(bodyTable, product)) {
        add_new_product_to_the_car(bodyTable, idProduct, product, price, price, price2, price3);
    }
    
    //show a message of that we add the product to the car
    notificationMessage('❤️ '+product+' ❤️', 'El producto fue agregado con éxito 😁');
    update_total();
}

function add_new_product_to_the_car(bodyTable, idProduct, product, price, price2, price3) {
    // create the new row
    var newRow = bodyTable.insertRow();

    // create the new data of the row
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);
    var cell5 = newRow.insertCell(4);

    // add data to the new row
    cell1.innerHTML = `<td class="dish">${product}</td>`;
    cell1.id = idProduct;
    cell1.className = 'dish'

    //add the three price different
    cell2.innerHTML = `<button class="btn-car" price1=${price}  price2=${price2}  price3=${price3} onclick="edit_price(this)">${price}</button>`;
    cell2.className = 'price';

    //this is the amount 
    cell3.innerHTML = `<button class="btn-car" onclick="edit_car(this)">1</button>`;
    cell3.className = 'amount';

    cell4.innerHTML = `<td class="total">${price}</td>`;
    cell4.className = 'total';

    cell5.innerHTML = `<button class="btn-car" onclick="delate_fish_car(this)"><i class="fi-icon-delate fi-sr-trash"></i></button>`;
}

function this_product_exists_in_the_cart(bodyTable, newProduct) {
    // get all the row of body of the tabla
    var rows = bodyTable.getElementsByTagName("tr");
    // read all the row
    for (var i = 0; i < rows.length; i++) {
        // get the cell 0, 2 y 3 of the row
        var dataRow = get_data_row(rows[i]);
        var productCell = dataRow[0];
        var priceCell = dataRow[1];
        var cantCell = dataRow[2];
        var totalCell = dataRow[3];

        // get the text of the cell
        var productText = productCell.textContent.trim(); // delate space on white
        var priceText = priceCell.textContent.trim();
        var cantText = cantCell.textContent.trim();
        var totalText = totalCell.textContent.trim();

        if (newProduct == productText) {
            update_data_in_car(priceText, cantText, cantCell, totalCell);
            return true;
        }
    }

    return false;
}

function get_data_row(row) {
    var productCell = row.getElementsByTagName("td")[0];
    var priceCell = row.getElementsByTagName("td")[1];
    var cantCell = row.getElementsByTagName("td")[2];
    var totalCell = row.getElementsByTagName("td")[3];

    return [productCell, priceCell, cantCell, totalCell];
}

function update_data_in_car(priceText, cantText, cantCell, totalCell) {
    var price = parseFloat(priceText, 10);
    var cant = parseFloat(cantText, 10) + 1;
    var total = cant * price;

    // update the data of the car  
    cantCell.innerHTML = `<button class="btn-car" onclick="edit_car(this)">${cant}</button>`;
    totalCell.innerHTML = `<td class="total">${total}</td>`;
}

function update_total() {
    var bodyTable = tabla.getElementsByTagName("tbody")[0];

    // get all the row of body of the tabla
    var rows = bodyTable.getElementsByTagName("tr");

    // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
    var btn = document.getElementById("btn-total-home");
    if (window.innerWidth >= 768) { 
        btn = document.getElementById("btn-total-home");
    } else {
        btn = document.getElementById("btn-total-home-cellphone");
    }

    var total = 0;
    // read all the row
    for (var i = 0; i < rows.length; i++) {
        // get the cell 0, 2 y 3 of the row
        var dataRow = get_data_row(rows[i]);
        var productCell = dataRow[0];
        var priceCell = dataRow[1];
        var cantCell = dataRow[2];
        var totalCell = dataRow[3];

        // get the text of the cell
        var productText = productCell.textContent.trim(); // delate space on white
        var priceText = priceCell.textContent.trim();
        var cantText = cantCell.textContent.trim();
        var totalText = totalCell.textContent.trim();
        total += parseFloat(totalText, 10);
        total = parseFloat(total.toFixed(2));
    }
    btn.textContent = "Buy $" + total;
}


//---------------------------------------------------------------------------this script is for edit or delate the car

function upload_cant_total(button) {
    // Obtener la fila (tr) padre del botón
    var row = button.parentNode.parentNode;

    // Obtener el elemento con clase "text-price" dentro de la fila
    var textPriceElement = row.querySelector('.price');

    // Obtener el elemento con clase "text-total" dentro de la fila
    var textTotalElement = row.querySelector('.total');

    // Obtener y mostrar el valor actual
    var currentCantValue = button.innerText;
    var currentPriceValue = textPriceElement.innerText;

    // Actualizar el valor en la página si el usuario ingresó un nuevo valor
    textTotalElement.innerText = parseFloat(currentCantValue) * parseFloat(currentPriceValue);
    update_total();
}

function upload_cant_total_for_price(button) {
    // Obtener la fila (tr) padre del botón
    var row = button.parentNode.parentNode;

    // Obtener el elemento con clase "text-price" dentro de la fila
    var textPriceElement = row.querySelector('.amount');

    // Obtener el elemento con clase "text-total" dentro de la fila
    var textTotalElement = row.querySelector('.total');

    // Obtener y mostrar el valor actual
    var currentCantValue = button.innerText;
    var currentPriceValue = textPriceElement.innerText;

    // Actualizar el valor en la página si el usuario ingresó un nuevo valor
    textTotalElement.innerText = parseFloat(currentCantValue) * parseFloat(currentPriceValue);
    update_total();
}

async function delate_fish_car(button) {
    if (await questionMessage('Eliminar Producto 🤔', '¿Estás seguro de querer eliminar este producto?')) {
        var row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
        update_total();
        notificationMessage('Producto eliminado 👍', 'El Producto fue eliminado correctamente')
    }
}

async function edit_car(button) {
    //get old value
    var oldValue = button.innerText;

    //get the new value that the user need 
    var newValue = parseFloat(await edit_cant_car('Editar Cant.', oldValue))
    if (removal_amount(newValue)) {
        button.innerText = newValue; //upload the cant
        upload_cant_total(button)
    }
    else {
        delate_fish_car(button)
    }
}

async function edit_price(button) {
    //get old value
    const oldValue = button.innerText;
    var price1 = button.getAttribute('price1');
    var price2 = button.getAttribute('price2');
    var price3 = button.getAttribute('price3');

    //get the new value that the user need
    var newValue = parseFloat(await edit_price_car('Selecciona un nuevo precio 🏷️', price1, price2, price3));
    if (removal_amount(newValue)) {
        button.innerText = newValue; //upload the cant
        upload_cant_total_for_price(button);
    }
    else {
        delate_fish_car(button)
    }
}

function removal_amount(newValue) {
    return (newValue != '') && (newValue > 0)
}


function get_all_combo(totalCar,moneyReceived,exchange,comment) {
    var bodyTable = tabla.getElementsByTagName("tbody")[0];

    // get all the row of body of the tabla
    var rows = bodyTable.getElementsByTagName("tr");

    // read all the row
    var combos = []
    for (var i = 0; i < rows.length; i++) {
        // get the cell 3 of the row
        var dataRow = get_data_row(rows[i]);
        var btnCell = dataRow[3];

        //get the id and amount of the product 
        const id = dataRow[0].id;
        const name = dataRow[0].textContent;
        const price = dataRow[1].textContent;
        const amount = dataRow[2].textContent;
        const total = dataRow[3].textContent;

        //add the combo data to the list 
        const dataCombo = { id, name, price, amount, total , totalCar, moneyReceived, exchange,comment}
        combos.push(dataCombo)
    }

    return combos;
}

function delete_all_fish() {
    var bodyTable = tabla.getElementsByTagName("tbody")[0];

    // get all the row of body of the tabla
    var rows = bodyTable.getElementsByTagName("tr");
    var btn = document.getElementById("btn-total-home");
    if (window.innerWidth >= 768) { 
        btn = document.getElementById("btn-total-home");
    } else {
        btn = document.getElementById("btn-total-home-cellphone");
    }

    //delate all the car data 
    tabla.removeChild(bodyTable);

    //this is for that when we will delete the data of the table, add the new tbody for that not have a error  
    const tbody = document.createElement("tbody");
    tabla.appendChild(tbody);

    //update the total
    var total = 0;
    btn.textContent = "Buy $" + total;
}

//const myCountry=getLocation()
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // You can use geolocation services, such as Google Maps API,
            // to get detailed information about the location.

            // In this example, only latitude and longitude are printed.
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            // You can use geocoding services to get detailed information about the country.
            // In this simple example, it is assumed that if the latitude is greater than 23.6345
            // (approximately the latitude of Mexico), then the user is in Mexico; otherwise, they are in the USA.
            return determineLocation(latitude, longitude);
        }, function (error) {
            console.error('Error getting location:', error.message);
        });
    } else {
        console.error('Geolocation is not supported in this browser.');
    }

    return 'MXN'
}

function determineLocation(latitude, longitude) {
    // You can use geocoding services here to get detailed information.
    // In this simple example, it is assumed that if the latitude is greater than 23.6345
    // (approximately the latitude of Mexico), then the user is in Mexico; otherwise, they are in the USA.
    if (latitude > 23.6345) {
        return 'MXN'
    } else {
        return 'USA'
    }
}

async function buy_my_car(button) {
    //get the price of the car with all the combo
    var value = get_value_car(button)

    //if exist a product in 
    if (value > 0) {
        //we will to get the email of the client 
        const button = document.getElementById('emailClient');
        const emailClient = button.textContent;

        //we going to watch if the user input the pay
        var dataBuy = await show_message_buy_car('Total a pagar', emailClient, value, getLocation());
        if (dataBuy) {
            //wwe will see if the user is in cellphone 
            if (window.innerWidth <768) { // Ajusta el valor según el tamaño de pantalla deseado para tablets, ipads, laptops, etc.
                var newcash = dataBuy[3]
                var newdebitCard = dataBuy[4]
                var newcreditCard = dataBuy[5]
                var newcomment = dataBuy[6];
                dataBuy = [newcash, newdebitCard, newcreditCard, newcomment];
            }

            //we will watching if the money input is equal or elderly to the car price
            const money = string_to_float(dataBuy[0])
            const debitCard=string_to_float(dataBuy[1])
            const creditCard=string_to_float(dataBuy[2])

            //we will calculating if all the money input in the box can buy the food
            const totalMoney=money+debitCard+creditCard;
            if (totalMoney >= value) {
                //we calculate the exchange 
                exchange = totalMoney - value;
                const comment=dataBuy[3];
                await delete_all_car(value,totalMoney,exchange,comment) //reset the car
                reset_input_order() //this is for reset the data of the orden of send 
            } else {
                errorMessage('¡Error! la compra no fue completa 👁️', 'El dinero no es suficiente.')
            }
        }
    }
}

function get_value_car(button) {
    //get the value of the button of the total
    var buttonText = button.textContent || button.innerText;
    var numericValue = buttonText.match(/\d+(\.\d+)?/);

    //if exist a value we going to calculate the total of the button
    if (numericValue) {
        var value = parseFloat(numericValue[0], 10);
        return value;
    } else {
        return 0;
    }
}

function string_to_float(text) {
    const floatValue = parseFloat(text);
    return isNaN(floatValue) ? 0 : floatValue;
}
