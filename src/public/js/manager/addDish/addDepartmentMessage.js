///
async function add_departments22(data) {
    Swal.fire({
        title: 'Create a new ' + data,
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="Name">'+
            '<br> <input id="areaDescription" class="swal2-input" placeholder="Description">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save',
        confirmButtonColor: 'rgb(25, 135, 84)',
        cancelButtonColor: 'rgb(220, 53, 69)',
        preConfirm: async () => {
            const name = Swal.getPopup().querySelector('#swal-input1').value;
            const description = Swal.getPopup().querySelector('#areaDescription').value;

            //we going to watched if the user written a name
            if (name){
                try {
                    const database=require('../../../../router/addDatabase');
                    if(database.add_departments(name,description)){
                        Swal.fire(
                            'Data sent',
                            `The ${name} department was successfully added`,
                            'success'
                        );
                    }
                    else{
                        Swal.showValidationMessage(
                            `Request failed`
                        )              
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            else{
                Swal.showValidationMessage('please complete all fields');
            }
        
        }
    });
}

///
function add_departments(data) {
    Swal.fire({
        title: 'Create a new ' + data,
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="Name">'+
            '<br> <input id="areaDescription" class="swal2-input" placeholder="Description">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save',
        confirmButtonColor: 'rgb(25, 135, 84)',
        cancelButtonColor: 'rgb(220, 53, 69)',
        preConfirm: () => {
            const name = Swal.getPopup().querySelector('#swal-input1').value;

            if (!name) {
                Swal.showValidationMessage('please complete all fields');
            }
            else{
                const formData = new FormData();
                formData.append('name', name);

                fetch('/add_department', {
                    method: 'POST',
                    action: "/links/home",
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Error al enviar datos al servidor');
                    }
                })
                .then(data => {
                    Swal.fire(
                        'Data sent',
                        `The ${data.name} department was successfully added`,
                        'success'
                    );
                })
                .catch(error => {
                    console.error(error);
                });
            }
        }
    });
}