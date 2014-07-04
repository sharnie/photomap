$(document).ready(function(){
  var map;

  // get location
  (function getLocation() {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLocation, getError);
    } else { 
      alert("Geolocation is not supported by this browser.");
    }
  })();

  // set location
  function setLocation(position) {
    initialize(position.coords.latitude, position.coords.longitude);
  }

  // get error
  function getError(error){
    switch(error.code){
      case error.PERMISSION_DENIED:
        initialize(40.7035617, -73.9883172);
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.");
        break;
    }
  }

  // create map
  function initialize(lat, lng) {
    var Latlng = new google.maps.LatLng(lat, lng);

    var mapOptions = {
        center            : Latlng,
        zoom              : 16,
        mapTypeId         : google.maps.MapTypeId.ROADMAP,
        streetViewControl : false,
        mapTypeControl    : false,
        panControl        : false,
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    google.maps.event.addDomListener(window, 'load', initialize);

    // Create the search box and link it to the UI element.
    var input = (document.getElementById('place-search'));
    var searchBox = new google.maps.places.SearchBox((input));

    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
      }

      fetchImage(places[0].geometry.location.k, places[0].geometry.location.B);
      map.panTo(places[0].geometry.location);
      map.setZoom(15);
    });

    google.maps.event.addListener(map, 'rightclick', function(event){
      fetchImage(event.latLng.lat(), event.latLng.lng());
    });

  }


  var markers = [];

  function fetchImage(lat, lng, radius){
    var url = '/map/' + lat + '/' + lng + '/media_search.json';

    $.getJSON(url).success(function(images){
      var html = [];
      var templateString = [
        "        <div class='col-md-4 col-10-gutter'>",
        "          <div class='thumbnail'>",
        "            <div class='media-head'>",
        "              <img src='<%= image.low_resolution %>' alt='...'>",
        "              <span class='caption'></span>",
        "            </div>",
        "            <div class='media-foot'>",
        "              <div class='col-xs-8'>",
        "                <div class='row'>",
        "                  <div class='media'>",
        "                    <a class='avatar pull-left' href='#'>",
        "                      <img class='thumb-sm' src='<%= image.user.profile_picture %>' alt='...'>",
        "                    </a>",
        "                    <div class='media-user text-muted'>",
        "                      <a class='bold username text-ellipsis' href='#'><%= image.user.username %></a>",
        "                      <p class='text-ellipsis'><%= image.user.full_name %></p>",
        "                    </div>",
        "                  </div><!-- .media -->",
        "                </div><!-- .row -->",
        "              </div><!-- .col-xs-* -->",
        "              <div class='col-xs-4'>",
        "                <div class='row'>",
        "                  <div class='pull-right'>",
        "                  <button class='btn btn-primary'>",
        "                    <i class='fa fa-plus'></i>",
        "                    <i class='fa fa-user'></i>",
        "                  </button>",
        "                  </div>",
        "                </div>",
        "              </div>",
        "            </div><!-- .caption -->",
        "          </div><!-- .thumbnail -->",
        "        </div><!-- col-md-6-* -->"
      ];

      _.each(images, function(image){
        var template = _.template(templateString.join("\n"));
        html += template({image: image});

        var marker_image = {
            url         : '/images/marker3.png',
            origin      : new google.maps.Point(0,0),
            anchor      : new google.maps.Point(0,0)
        };

        var marker = new google.maps.Marker({
            id          : image.id,
            position    : new google.maps.LatLng(image.latitude, image.longitude),
            map         : map,
            icon        : marker_image,
            clickable   : true,
            visible     : true,
        });

        markers.push(marker);
      });

      $('#result').prepend(html);
    });
  }

  function removeMarkers(markers){
    $.each(markers, function(id, marker){
      marker.setMap(null);
    });
  }

  $('button#clear-markers').click(function(){
    removeMarkers(markers);
  });

});