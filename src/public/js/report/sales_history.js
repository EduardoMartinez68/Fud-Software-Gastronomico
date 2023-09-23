const myPortfolio = document.getElementById('myPortfolio');
const salesHistoryGraph = document.getElementById('sales_history');
const companyExpenses1 = document.getElementById('companyExpenses1');


function draw_graph(ctx,type,title_graph,data,labels){
  new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
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



const idCompany=13
const idUser=1
const data=[12, 19, 3, 5, 2, 3]
const labels=['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']
//draw_graph(salesHistoryGraph,'line','My Portfolio',salesHistory,labels);

/*
data=[12, 19, 3, 5, 2, 3]
draw_graph(myPortfolio,'doughnut','My Portfolio',data)
draw_graph(companyExpenses,'line','Company Expenses',data)
draw_graph(companyExpenses1,'bar','Company Expenses',data)
*/

/*
  line
  doughnut
  bar
*/