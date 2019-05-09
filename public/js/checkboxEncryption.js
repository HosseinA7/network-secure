function myFunction() {
    var checkBox = document.getElementById("myCheck");
    var text = document.getElementById("keytext");
    if (checkBox.checked == true){
      text.style.display = "block";
    } else {
       text.style.display = "none";
    }
  }