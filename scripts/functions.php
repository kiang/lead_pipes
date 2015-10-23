<?php

function extractLines($xml) {
    $p = xml_parser_create();
    xml_parse_into_struct($p, $xml, $vals, $index);
    xml_parser_free($p);
    $linePoints = $points = array();
    if (!empty($index['NODE'])) {
        foreach ($index['NODE'] AS $nIdx) {
            if (isset($vals[$nIdx]['attributes']['LAT'])) {
                $points[$vals[$nIdx]['attributes']['ID']] = new Point($vals[$nIdx]['attributes']['LON'], $vals[$nIdx]['attributes']['LAT']);
            }
        }
    }
    if (!empty($index['ND'])) {
        foreach ($index['ND'] AS $ndIdx) {
            if (isset($vals[$ndIdx]['attributes']['REF'])) {
                $linePoints[] = $points[$vals[$ndIdx]['attributes']['REF']];
            }
        }
    }
    return $linePoints;
}
