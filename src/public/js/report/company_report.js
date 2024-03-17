const myPortfolio = document.getElementById('myPortfolio');
const companyExpenses = document.getElementById('companyExpenses');
const companyExpenses1 = document.getElementById('companyExpenses1');


function draw_graph(ctx,type,title_graph,labels,data){
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



function draw_doughnut(canva,labels,data){
  draw_graph(canva,'doughnut','My Portfolio',labels,data)
}

function draw_line(canva,labels,data){
  draw_graph(canva,'line','My Portfolio',labels,data)
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