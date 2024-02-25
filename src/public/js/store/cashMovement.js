async function cash_movement(idEmployee,idBranch){
    //we will watching if the employee input a move 
    const data=await cash_movement_message();
    if(data){
        //we will see if the user input the cash and the comment 
        if(the_employee_entered_all_the_data(data)){
            await add_the_move_to_the_database(data,idEmployee,idBranch);
        }else{
            errorMessage('👁️ MUCHO OJO!!','Necesitas agregar todos los datos necesarios en el formulario');
        }
    }
}

function the_employee_entered_all_the_data(data){
    //0 is the cash, 1 is the comment 
    return data[0]!='' && data[1]!='';
}

async function add_the_move_to_the_database(data,idEmployee,idBranch){
    loadingOverlay.style.display = "flex"; //this is for that the web show the load screen

    //we create the link of the server
    const idBox=0; //change the id
    const link='/fud/'+idBranch+'/'+idEmployee+'/'+idBox+'/move';

    //we will send the data to the server for add the move to the database 
    const answer=await get_answer_server(data,link);
    loadingOverlay.style.display = "none"; //this is for that the web hide the load screen

    //we will watching the answer of the serve and if can save the move in the database
    if(answer.message){
        //if we going to can add the cash move show a message of confirmation 
        regularMessage('😄 Efectivo actualizado','Se agrego el movimiento de la caja con exito');
    }else{
        //if we going to not can add the cash move show a message of error 
        errorMessage('👉👈 UPS!','No se pudo agregar este movimiento a la base de datos. Intentelo de nuevo.');
    }
}