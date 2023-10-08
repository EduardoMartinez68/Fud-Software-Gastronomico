//inputs
const productCost=document.getElementById("productCost");
const utility=document.getElementById("utilityPrice");
const finalPrice=document.getElementById("finalPrice");

productCost.addEventListener("keyup",function(){
    calculate(1);
});

utility.addEventListener("keyup",function(){
    calculate(2);
});


finalPrice.addEventListener("keyup",function(){
    calculate(3);
});

productCost.addEventListener("input",function(){
    calculate(1);
});

utility.addEventListener("input",function(){
    calculate(2);
});


finalPrice.addEventListener("input",function(){
    calculate(3);
});

//value of inputs 
function uploadInputs(){
    //we will get all the data of the inputs 
    var valueProductCost=parseFloat(productCost.value);
    var valueUtility=parseFloat(utility.value);
    var valueFinalPrice=parseFloat(finalPrice.value);

    //we will watch if a data is Nan and if the dato is equal to Nan change to 0
    if(isNaN(valueProductCost)){
        valueProductCost.value=0;
    }
    if(isNaN(valueUtility)){
        valueUtility.value=0;
    }
    if(isNaN(valueFinalPrice)){
        valueFinalPrice.value=0;
    }

    return [valueProductCost,valueUtility,valueFinalPrice]
}

function calculate(fun){
    //we will get th value of the input
    var values=uploadInputs()
    var valueProductCost=values[0];
    var valueUtility=values[1];
    var valueFinalPrice=values[2];

    //we know that function use
    if(fun==1){
        calculate_final_price(valueProductCost,valueUtility)
    }
    else if(fun==2){
        calculate_final_price(valueProductCost,valueUtility)
    }
    else{
        calculate_utility(valueProductCost,valueFinalPrice)
    }
}


//function for calculate
function calculate_utility(valueProductCost,valueFinalPrice){
    utility.value=get_utility(valueProductCost,valueFinalPrice);
};

function calculate_final_price(valueProductCost,valueUtility){
    finalPrice.value=valueProductCost+get_price_of_utility(valueProductCost,valueUtility);
};



function get_price_of_utility(valueProductCost,valueUtility){
    return (valueUtility*valueProductCost)/100;
}

function get_utility(valueProductCost,valueFinalPrice){
    return (valueFinalPrice*100)/valueProductCost;
}