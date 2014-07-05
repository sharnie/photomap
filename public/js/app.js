$(document).ready(function(){

  $(function() {
    $("#slider").slider({
      range : "max",
        min : 10,
        max : 1000,
      value : $("#radius").val(),
      slide : function(event, ui) {
                $('#radius-slider').data('radius', ui.value);
                $("#radius").val(ui.value + ' KM');
              },
     change : function(event, ui) {
                console.log('It worked!');
              }
    });
  });

});