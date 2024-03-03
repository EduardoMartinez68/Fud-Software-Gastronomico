async function delete_ad(idCompany,idBranch,idAd){
    //we will watching if the user would like delete this ad 
    if(await questionMessage('Eliminar Anuncio','¿Deceas eliminar este anuncio?')){
        window.location.href = "/fud/"+idCompany+"/"+idBranch+"/"+idAd+"/delete-ad";
    }
}