document.getElementById('search').addEventListener('input', search_combo);

function search_combo(){
    //get the value of the input
    const barcodeValue = document.getElementById('search').value;
    // search the value in the table
    toggleRows(barcodeValue);
}

function toggleRows(barcode) {
       // Get all the rows of the table
       const rows = document.querySelectorAll('#table-container tbody tr');

       // Iterate over the rows and hide or show based on the barcode value
       rows.forEach(row => {
           const rowText = row.textContent.toLowerCase();
           // Check if the row text includes the barcode value
           row.style.display = rowText.includes(barcode) ? '' : 'none';
       });
}

//this function is for search for name/email and country
function search_browser(){
    //get the value of the input
    const barcodeValue = document.getElementById('search').value;
    // search the value in the table
    toggleRows(barcodeValue);
}

function search_for_id_and_country(){
    //get the value of the input
    const valueId = document.getElementById('search').value;
    const valueCountry = document.getElementById('select-country').value;

    // get all the row of the table
    const rows = document.querySelectorAll('#table-container tbody tr');

    // Iterate over the rows and disable or enable based on the barcode value
    rows.forEach(row => {
        if(valueId==''){
            search_for_country(row,valueCountry)
        }
        if(valueCountry=='All'){

        }
        search_for_country(row,valueCountry)
        search_for_id(row,valueId)
    });   
}

function search_for_country(row,country){
    const rowCountry = row.getAttribute('country');

    //we will watching if the barcode is equal to the id of the row or if the barcode is equal to null
    row.style.display = (rowCountry === country || country === 'All') ? '' : 'none';
}

function search_for_id(row,value){
    const rowId = row.getAttribute('id');

    //we will watching if the barcode is equal to the id of the row or if the barcode is equal to null
    row.style.display = (rowId === value ||  value=== '') ? '' : 'none';
}

/////////////////
function search_browser_div(){
    //get the value of the input
    const valueSearch = document.getElementById('search').value;
    // search the value in the table
    search_div(valueSearch);
}

function search_div(valueSearch) {
    // Obtener el elemento contenedor
    const containerDiv = document.getElementById('container-div');

    // Obtener todos los divs dentro del contenedor
    const divs = containerDiv.querySelectorAll('.card');

    // Iterar sobre los divs y desactivar aquellos cuyo id coincida con el email proporcionado
    divs.forEach(div => {
        const divId = div.id;
        div.style.display = (divId === valueSearch ||  valueSearch=== '') ? '' : 'none';
    });
}