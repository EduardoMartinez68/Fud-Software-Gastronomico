function update_input_date_schedule(){
    // get the day
    var today = new Date();

    // get the first day of the week (monday)
    var firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

    // get the finish day of the week (Sunday)
    var finishDayOfWeek = new Date(today);
    finishDayOfWeek.setDate(finishDayOfWeek.getDate() - today.getDay() + 7);

    // Set default values ​​for date input fields
    document.getElementById('date-start').valueAsDate = firstDayOfWeek;
    document.getElementById('date-finish').valueAsDate = finishDayOfWeek;
}
update_input_date_schedule(); //this function is for get the week current




function activate_schedule_employee(idEmployee,nameEmployee){
    // Get all elements with class "container-schedule-employee"
    var divs = document.querySelectorAll('.container-schedule-employee');
    const labelName=document.getElementById('nameEmployee');

    // Iterate over each element
    for (var i = 0; i < divs.length; i++) {
        var div = divs[i];
        // Get the value of the <idEmployee> tag
        var employeeId = div.getAttribute('idEmployee');

        // Check if the tag value matches the idEmployee passed as an argument
        if (employeeId === idEmployee) {
            // Activate the div by changing its class
            div.classList.remove('desactive');
            labelName.textContent=nameEmployee;
        } else {
            // Disable the div by changing its class
            div.classList.add('desactive');
        }
    }
}



function update_schedule(idCompany,idBranch){
    //we will getting the id of the schedule that choose the user 
    const idScheduleEmployee=get_id_schedulee_employee();

    //we will watching if get a schedule for update 
    if(idScheduleEmployee){
        const idSchedule=get_selected_schedule_value();
        window.location.href = '/fud/'+idCompany+'/'+idBranch+'/'+idScheduleEmployee+'/'+idSchedule+'/edit-schedules-employees';
    }
}



function get_id_schedulee_employee(){
    // Get all elements with class "container-schedule-employee"
    var divs = document.querySelectorAll('.container-schedule-employee');

    // Iterate over each element
    for (var i = 0; i < divs.length; i++) {
        var div = divs[i];
        
        // Check if the div contains the class "desactive"
        if (!div.classList.contains('desactive')){
            // If the div not has the class "desactive", return the value of the <idSchedule>
            var idSchedule = div.getAttribute('idSchedule');
            return idSchedule;
        }
    }
}

function get_selected_schedule_value() {
    // Obtener el elemento select por su ID
    var selectElement = document.getElementById('selectSchedule');
    
    // Obtener el valor seleccionado
    var selectedValue = selectElement.value;
    
    // Devolver el valor seleccionado
    return selectedValue;
}