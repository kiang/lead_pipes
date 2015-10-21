var map, overlays, roads, currentOverlayIndex = 0, markers = [], infowindow = new google.maps.InfoWindow();
$.ajaxSetup({async: false});

function initialize() {
    /*map setting*/
    $('#map-canvas').height(window.outerHeight / 2.2);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: {lat: 25.055231, lng: 121.544263}
    });

    $.getJSON('data/taipei.json', function (data) {
        roads = map.data.addGeoJson(data);
    });

    map.data.addListener('mouseover', function (event) {
        var title = event.feature.getProperty('title') + ': ' + event.feature.getProperty('meters') + '公尺, ' + event.feature.getProperty('bolts') + '個栓';
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {fillColor: 'white'});
        $('#content').html('<div>' + title + '</div>').removeClass('text-muted');
    });

    map.data.addListener('mouseout', function (event) {
        map.data.revertStyle();
        $('#content').html('在地圖上滑動可以顯示資訊').addClass('text-muted');
    });
}

google.maps.event.addDomListener(window, 'load', initialize);