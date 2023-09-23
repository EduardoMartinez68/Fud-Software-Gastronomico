// Obtener referencia al elemento del calendario
const calendarEl = document.getElementById('calendar');

// Inicializar FullCalendar
const calendar = new FullCalendar.Calendar(calendarEl, {
  plugins: ['dayGrid'],
  defaultView: 'dayGridMonth',
  events: [],
  eventRender: function (event, element) {
    // Agregar una clase CSS personalizada al evento del calendario
    element.addClass('appointment-event');
  }
});

// Array para almacenar las citas
let appointments = [
    {
        name: "Cita 1",
        date: "2023-06-10",
        time: "10:00"
      },
      {
        name: "Cita 2",
        date: "2023-06-12",
        time: "15:30"
      },
      {
        name: "Cita 3",
        date: "2023-06-15",
        time: "09:45"
      }
];

// Función para agregar una cita
function addAppointment(event) {
  // ...

  // Agregar la cita al array
  appointments.push(appointment);

  // Actualizar el calendario
  updateCalendar();

  // ...
}

// Función para actualizar el calendario con las citas
function updateCalendar() {
  // Limpiar eventos existentes
  calendar.getEvents().forEach(event => event.remove());

  // Recorrer todas las citas y agregarlas al calendario
  appointments.forEach(appointment => {
    calendar.addEvent({
      title: appointment.name,
      start: appointment.date,
      className: 'appointment'
    });
  });

  // Renderizar el calendario
  calendar.render();
}

// ...

// Llamar a la función `updateCalendar` para inicializar el calendario vacío
updateCalendar();
