$(document).ready(function(){

  $(function() {
    $("#slider").slider({
      range : "max",
        min : 10,
        max : 1000,
      value : $("#radius").val(),
      slide : function(event, ui) {
                $("#radius").val(ui.value + ' KM');
              }
    });
  });

});