var map, overlays, roads = {}, currentOverlayIndex = 0, markers = [], infowindow = new google.maps.InfoWindow();
$.ajaxSetup({async: false});

function initialize() {
    /*map setting*/
    $('#map-canvas').height(window.outerHeight / 2.2);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: {lat: 25.055231, lng: 121.544263}
    });

    $.getJSON('data/taipei.json', function (data) {
        roads.taipei = data;
        map.data.addGeoJson(roads.taipei);
    });

    $.getJSON('data/new_taipei.json', function (data) {
        roads.new_taipei = data;
        map.data.addGeoJson(roads.new_taipei);
    });

    map.data.addListener('mouseover', function (event) {
        var title = event.feature.getProperty('title') + ': ' + event.feature.getProperty('meters') + '公尺, ' + event.feature.getProperty('bolts') + '個栓';
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {fillColor: 'white'});
        $('#content').html('<div>' + title + '</div>').removeClass('text-muted');
    });

    map.data.addListener('click', function (event) {
        var osmId = event.feature.getProperty('osm_id').split(',');
        var body = '<div>鉛管長度： ' + event.feature.getProperty('meters') + ' 公尺</div>';
        body += '<div>水栓數量： ' + event.feature.getProperty('bolts') + ' 個</div>';
        body += '<div>OpenStreetMap 圖資：<ul>';
        for (k in osmId) {
            body += '<li><a href="http://www.openstreetmap.org/way/' + osmId[k] + '" target="_blank">' + osmId[k] + '</a></li>';
        }
        body += '</ul></div>';
        $('#pipeModalLabel').html(event.feature.getProperty('title'));
        $('#pipeModalBody').html(body);
        $('#pipeModal').modal('show');
    });

    map.data.addListener('mouseout', function (event) {
        map.data.revertStyle();
        $('#content').html('在地圖上滑動可以顯示資訊').addClass('text-muted');
    });

    if (roads.taipei.properties.missing || roads.new_taipei.properties.missing) {
        var note = '<li>下面資料配對失敗而無法在地圖呈現<ul>';
        for (k in roads.taipei.properties.missing) {
            note += '<li>' + roads.taipei.properties.missing[k] + '</li>';
        }
        for (k in roads.new_taipei.properties.missing) {
            note += '<li>' + roads.new_taipei.properties.missing[k] + '</li>';
        }
        note += '</ul></li>';
        $('ul', $('#dangerBody')).append(note);
    }


}

google.maps.event.addDomListener(window, 'load', initialize);