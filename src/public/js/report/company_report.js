const myPortfolio = document.getElementById('myPortfolio');
const companyExpenses = document.getElementById('companyExpenses');
const companyExpenses1 = document.getElementById('companyExpenses1');


function draw_graph(ctx,type,title_graph,labels,data,label){
  new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        borderWidth: 1
      }]
    },
    options: {
      title: {
        display: true,
        text: title_graph
      },
      aspectRatio: 2, // Cambia este valor según tus necesidades
      responsive: true, // Cambia a false si no deseas que la gráfica se ajuste al tamaño del contenedor
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });  
}

function draw_graph2(ctx, type, title_graph, labels, data, label, backgroundColors) {
  var options = {
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
};


  new Chart(ctx, {
      type: type,
      data: {
          labels: labels,
          datasets: [{
              label: label,
              data: data,
              backgroundColor: backgroundColors, // Asigna los colores aquí
              borderWidth: 1
          }]
      },
      options: options
  });
}

data=[12, 19, 3, 5, 2, 3]
labels=['red']
//draw_graph(myPortfolio,'doughnut','My Portfolio',labels,data)
//draw_graph(companyExpenses,'line','Company Expenses',labels,data)
//draw_graph(companyExpenses1,'bar','Company Expenses',labels,data)

/*
  line
  doughnut
  bar
*/