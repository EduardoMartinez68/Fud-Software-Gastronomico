async function car_returns(){
    await edit_box_message2('t','t');
}

async function edit_box_message2(number,ipPrinter){ 
    return new Promise((resolve, reject) => { 
        Swal.fire({
            title: 'Rembolsos',
            html:
            `
            <style>
            table {
                border-collapse: collapse;
                width: 100%;
                height:25px;
            }

            th, td {
                padding: 5px;
                text-align: left;
            }

            tr {
                margin-bottom: .25rem;
            }

            .swal2-popup {
                width: 38%;
            }

            .cash{
                height:65px;
                font-size:3rem;
                text-align: center;
                line-height: 65px;
            }
        </style>
            <img src="https://cdn-icons-png.flaticon.com/512/994/994236.png" class="img-message"><br>
            <div class="row">
                <div class="col">
                    <label for="exampleInputEmail1">Escribe el codigo del ticket</label>
                    <input type="text" class="form-control" id="ticket" aria-describedby="emailHelp" placeholder="Codigo...">
                </div>
                <br>
                <br>
            </div>
            <div class="row">
                <div class="col">
                    <label>Fecha</label>
                    <h4>Productos que coinsiden con la busqueda del ticket</h4>
                    <table class="table">
                        <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Precio</th>
                            <th>Cant.</th>
                            <th>Total</th>
                            <th>Empleado</th>
                            <th>Cliente</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Dato 1</td>
                            <td>Dato 2</td>
                            <td>Dato 3</td>
                            <td>Dato 1</td>
                            <td>Dato 2</td>
                            <td>Dato 3</td>
                            <td>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchDeleteSupplies" name="deleteSupplies" valueCheck="{{delete_supplies}}">
                                    <label class="form-check-label" for="flexSwitchDeleteSupplies">Rembolsar</label>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Dato 1</td>
                            <td>Dato 2</td>
                            <td>Dato 3</td>
                            <td>Dato 1</td>
                            <td>Dato 2</td>
                            <td>Dato 3</td>
                            <td>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchDeleteSupplies" name="deleteSupplies" valueCheck="{{delete_supplies}}">
                                    <label class="form-check-label" for="flexSwitchDeleteSupplies">Rembolsar</label>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Dato 1</td>
                            <td>Dato 2</td>
                            <td>Dato 3</td>
                            <td>Dato 1</td>
                            <td>Dato 2</td>
                            <td>Dato 3</td>
                            <td>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchDeleteSupplies" name="deleteSupplies" valueCheck="{{delete_supplies}}">
                                    <label class="form-check-label" for="flexSwitchDeleteSupplies">Rembolsar</label>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <br>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Buscar',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const number = Swal.getPopup().querySelector('#ticket').value;
                const data = [number];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}