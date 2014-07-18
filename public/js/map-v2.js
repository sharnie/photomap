$(document).ready(function(){
  var map,
      currentLatitude,
      currentLongitude,
      radius      = $('#radius-slider').data('radius'),
      markers     = [],
      circles     = [],
      markerTracker     = {},
      defaultIcon = '/images/marker3.png',
      activeIcon  = '/images/marker_active.png';

  var Map = {
    getUserLocation: function() {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(Map.setUserLocation, Map.getError);
      } else { 
        alert("Geolocation is not supported by this browser.");
      }
    },
    setUserLocation: function(position) {
      currentLatitude = position.coords.latitude;
      currentLongitude = position.coords.longitude;

      // Map.initialize(currentLatitude, currentLongitude, radius);
    },
    getError: function(error) {
      switch(error.code){
        case error.PERMISSION_DENIED:
          currentLatitude = 40.7035617;
          currentLongitude = -73.9883172
          Map.initialize(currentLatitude, currentLongitude, radius);
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
    },
    initialize: function(currentLatitude, currentLongitude, radius){
      var Latlng = new google.maps.LatLng(currentLatitude, currentLongitude);

      var styles     = [
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
        },
        {
          featureType: "water",
          elementType: "fill",
          stylers: [
            { color: "#81C9EA" }
          ]
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [
            { visibility: "off" }
          ]
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [
            { color: "#ffffff" }
          ]
        },
        {
          featureType: "administrative.province",
          elementType: "labels.text.fill",
          stylers: [
            { color: "#ffffff" }
          ]
        },
        {
          featureType: "administrative.province",
          elementType: "labels.text.stroke",
          stylers: [
            { visibility: "off" }
          ]
        }
      ];

      var mapOptions = {
          styles                : styles,
          center                : Latlng,
          zoom                  : 18,
          mapTypeId             : google.maps.MapTypeId.ROADMAP,
          streetViewControl     : false,
          mapTypeControl        : false,
          panControl            : false,
          disableDoubleClickZoom: true,
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

      Map.fetchImage(currentLatitude, currentLongitude, radius);

      Map.placesChangedEvent();
      Map.mapClickEvent();

    },
    fetchImage: function(currentLatitude, currentLongitude, radius) {
      var url    = '/map/'+ currentLatitude +'/'+ currentLongitude +'/'+ radius +'/media_search.json',
          result = $('#result');

      $.getJSON(url).success(function(images){
        var html = [];

        _.each(images, function(image){
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
            "                      <a class='bold username text-ellipsis' href='http://instagram.com/<%= image.user.username %>' target='_blank'><%= image.user.username %></a>",
            "                      <p class='text-ellipsis'><%= image.user.full_name %></p>",
            "                    </div>",
            "                  </div><!-- .media -->",
            "                </div><!-- .row -->",
            "              </div><!-- .col-xs-* -->",
            "              <div class='col-xs-4'>",
            "                <div class='row'>",
            "                  <div class='pull-right like' data-image-id='<%= image.id %>'>",
            "                    <% if(image.user_has_liked) { %>",
            "                      <button class='btn btn-default btn-like'>",
            "                        <i class='fa fa-heart'></i>",
            "                      </button>",
            "                    <% } else { %>",
            "                      <button class='btn btn-default'>",
            "                        <i class='fa fa-heart'></i>",
            "                      </button>",
            "                    <% } %>",
            "                  </div>",
            "                </div>",
            "              </div>",
            "            </div><!-- .caption -->",
            "          </div><!-- .thumbnail -->",
            "        </div><!-- col-md-6-* -->"
          ];

          var template = _.template(templateString.join("\n"));

          var marker_image,
              newMarker,
              searchRadius,
              searchRadiusOptions;

          if(!markerTracker.hasOwnProperty(image.id)){

              html += template({image: image});

              marker_image = {
                url         : defaultIcon,
                origin      : new google.maps.Point(0,0),
                anchor      : new google.maps.Point(0,0),
              };

              newMarker = new google.maps.Marker({
                id          : image.id,
                position    : new google.maps.LatLng(image.latitude, image.longitude),
                map         : map,
                icon        : marker_image,
                clickable   : true,
                visible     : true,
              });

              searchRadiusOptions = {
                strokeColor: '#81C9EA',
                strokeOpacity: 0.08,
                strokeWeight: 1,
                fillColor: '#81C9EA',
                fillOpacity: 0.03,
                map: map,
                center: new google.maps.LatLng(currentLatitude, currentLongitude),
                radius: radius,
              };

              searchRadius = new google.maps.Circle(searchRadiusOptions);

              markerTracker[newMarker.id] = newMarker;
              circles.push(searchRadius);
              markers.push(newMarker);

              // google.maps.event.addListener(newMarker, 'click', Map.markerClickEvent(newMarker));
          }

        }); // _.each

        result.prepend(html);
      }); // $.getJSON
    },
    mapClickEvent: function() {
      google.maps.event.addListener(map, 'click', function(event){
        currentLatitude = event.latLng.lat();
        currentLongitude = event.latLng.lng();

        Map.fetchImage(currentLatitude, currentLongitude, radius);
      });
    },
    placesChangedEvent: function() {
      // Create the search box and link it to the UI element.
      var input = (document.getElementById('place-search'));
      var searchBox = new google.maps.places.SearchBox((input));

      google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {return;}

        currentLatitude  = places[0].geometry.location.k;
        currentLongitude = places[0].geometry.location.B;

        // $.getJSON('/map/' + currentLatitude + '/' + currentLongitude + '/locations.json').success(function(data){
        //   console.log(data);
        //   console.log('worked');
        // });

        Map.fetchImage(currentLatitude, currentLongitude, radius);

        map.panTo(places[0].geometry.location);
        map.setZoom(16);
        // removeMarkers(markers);

      });
    },
    markerClickEvent: function(marker) {

      console.log(marker);
      // this.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);

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

      // this.setIcon(markerActive);

      var _this      = this;
      var thumbnails = $('.thumbnail');

      _.find(thumbnails, function(thumbnail){
        if($(thumbnail).hasClass('active')){
          $(thumbnail).removeClass('active')
        }
      });

      _.find(thumbnails, function(thumbnail){
        if($(thumbnail).data('id') === _this.id){
          $(thumbnail).addClass('active');
        }
      });

    }
  }

  Map.initialize(40.7035617, -73.9883172, 5);

});