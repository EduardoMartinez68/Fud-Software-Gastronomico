document.addEventListener('DOMContentLoaded', () => {
    const layout = document.getElementById('restaurant-layout');
    const addTableButtons = document.querySelectorAll('.add-table');
    const numberTableInput = document.getElementById('numberTable');
    
    let tableCounter = 1;
    let selectedTable = null; // Variable para almacenar la mesa seleccionada
    const tables = [];

    function createTableElement(table) {
        const tableDiv = document.createElement('div');
        tableDiv.id = table.id;
        tableDiv.className = `tables-table ${table.type} ${table.active ? 'tables-active' : ''}`;
        tableDiv.innerText = table.id;
        tableDiv.draggable = true;

        tableDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', table.id);
        });

        tableDiv.addEventListener('click', () => {
            // Quitar borde azul de la mesa previamente seleccionada
            if (selectedTable) {
                selectedTable.style.borderColor = table.active ? 'transparent' : 'transparent';
            }

            // Actualizar el input con el número de mesa seleccionada
            numberTableInput.value = table.id;

            // Añadir borde azul a la mesa seleccionada
            tableDiv.style.borderColor = '#418EF1';
            selectedTable = tableDiv;

            table.active = !table.active;
            tableDiv.classList.toggle('tables-active');
            tableDiv.style.backgroundColor = table.active ? '#38AE94' : '#EF454B';
        });

        tableDiv.style.backgroundColor = table.active ? '#38AE94' : '#EF454B';
        tableDiv.style.borderColor = table.active ? '#38AE94' : '#EF454B';
        tableDiv.style.borderWidth = '4px'; // Grosor del borde aumentado
        tableDiv.style.borderStyle = 'solid'; // Estilo del borde

        // Establecer borde redondeado solo para mesas circulares
        if (table.type === 'tables-circle') {
            tableDiv.style.borderRadius = '50%';
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

    renderTables();
});
