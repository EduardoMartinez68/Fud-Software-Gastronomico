document.addEventListener('DOMContentLoaded', () => {
    const layout = document.getElementById('restaurant-layout');
    const addTableButtons = document.querySelectorAll('.add-table');
    const changeShapeButton = document.querySelector('.change-shape');
    const deleteShapeButton = document.querySelector('.delete-shape');
    const numberTableInput = document.getElementById('numberTable');

    let tableCounter = 1;
    let selectedTable = null; // Variable for save the table selected
    const tables = [];

    // Crear una cuadrícula de 21x21 mesas cuadradas mini por defecto
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const newTable = {
                id: `+`,
                type: 'tables-mini-square',
                active: false
            };
            tables.push(newTable);
        }
    }


    function createTableElement(table) {
        const tableDiv = document.createElement('div');
        tableDiv.id=table.id;
        const theTableIsActivate=(tableDiv.id=='+')

        //we will see if is activate 
        if(theTableIsActivate){
            tableDiv.className = `tables-table tables-mini-square`;
            tableDiv.innerText = '+';
            tableDiv.draggable = true;
        }else{
            tableDiv.className = `tables-table ${table.type} tables-active`;
            //tableDiv.className = `tables-table ${table.type} ${table.active ? 'tables-active' : ''}`;
            tableDiv.innerText = table.id;
            //tableDiv.draggable = true;
        }

        tableDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', table.id);
        });

        tableDiv.addEventListener('click', () => {
            if(theTableIsActivate){
                tableDiv.id=`T${tableCounter++}`
                table.id=tableDiv.id
                tableDiv.innerText = table.id;
            }

            // Quitar borde azul de la mesa previamente seleccionada
            if (selectedTable) {
                selectedTable.style.borderColor = `tables-table ${table.type} ${table.active ? '418EF1' : 'transparent'}`;//'transparent';
            }

            // Actualizar el input con el número de mesa seleccionada
            numberTableInput.value = tableDiv.id;

            // Añadir borde azul a la mesa seleccionada
            tableDiv.style.borderColor = '#418EF1';
            selectedTable = tableDiv;

            //table.active = !table.active;
            tableDiv.classList.toggle('tables-active');
            //tableDiv.style.backgroundColor = table.active ? '#38AE94' : '#EF454B';
            renderTables();
        });

        //tableDiv.style.backgroundColor = table.active ? '#38AE94' : '#EF454B';
        //tableDiv.style.borderColor = table.active ? '#38AE94' : 'transparent';
        tableDiv.style.borderWidth = '4px'; // Grosor del borde aumentado
        tableDiv.style.borderStyle = 'solid'; // Estilo del borde

        // Establecer borde redondeado solo para mesas circulares
        if (table.type === 'tables-circle') {
            tableDiv.style.borderRadius = '50%';
            tableDiv.style.borderColor = table.active ? 'transparent' : '#38AE94';
        } else {
            tableDiv.style.borderRadius = '8px';
        }

        return tableDiv;
    }

    function renderTables() {
        layout.innerHTML = '';
        tables.forEach(table => {
            layout.appendChild(createTableElement(table));
        });
    }

    //esto es para agregar una nueva mesa con un button 
    addTableButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newTableType = button.getAttribute('data-type');
            const newTable = {
                id: `T${tableCounter++}`,
                type: `tables-${newTableType}`,
                active: false
            };
            tables.push(newTable);
            renderTables();
        });
    });

    //this is for change the type of table
    changeShapeButton.addEventListener('click', () => {
        if (selectedTable) {
            const table = tables.find(t => t.id === selectedTable.id);
            if (table) {
                if (table.type === 'tables-circle') {
                    table.type = 'tables-mini-square';
                } else if (table.type === 'tables-mini-square' || table.type === 'tables-large-square') {
                    table.type = 'tables-circle';
                }
                numberTableInput.value = table.id;
                renderTables();
            }
        }
    });

    //this is for delete the table 
    deleteShapeButton.addEventListener('click', () => {
        if (selectedTable) {
            const table = tables.find(t => t.id === selectedTable.id);
            if (table) {
                table.id='+';
                tableDiv.style.backgroundColor = '#A2A2A2';
                numberTableInput.value = table.id;
                table.className = `tables-table tables-mini-square`;
                renderTables();
            }
            renderTables();
        }
    });

    renderTables();
});
