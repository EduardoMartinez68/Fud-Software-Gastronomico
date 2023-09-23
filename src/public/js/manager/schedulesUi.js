/*
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendario');
  const calendar = new Calendar(calendarEl, {
    plugins: [timeGridPlugin],
    initialView: 'timeGridWeek', // Vista semanal
    height: 'auto', // Ajustar automáticamente la altura del calendario
    slotDuration: '00:30:00', // Duración de cada intervalo de tiempo en el calendario (en este caso, 30 minutos)
    slotMinTime: '07:00:00', // Hora de inicio del calendario
    slotMaxTime: '20:00:00', // Hora de finalización del calendario
    events: [
      {
        title: 'Empleado A - Turno 1',
        start: '2023-07-18T08:00:00',
        end: '2023-07-18T13:30:00'
      },
      {
        title: 'Empleado A - Turno 2',
        start: '2023-07-18T14:00:00',
        end: '2023-07-18T18:30:00'
      },
      // Puedes agregar más eventos para representar los horarios de otros empleados
    ]
  });
  calendar.render();
});*/

import { Calendar } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

let calendar = new Calendar(calendarEl, {
  plugins: [ resourceTimelinePlugin ],
  initialView: 'resourceTimeline',
  resources: [
    // your resource list
  ]
});