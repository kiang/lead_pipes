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
$apiUrl = 'https://www.openstreetmap.org/api/0.6/way/{id}/full';

$fh = fopen($basePath . '/data/taipei.csv', 'r');
fgetcsv($fh, 2048);
while ($line = fgetcsv($fh, 2048)) {
    if(empty($line[1])) {
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
    $results = json_decode(file_get_contents($tmpFile), true);
}