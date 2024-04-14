//this script is for edit or delate the product or supplies
async function edit_cant(button) {
    // get the row
    var row = button.closest('tr');
    
    // get the value of the cant
    var currentCant = row.cells[2].innerText;

    //get the new cant
    var newCant = await edit_cant_car('Edit quantity',currentCant);
    newCant = parseFloat(newCant);

    // Validate if the user entered a value and update the quantity if valid
    if (!isNaN(newCant) && newCant > 0) {
        row.cells[2].innerHTML = '<button class="btn" onclick="edit_cant(this)">' + newCant + '</button>';
    }
    else{
        delate_row(button);
    }
}

async function edit_food_waste(button) {
    // get the row
    var row = button.closest('tr');
    
    // get the value of the cant
    var currentCant = row.cells[3].innerText;

    //get the new cant
    var newCant = await edit_cant_car('Edit quantity',currentCant);
    newCant = parseFloat(newCant);

    // Validate if the user entered a value and update the quantity if valid
    if (!isNaN(newCant) && newCant >= 0) {
        row.cells[3].innerHTML = '<button class="btn" onclick="edit_food_waste(this)">' + newCant + '</button>';
    }else{
        infoMessage('Error al actualizar','La cantidad de merma debe ser mayor o igual a 0')
    }
}

async function delate_row(button){
    // get the row
    var row = button.closest('tr');

    if(await questionMessage('Delate object','Do you want to delete this object?')){
        row.remove();
    }
}

//this script is for update or add to the table
function is_id_already_exists(newId) {
    // get the table for his ID
    var table = document.getElementById('table-supplies-products');
    var rows = table.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        
        if (cells.length > 0) {
            var existingId = cells[0].innerText; // Assuming the first column contains the txtId value

            if (existingId == newId) {
                // Id already exists in the table
                update_data_table(cells);
                return true;
            }
        }
    }

    // Id does not exist in the table
    return false;
}

function update_data_table(cells){
    var cellCant = cells[2];
    var newCant = parseFloat(cellCant.innerText)+1; // Fix typo here
    // Set the innerHTML to a button element with the newCant value
    cellCant.innerHTML = '<button class="btn" onclick="edit_cant(this)">' + newCant + '</button>';
}

function addButtonClick(event, type){
    var row = event.target.closest('tr');
    var selectedSelects = row.querySelectorAll('select');

    var index = (type == 'Supply') ? 1 : 0;

    // Get the id, value, and text of the elements <select>
    var boxSelect,txtId, txtValue, txtText;
    boxSelect=selectedSelects[index]
    txtId = boxSelect.options[boxSelect.selectedIndex].id;
    txtValue = boxSelect.value;
    txtText = boxSelect.options[boxSelect.selectedIndex].innerText;
    if(!is_id_already_exists(txtId)){
        addRowToTable(txtValue,txtId,txtText);
    }
}

//addRowToTable(selectedValue2,selectedText2,)
function addRowToTable(idProduct,barcodeProduct,nameProduct){
    // get the table for his ID
    var table = document.getElementById('table-supplies-products');

    var row = table.insertRow(); // Add a row to the table
    row.id=idProduct;

    var cellBarcode = row.insertCell(0); // Cell for the product
    var cellName = row.insertCell(1); // Cell for product data
    var cellCant= row.insertCell(2); // Cell for the supply
    var cellForSell= row.insertCell(3); // Cell for supply data
    var cellBtn= row.insertCell(4); // Cell for supply data

    // Assign data to cells
    cellBarcode.innerHTML = barcodeProduct;
    cellName.innerHTML = nameProduct;
    cellCant.innerHTML = '<button class="btn" onclick="edit_cant(this)">' + 1 + '</button>';
    cellForSell.innerHTML='<select class="form-control"><option value="unity">Pza</option><option value="kg">kg</option><option value="l">L</option></select>';
    cellBtn.innerHTML = '<button class="btn btn-danger" onclick="delate_row(this)"><i class="fi-icon fi-sr-trash"></i></button>';
}

function get_id_products_and_supplies(){
    // get the table for his ID
    var table = document.getElementById('table-supplies-products');
    var rows = table.getElementsByTagName('tr');

    text=""
    for (var i = 0; i < rows.length; i++) {
        var idProduct=rows[i].id
        if(i>0){
            var cells = rows[i].getElementsByTagName('td');
            var amount = cells[2].innerText;
            var selectElement = cells[3].querySelector('select');
            var unity = selectElement.options[selectElement.selectedIndex].value;
            text+=`[${idProduct},${amount},${unity} ],`;
        }
    }

    inputBarcodeProducts=document.getElementById('barcodeProducts');
    inputBarcodeProducts.value=text;
}