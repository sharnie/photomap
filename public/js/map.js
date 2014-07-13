-$(document).ready(function(){
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
        currentLat = 40.7035617;
        currentLng = -73.9883172
        initialize(currentLat, currentLng);
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
      map.setZoom(16);
      removeMarkers(markers);
    });

    google.maps.event.addListener(map, 'click', function(event){
      currentLat = event.latLng.lat();
      currentLng = event.latLng.lng();

      fetchImage(currentLat, currentLng);
    });

  }

  var markers     = [];
  var circles     = [];
  var tracker     = {};
  var defaultIcon = '/images/marker3.png';
  var activeIcon  = '/images/marker_active.png';

  function fetchImage(lat, lng){
    var radius = $('#radius-slider').data('radius');
    var url = '/map/' + lat + '/' + lng + '/'+ radius +'/media_search.json';

    removeCircles(circles);

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

        var marker_image, newMarker, searchRadius, searchRadiusOptions;

        if(!tracker.hasOwnProperty(image.id)){
          html += template({image: image});

          marker_image = {
              url         : defaultIcon,
              origin      : new google.maps.Point(0,0),
              anchor      : new google.maps.Point(0,0)
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
            center: new google.maps.LatLng(lat, lng),
            radius: radius
          };

          searchRadius = new google.maps.Circle(searchRadiusOptions);

          tracker[newMarker.id] = newMarker;
          circles.push(searchRadius);
          markers.push(newMarker);

          google.maps.event.addListener(newMarker, 'click', markerClick);
        }

      });

      $('#result').prepend(html);
    });
  }

  function markerClick(){
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

  function removeCircles(circles){
    _.each(circles, function(circle){
      circle.setMap(null);
    });
  }

  // remove all markers from map and images from sidebar
  function removeMarkers(markers){
    removeCircles(circles);

    $.each(markers, function(id, marker){
      marker.setMap(null);
    });

    $('#result').html('');

    markers.length = 0;
    tracker = {};
  }

  // call removeMarkers function and then remove markers and images
  $('button#clear-markers').click(function(){
    removeMarkers(markers);
  });

  // jQuery UI Slider
  $(function() {
    $("#slider").slider({
      range : "max",
        min : 2,
        max : 1000,
       step : 1, 
      value : 10,
      slide : function(event, ui) {
                $('#radius-slider').data('radius', ui.value);
                $("#radius").val(ui.value);
              },
     change : function(event, ui) {
                removeMarkers(markers);
                fetchImage(currentLat, currentLng);
              }
    });
  });

  // show active marker when hover image
  $('#result').on('mouseenter', '.thumbnail', function(e){
    e.preventDefault();
    var thumbnail = $(this);
    _.select(markers, function(marker) {
      if(marker.id === thumbnail.data('id')) {
        google.maps.event.trigger(marker, 'click');
      }
    });
  });

  // like and unlike image
  $('#result').on('click', '.like', function(e){
    e.preventDefault();
    var like     = $(this);
    var image_id = like.data('image-id');
    var button   = like.children('button.btn');

    if(button.hasClass('btn-like')){
      unlikeButton(button);
      
      $.getJSON('/unlike/' + image_id).fail(function(){
        likeButton(button);
        errorAlert();
      });
    } else {
      likeButton(button);

      $.getJSON('/like/' + image_id).fail(function(){
        unlikeButton(button);
        errorAlert();
      });
    }
  });

  function likeButton(element){
    element.addClass('btn-like');
  }

  function unlikeButton(element){
    element.removeClass('btn-like');
  }

  // follow and unfollow user
  $('#result').on('click', '.relationship', function(e){
    e.preventDefault();
    var button  = $(this).children('button.btn');
    var user_id = $(this).data('user-id');

    if(button.hasClass('btn-primary')){
      successButton(button);

      $.getJSON('/users/' + user_id + '/follow.json').fail(function(){
        primaryButton(button);
        errorAlert();
      });
    } else {
      primaryButton(button);

      $.getJSON('/users/' + user_id + '/unfollow.json').fail(function(){
        successButton(button);
        errorAlert();
      });
    }
  });

  // set primary button
  function primaryButton(element){
    element.addClass('btn-primary').removeClass('btn-success');
    element.html("<i class='fa fa-plus'></i> <i class='fa fa-user'></i>");
  }

  // set success button
  function successButton(element){
    element.addClass('btn-success').removeClass('btn-primary');
    element.html("<i class='fa fa-check'></i> <i class='fa fa-user'></i>");
  }

  // display error alert
  function errorAlert() {
    alert('Something went wrong. Please make sure you\'re signed in.');
  }

});