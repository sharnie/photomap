$(document).ready(function(){
  // create map
  (function initialize() {
    var myLatlng = new google.maps.LatLng(-25.363882,131.044922);

    var mapOptions = {
      center: myLatlng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      mapTypeControl: false,
      panControl: false,
    };

    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    var marker_image = {
      url: '/images/marker3.png',
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(0,0)
    };

    var marker = new google.maps.Marker({
        position    : myLatlng,
        map         : map,
        title       : 'Hello World!',
        icon        : marker_image,
    });

    google.maps.event.addDomListener(window, 'load', initialize);
  })();
});