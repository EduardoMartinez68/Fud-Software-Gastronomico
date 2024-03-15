//icons
const iconMondayStart = document.getElementById('i-on-monday');
const iconThuesdayStart = document.getElementById('i-on-thuesday');
const iconWednesdayStart = document.getElementById('i-on-wednesday');
const iconThursdayStart = document.getElementById('i-on-Thursday');
const iconFridayStart = document.getElementById('i-on-Friday');
const iconSaturdayStart = document.getElementById('i-on-Saturday');
const iconSundayStart = document.getElementById('i-on-Sunday');

////////////////////////////////////////////////////////////MONDAY///////////////////////////////////////////////////////////////////
const btnMondayStart = document.getElementById('btn-on-monday');
btnMondayStart.addEventListener('click', ()=>{
    onclickBtnHours(iconMondayStart,'starMonday','finishMonday');
});

//btn delate monday
const btnDelateMondayStart = document.getElementById('btn-delate-start-monday');
const btnDelateMondayFinish = document.getElementById('btn-delate-finish-monday');
btnDelateMondayStart.addEventListener('click', ()=>{
  restartInput('starMonday');
});

btnDelateMondayFinish.addEventListener('click', ()=>{
  restartInput('finishMonday');
});

//sum hours and minute work in the day
function addHoursWorkedOnMonday(){
  calculateHoursWorkedInADay('starMonday','finishMonday','hours-monday','minutes-monday');
}

////////////////////////////////////////////////////////////Thuesday///////////////////////////////////////////////////////////////////
const btnThuesdayStart = document.getElementById('btn-on-thuesday');
btnThuesdayStart.addEventListener('click', ()=>{
  onclickBtnHours(iconThuesdayStart,'starThuesday','finishThuesday');
});

//btn delate thuesday
const btnDelateThuesdayStart = document.getElementById('btn-delate-start-thuesday');
const btnDelateThuesdayFinish = document.getElementById('btn-delate-finish-thuesday');
btnDelateThuesdayStart.addEventListener('click', ()=>{
  restartInput('starThuesday');
});

btnDelateThuesdayFinish.addEventListener('click', ()=>{
  restartInput('finishThuesday');
});

////////////////////////////////////////////////////////////Wednesday///////////////////////////////////////////////////////////////////
const btnWednesdayStart = document.getElementById('btn-on-wednesday');
btnWednesdayStart.addEventListener('click', ()=>{
  onclickBtnHours(iconWednesdayStart,'starWednesday','finishWednesday');
});

//btn delate Wednesday
const btnDelateWednesdayStart = document.getElementById('btn-delate-start-wednesday');
const btnDelateWednesdayFinish = document.getElementById('btn-delate-finish-wednesday');
btnDelateWednesdayStart.addEventListener('click', ()=>{
  restartInput('starWednesday');
});

btnDelateWednesdayFinish.addEventListener('click', ()=>{
  restartInput('finishWednesday');
});

////////////////////////////////////////////////////////////Thursday///////////////////////////////////////////////////////////////////
const btnThursdayStart = document.getElementById('btn-on-Thursday');
btnThursdayStart.addEventListener('click', ()=>{
  onclickBtnHours(iconThursdayStart,'star-Thursday','finish-Thursday');
});

//btn delate Thursday
const btnDelateThursdayStart = document.getElementById('btn-delate-start-Thursday');
const btnDelateThursdayFinish = document.getElementById('btn-delate-finish-Thursday');
btnDelateThursdayStart.addEventListener('click', ()=>{
  restartInput('star-Thursday');
});

btnDelateThursdayFinish.addEventListener('click', ()=>{
  restartInput('finish-Thursday');
});

////////////////////////////////////////////////////////////Friday///////////////////////////////////////////////////////////////////
const btnFridayStart = document.getElementById('btn-on-Friday');
btnFridayStart.addEventListener('click', ()=>{
  onclickBtnHours(iconFridayStart,'star-Friday','finish-Friday');
});

//btn delate Friday
const btnDelateFridayStart = document.getElementById('btn-delate-start-Friday');
const btnDelateFridayFinish = document.getElementById('btn-delate-finish-Friday');
btnDelateFridayStart.addEventListener('click', ()=>{
  restartInput('star-Friday');
});

btnDelateFridayFinish.addEventListener('click', ()=>{
  restartInput('finish-Friday');
});

////////////////////////////////////////////////////////////Saturday///////////////////////////////////////////////////////////////////
const btnSaturdayStart = document.getElementById('btn-on-Saturday');
btnSaturdayStart.addEventListener('click', ()=>{
  onclickBtnHours(iconSaturdayStart,'star-Saturday','finish-Saturday');
});

//btn delate Friday
const btnDelateSaturdayStart = document.getElementById('btn-delate-start-Saturday');
const btnDelateSaturdayFinish = document.getElementById('btn-delate-finish-Saturday');
btnDelateSaturdayStart.addEventListener('click', ()=>{
  restartInput('star-Saturday');
});

btnDelateSaturdayFinish.addEventListener('click', ()=>{
  restartInput('finish-Saturday');
});

////////////////////////////////////////////////////////////Sunday///////////////////////////////////////////////////////////////////
const btnSundayStart = document.getElementById('btn-on-Sunday');
btnSundayStart.addEventListener('click', ()=>{
  onclickBtnHours(iconSundayStart,'star-Sunday','finish-Sunday');
});

//btn delate Friday
const btnDelateSundayStart = document.getElementById('btn-delate-start-Sunday');
const btnDelateSundayFinish = document.getElementById('btn-delate-finish-Sunday');
btnDelateSundayStart.addEventListener('click', ()=>{
  restartInput('star-Sunday');
});

btnDelateSundayFinish.addEventListener('click', ()=>{
  restartInput('finish-Sunday');
});


/////////////////////////////////////////////////////////////////////global function///////////////////////////////////////////////////////////////////
function onclickBtnHours(iconDay,inputStart,inputFinish){
  //we will watch if the class have the label of actived
  if (iconDay.classList.contains('schedule-active')) {
    iconDay.classList.remove('schedule-active');
  } else {
    iconDay.classList.add('schedule-active');
  }

  restartTime(inputStart,inputFinish,iconDay);
};

function restartInput(input){
  const btnTime = document.getElementById(input);
  btnTime.value = '0:00' //btnTime.defaultValue;

  uploadHours();
};


function restartTime(inputStart,inputFinish,iconDay){
  const starTime = document.getElementById(inputStart);
  const finishTime = document.getElementById(inputFinish);
  starTime.value = '0:00'//starTime.defaultValue;
  finishTime.value = '0:00'//finishTime.defaultValue;

  //we will watch if the icon be on or off
  starTime.disabled = !iconDay.classList.contains('schedule-active');
  finishTime.disabled = !iconDay.classList.contains('schedule-active');
  uploadHours();
}

function uploadHours(){
  //we will to calculate all the hours of the on button 
  var weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  for (var i = 0; i < weekDays.length; i++) {
    var day = weekDays[i];
    calculateHoursWorkedInADay(day);
  }
}

function calculateHoursWorkedInADay(day){
  switch (day) {
    case "Monday":
      calculateHoursWorked('starMonday','finishMonday','hours-monday','minutes-monday');
      break;
    case "Tuesday":
      calculateHoursWorked('starThuesday','finishThuesday','hours-tuesday','minutes-tuesday');
      break;
    case "Wednesday":
      calculateHoursWorked('starWednesday','finishWednesday','hours-wednesday','minutes-wednesday');
      break;
    case "Thursday":
      calculateHoursWorked('star-Thursday','finish-Thursday','hours-Thursday','minutes-Thursday');
      break;
    case "Friday":
      calculateHoursWorked('star-Friday','finish-Friday','hours-Friday','minutes-Friday');
      break;
    case "Saturday":
      calculateHoursWorked('star-Saturday','finish-Saturday','hours-Saturday','minutes-Saturday');
      break;
    case "Sunday":
      calculateHoursWorked('star-Sunday','finish-Sunday','hours-Sunday','minutes-Sunday');
      break;
    default:
      console.log("Unrecognized day");
  }
}

function calculateHoursWorked(inputStar,inputFinish,labelHours,labelMinutes){
  var inputStartMonday = document.getElementById(inputStar);
  var inputFinishMonday = document.getElementById(inputFinish);

  var startTime = inputStartMonday.value.split(":");
  var finishTime = inputFinishMonday.value.split(":");

  var startHours = parseInt(startTime[0]);
  var startMinutes = parseInt(startTime[1]);

  var finishHours = parseInt(finishTime[0]);
  var finishMinutes = parseInt(finishTime[1]);

  var workedHours, workedMinutes;

  if (finishHours >= startHours) {
    workedHours = finishHours - startHours;
    workedMinutes = finishMinutes - startMinutes;
  } else {
    workedHours = (24 - startHours) + finishHours;
    workedMinutes = finishMinutes - startMinutes;
  }

  if (workedMinutes < 0) {
    workedHours--;
    workedMinutes = 60 + workedMinutes;
  }

  //add the hour and minutes work
  var hrsWork=workedHours.toString().padStart(2, "0");
  var mntWork=workedMinutes.toString().padStart(2, "0");
  document.getElementById(labelHours).textContent= (isNaN(hrsWork)) ? "0": hrsWork;
  document.getElementById(labelMinutes).textContent= (isNaN(mntWork)) ? "0": mntWork;

  calculateAllTheHours();
}

//sum 
function restartAllTime(){
  restartTime('starMonday','finishMonday',iconMondayStart);
  restartTime('starThuesday','finishThuesday',iconThuesdayStart);
  restartTime('starWednesday','finishWednesday',iconWednesdayStart);
  restartTime('star-Thursday','finish-Thursday',iconThursdayStart);
  restartTime('star-Friday','finish-Friday',iconFridayStart);
  restartTime('star-Saturday','finish-Saturday',iconSaturdayStart);
  restartTime('star-Sunday','finish-Sunday',iconSundayStart);
}

function calculateAllTheHours(){
  var mondayHours=parseInt(document.getElementById('hours-monday').textContent);
  var mondayMinutes=parseInt(document.getElementById('minutes-monday').textContent);

  var tuesdayHours=parseInt(document.getElementById('hours-tuesday').textContent);
  var tuesdayMinutes=parseInt(document.getElementById('minutes-tuesday').textContent);

  
  var wednesdayHours=parseInt(document.getElementById('hours-wednesday').textContent);
  var wednesdayMinutes=parseInt(document.getElementById('minutes-wednesday').textContent);

  var ThursdayHours=parseInt(document.getElementById('hours-Thursday').textContent);
  var ThursdayMinutes=parseInt(document.getElementById('minutes-Thursday').textContent);

  var FridayHours=parseInt(document.getElementById('hours-Friday').textContent);
  var FridayMinutes=parseInt(document.getElementById('minutes-Friday').textContent);

  var SaturdayHours=parseInt(document.getElementById('hours-Saturday').textContent);
  var SaturdayMinutes=parseInt(document.getElementById('minutes-Saturday').textContent);

  var SundayHours=parseInt(document.getElementById('hours-Sunday').textContent);
  var SundayMinutes=parseInt(document.getElementById('minutes-Sunday').textContent);

  var hours=mondayHours+tuesdayHours+wednesdayHours+ThursdayHours+FridayHours+SaturdayHours+SundayHours
  var minutes=mondayMinutes+tuesdayMinutes+wednesdayMinutes+ThursdayMinutes+FridayMinutes+SaturdayMinutes+SundayMinutes
  var extraHours=Math.floor(minutes/60); //convert minutes to hours
  var extraMinutes=minutes-(extraHours*60);
  
  document.getElementById('totalHourse').textContent= hours+extraHours;
  document.getElementById('totalMinutes').textContent= extraMinutes;
}


//restartAllTime();