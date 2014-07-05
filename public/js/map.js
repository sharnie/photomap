$(document).ready(function(){
  var map, currentLat, currentLng;

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
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
    initialize(currentLat, currentLng);
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

    var styles = [
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [
          { lightness: 100 },
          { visibility: "simplified" }
        ]
      },{
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [
          { color: "#333333" }
        ]
      },{
        featureType: "road",
        elementType: "labels.text.stroke",
        stylers: [
          { color: "#ffffff" }
        ]
      },{
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [
          { visibility: "on" },
          { color: "#ffffff" }
        ]
      },{
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [
          { visibility: "on" },
          { color: "#D8D8D8" }
        ]
      }
    ];

    var mapOptions = {
        styles                : styles,
        center                : Latlng,
        zoom                  : 15,
        mapTypeId             : google.maps.MapTypeId.ROADMAP,
        streetViewControl     : false,
        mapTypeControl        : false,
        panControl            : false,
        disableDoubleClickZoom: true,
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    fetchImage(currentLat, currentLng);

    // Create the search box and link it to the UI element.
    var input = (document.getElementById('place-search'));
    var searchBox = new google.maps.places.SearchBox((input));

    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) {return;}

      currentLat = places[0].geometry.location.k;
      currentLng = places[0].geometry.location.B;

      fetchImage(currentLat, currentLng);

      map.panTo(places[0].geometry.location);
      map.setZoom(15);
    });

    google.maps.event.addListener(map, 'rightclick', function(event){
      currentLat = event.latLng.lat();
      currentLng = event.latLng.lng();

      fetchImage(currentLat, currentLng);
    });

  }


  var markers     = [];
  var defaultIcon = '/images/marker3.png';
  var activeIcon  = '/images/marker_active.png';

  function fetchImage(lat, lng){
    var radius = $('#radius-slider').data('radius');

    var url = '/map/' + lat + '/' + lng + '/'+ radius +'/media_search.json';

    $.getJSON(url).success(function(images){
      var html = [];
      var templateString = [
        "        <div class='col-md-4 col-10-gutter'>",
        "          <div class='thumbnail' data-id='<%= image.id %>'>",
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
            url         : defaultIcon,
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

        google.maps.event.addListener(marker, 'click', markerClick); // marker click event
        // google.maps.event.addListener(marker, 'mouseover', markerHover); // marker click event

        markers.push(marker);
      });

      $('#result').prepend(html);
    });
  }

  var that;
  function markerClick(){
    if(that){that.setZIndex();}
    that = this;

    this.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

    var markerDefault = {
        url         : defaultIcon,
        origin      : new google.maps.Point(0,0),
        anchor      : new google.maps.Point(0,0),
    };

    var markerActive  = {
        url         : activeIcon,
        origin      : new google.maps.Point(0,0),
        anchor      : new google.maps.Point(0,0),
    };

    $.each(markers, function(index, marker){
      marker.setIcon(markerDefault);
    });

    this.setIcon(markerActive); 
  }

  function removeMarkers(markers){
    $.each(markers, function(id, marker){
      marker.setMap(null);
    });

    $('#result').html('');
  }

  // jQuery UI Slider
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
                removeMarkers(markers);
                fetchImage(currentLat, currentLng);
              }
    });
  });

  $('button#clear-markers').click(function(){
    removeMarkers(markers);
  });

  $('#result').on('mouseenter', '.thumbnail', function(e){
    e.preventDefault();
    var thumbnail = $(this);
    _.select(markers, function(marker) {
      if(marker.id === thumbnail.data('id')) {
        google.maps.event.trigger(marker, 'click');
      }
    });
  });

});