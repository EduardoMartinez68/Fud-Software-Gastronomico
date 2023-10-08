function add_departments(data){
    Swal.fire({
    title: 'Create a new '+data,
    input: 'text',
    inputAttributes: {
        autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Save',
    confirmButtonColor: 'rgb(25, 135, 84)',
    cancelButtonColor: 'rgb(220, 53, 69)',
    showLoaderOnConfirm: true,
    preConfirm: (login) => {
        return fetch(`//api.github.com/users/${login}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText)

            }
            return response.json()
        })
        .catch(error => {
            Swal.showValidationMessage(
            `Request failed: ${error}`
            )
        })
    },
    allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
    if (result.isConfirmed) {
        Swal.fire({
            title: `the ${result.value.login} ${data} was successfully added`,
            imageUrl: 'https://cdn-icons-png.flaticon.com/512/3480/3480335.png',//'https://cdn-icons-png.flaticon.com/512/843/843260.png'
            confirmButtonColor: 'rgb(25, 135, 84)',
        })
    }
    })
}