  // get all the element of input of type checkbox in the container
  var checkboxes = document.querySelectorAll('#navbar-branch input[type="checkbox"]');

  // Itera sobre todos los checkboxes y desactívalos
  checkboxes.forEach(function(checkbox) {
      checkbox.disabled = true;
  });