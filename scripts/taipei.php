<?php

/*
 * 
 */
$basePath = dirname(__DIR__);

$tmpPath = $basePath . '/tmp';
if (!file_exists($tmpPath)) {
    mkdir($tmpPath, 0777, true);
}
$baseUrl = 'http://nominatim.openstreetmap.org/search?format=json&county=taipei&country=taiwan';
$apiUrl = 'https://www.openstreetmap.org/api/0.6/way';
$p = xml_parser_create();

$fh = fopen($basePath . '/data/taipei.csv', 'r');
fgetcsv($fh, 2048);
while ($line = fgetcsv($fh, 2048)) {
    if (empty($line[1])) {
        continue;
    }
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
    foreach ($results AS $node) {
        if ($node['osm_type'] === 'way') {
            $tmpXml = $path . '/' . $node['osm_id'] . '.xml';
            if (!file_exists($tmpXml)) {
                echo "getting {$node['osm_id']}\n";
                file_put_contents($tmpXml, file_get_contents($apiUrl . "/{$node['osm_id']}/full"));
            }
            continue;
            xml_parse_into_struct($p, file_get_contents($tmpXml), $vals);
            print_r($vals);
            exit();
        }
    }
}