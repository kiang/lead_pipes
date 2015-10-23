<?php

/*
 * ref http://logbot.g0v.tw/channel/g0v.tw/2015-10-21
 * raw https://gist.github.com/audreyt/435dd6f7996ea7547f41
 * 
 * require php5-geos (Ubuntu 15.04)
 * 
 */
$basePath = dirname(__DIR__);
include_once($basePath . '/libs/geoPHP/geoPHP.inc');
include_once(__DIR__ . '/functions.php');

$tmpPath = $basePath . '/tmp';
if (!file_exists($tmpPath)) {
    mkdir($tmpPath, 0777, true);
}
/*
 * ref http://wiki.openstreetmap.org/wiki/Nominatim
 */
$baseUrl = 'http://nominatim.openstreetmap.org/search?format=json&county=taipei&country=taiwan';
/*
 * ref http://wiki.openstreetmap.org/wiki/API_v0.6
 */
$apiUrl = 'https://www.openstreetmap.org/api/0.6/way';

$fc = new stdClass();
$fc->type = 'FeatureCollection';
$fc->properties = array(
    'missing' => array(),
);
$fc->features = array();

$fh = fopen($basePath . '/data/taipei.csv', 'r');
fgetcsv($fh, 2048);
while ($line = fgetcsv($fh, 2048)) {
    if (empty($line[1])) {
        continue;
    }
    $line1 = $line[1];
    $line[1] = substr($line[1], 9);
    $pos = strpos($line[1], '區') + 3;
    $city = substr($line[1], 0, $pos);
    $street = substr($line[1], $pos);
    $url = $baseUrl . '&city=' . urlencode($city) . '&street=' . urlencode($street);
    $path = $tmpPath . "/taipei/{$city}";
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }
    $tmpFile = $path . '/' . $street . '.json';
    if (!file_exists($tmpFile)) {
        file_put_contents($tmpFile, file_get_contents($url));
    }
    echo "{$tmpFile}\n";
    $results = json_decode(file_get_contents($tmpFile), true);
    $osmLines = $osmId = array();
    foreach ($results AS $node) {
        if ($node['osm_type'] === 'way') {
            $osmId[] = $node['osm_id'];
            $tmpXml = $path . '/' . $node['osm_id'] . '.xml';
            if (!file_exists($tmpXml)) {
                echo "getting {$node['osm_id']}\n";
                file_put_contents($tmpXml, file_get_contents($apiUrl . "/{$node['osm_id']}/full"));
            }
            $osmLines[] = new LineString(extractLines(file_get_contents($tmpXml)));
        }
    }
    if (!empty($osmLines)) {
        $f = new stdClass();
        $f->type = 'Feature';
        $f->properties = array(
            'title' => $line1,
            'meters' => intval($line[2]),
            'bolts' => intval($line[3]),
            'osm_id' => implode(',', $osmId),
        );
        $f->geometry = new stdClass();
        $f->geometry->type = 'GeometryCollection';
        $f->geometry->geometries = array();
        foreach ($osmLines AS $osmLine) {
            $f->geometry->geometries[] = json_decode($osmLine->out('json'));
        }
        $fc->features[] = $f;
    } else {
        $fc->properties['missing'][] = "{$line1} ({$line[2]}公尺, {$line[3]}個栓)";
    }
}
fclose($fh);

file_put_contents($basePath . '/data/taipei.json', json_encode($fc, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
