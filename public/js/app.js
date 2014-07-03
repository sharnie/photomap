$(document).ready(function(){
  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      mapTypeControl: false,
      panControl: false,
    };

    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
  }
  google.maps.event.addDomListener(window, 'load', initialize);

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