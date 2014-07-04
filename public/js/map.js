$(document).ready(function(){
  // create map
  (function initialize() {
    var myLatlng = new google.maps.LatLng(-25.363882,131.044922);

    var mapOptions = {
        center            : myLatlng,
        zoom              : 12,
        mapTypeId         : google.maps.MapTypeId.ROADMAP,
        streetViewControl : false,
        mapTypeControl    : false,
        panControl        : false,
    };

    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    var marker_image = {
        url         : '/images/marker3.png',
        origin      : new google.maps.Point(0,0),
        anchor      : new google.maps.Point(0,0)
    };

    var marker = new google.maps.Marker({
        position    : myLatlng,
        map         : map,
        icon        : marker_image,
    });

    google.maps.event.addDomListener(window, 'load', initialize);

    // Create the search box and link it to the UI element.
    var input = (document.getElementById('place-search'));

    var searchBox = new google.maps.places.SearchBox((input));

    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
          return;
        }

        // fetchImage(places[0].geometry.location.k, places[0].geometry.location.A);
        map.panTo(places[0].geometry.location);
        map.setZoom(15);
    });

  })();

  // get images
  function getImages(lat, lng){
    var url = '/map/' + lat + '/' + lng + '/media_search.json';


    $.getJSON(url).success(function(response){
      var html = [];
      var templateString = [
      "        <div class='col-md-4'>",
      "          <div class='thumbnail'>",
      "            <div class='media-head'>",
      "              <img src='<%= image.low_resolution %>' alt='...'>",
      "              <span class='caption'><%= image.caption_text %></span>",
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
      "        </div><!-- col-md-6-* -->"]
      _.each(response, function(image){
        // var templateString = ('<img src="<%= low_resolution %>"/>')
        var template = _.template(templateString.join("\n"));
        html += template({image: image});
      });
      $('#result').prepend(html);
      // console.log(html.join());
    });
  }
  getImages(37.7808851, -122.3948632);


});