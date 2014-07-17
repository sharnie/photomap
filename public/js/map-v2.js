$(document).ready(function(){
  var map,
      currentLat,
      currentLng,
      radius = $('#radius-slider').data('radius');

  var Map = {
    getUserLocation: function() {
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(Map.setUserLocation, Map.getError);
      } else { 
        alert("Geolocation is not supported by this browser.");
      }
    },
    setUserLocation: function(position) {
      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;

      Map.initialize(currentLat, currentLng, radius);
    },
    getError: function(error) {
      switch(error.code){
        case error.PERMISSION_DENIED:
          currentLat = 40.7035617;
          currentLng = -73.9883172
          Map.initialize(currentLat, currentLng, radius);
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
    initialize: function(currentLat, currentLng, radius) {
      var center     = new google.maps.LatLng(currentLat, currentLat, radius);

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
          center                : center,
          zoom                  : 18,
          mapTypeId             : google.maps.MapTypeId.ROADMAP,
          streetViewControl     : false,
          mapTypeControl        : false,
          panControl            : false,
          disableDoubleClickZoom: true,
      };

      map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

      Map.fetchImage(currentLat, currentLng, radius);
    },
    fetchImage: function(currentLat, currentLng, radius) {
      var url             = '/map/' + currentLat + '/' + currentLng + '/'+ radius +'/media_search.json',
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
          html += template({image: image});
        });

        result.prepend(html);
      });
    },
  }

  Map.getUserLocation();

});