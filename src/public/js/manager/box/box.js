async function edit_box(idBox,idCompany,idBranch,number,ipPrinter){
    var result=await edit_box_message(number,ipPrinter);

    //we will watching if the user input the number of the box
    if(result[0]!=''){
        var newNumber=result[0]
        var newIpPrinter='-';
        //we will watching if the ip is null 
        if(result[1]!=''){
            newIpPrinter=result[1];
        }

        window.location.href = "/fud/"+idCompany+"/"+idBranch+"/"+idBox+"/"+newNumber+'/'+newIpPrinter+'/edit-box';
    }else{
        errorMessage('😳 Error Box','Necesitas agregar un dato valido')
    }
}

async function delete_box(idBox,idCompany,idBranch){
    const answer=await questionMessage('Eliminar caja 😱');
    if(answer){
        window.location.href = "/fud/"+idCompany+"/"+idBranch+"/"+idBox+'/delete-box';
    }
}