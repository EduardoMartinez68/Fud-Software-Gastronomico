async function delete_schedule(idSchedule,nameSchedule,idCompany,idBranch){
    if(await questionMessage('Borrar horario','¿Quieres borrar el horario '+nameSchedule+' ?')){
        window.location.href = '/fud/'+idCompany+'/'+idBranch+'/'+idSchedule+'/delete-schedule';
    }
}

function edit_schedule(){

}