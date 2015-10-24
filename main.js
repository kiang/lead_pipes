var map, overlays, roads = {}, currentOverlayIndex = 0, markers = [], infowindow = new google.maps.InfoWindow();
yilanOverlay.prototype = new google.maps.OverlayView();
$.ajaxSetup({async: false});

function initialize() {
    /*map setting*/
    $('#map-canvas').height(window.outerHeight / 2.2);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: {lat: 25.055231, lng: 121.544263}
    });

    // Southwest(Lower Left), Northeast(Upper Right)
    var bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(24.6663844, 121.7537012),
            new google.maps.LatLng(24.6863460, 121.7828202));

    // The photograph is courtesy of the U.S. Geological Survey.
    var srcImage = 'data/yilan/5102420344871.png';

    // The custom yilanOverlay object contains the USGS image,
    // the bounds of the image, and a reference to the map.
    new yilanOverlay(bounds, srcImage, map);

    // Southwest(Lower Left), Northeast(Upper Right)
    bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(24.7403032, 121.7282697),
            new google.maps.LatLng(24.7665818, 121.7690507));

    // The photograph is courtesy of the U.S. Geological Survey.
    srcImage = 'data/yilan/5102420332171.png';

    new yilanOverlay(bounds, srcImage, map);

    // Southwest(Lower Left), Northeast(Upper Right)
    bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(24.5660414, 121.7838405),
            new google.maps.LatLng(24.6422545, 121.8939158));

    // The photograph is courtesy of the U.S. Geological Survey.
    srcImage = 'data/yilan/5102420355071.png';

    new yilanOverlay(bounds, srcImage, map);

    // Southwest(Lower Left), Northeast(Upper Right)
    bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(24.6246671, 121.7368146),
            new google.maps.LatLng(24.6706279, 121.8085777));

    // The photograph is courtesy of the U.S. Geological Survey.
    srcImage = 'data/yilan/5102420364871.png';

    new yilanOverlay(bounds, srcImage, map);

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

function yilanOverlay(bounds, image, map) {

    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;

    this.div_ = null;

    this.setMap(map);
}

yilanOverlay.prototype.onAdd = function () {

    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};

yilanOverlay.prototype.draw = function () {

    var overlayProjection = this.getProjection();

    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};

yilanOverlay.prototype.onRemove = function () {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};

google.maps.event.addDomListener(window, 'load', initialize);