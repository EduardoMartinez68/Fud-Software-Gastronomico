const myPortfolio = document.getElementById('myPortfolio');
const companyExpenses = document.getElementById('companyExpenses');
const companyExpenses1 = document.getElementById('companyExpenses1');


function draw_graph(ctx,type,title_graph,data){
  new Chart(ctx, {
    type: type,
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
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

data=[12, 19, 3, 5, 2, 3]
draw_graph(myPortfolio,'doughnut','My Portfolio',data)
draw_graph(companyExpenses,'line','Company Expenses',data)
draw_graph(companyExpenses1,'bar','Company Expenses',data)

/*
  line
  doughnut
  bar
*/