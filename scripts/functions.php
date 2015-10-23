<?php

function extractLines($xml) {
    $p = xml_parser_create();
    xml_parse_into_struct($p, $xml, $vals, $index);
    xml_parser_free($p);
    $linePoints = $points = array();
    if (!empty($index['TAG'])) {
        foreach ($index['TAG'] AS $nIdx) {
            switch ($vals[$nIdx]['attributes']['K']) {
                case 'building':
                    if ($vals[$nIdx]['attributes']['V'] === 'yes') {
                        return array();
                    }
                    break;
                case 'name:zh':
                    if (false !== strpos($vals[$nIdx]['attributes']['V'], '巷')) {
                        return array();
                    }
                    break;
                case 'addr:full':
                    if (false !== strpos($vals[$nIdx]['attributes']['V'], '號') || false !== strpos($vals[$nIdx]['attributes']['V'], '巷')) {
                        return array();
                    }
                    break;
            }
        }
    }
    if (!empty($index['NODE'])) {
        foreach ($index['NODE'] AS $nIdx) {
            if (isset($vals[$nIdx]['attributes']['LAT'])) {
                $points[$vals[$nIdx]['attributes']['ID']] = new Point($vals[$nIdx]['attributes']['LON'], $vals[$nIdx]['attributes']['LAT']);
            }
        }
    }
    if (!empty($index['ND'])) {
        foreach ($index['ND'] AS $nIdx) {
            if (isset($vals[$nIdx]['attributes']['REF'])) {
                $linePoints[] = $points[$vals[$nIdx]['attributes']['REF']];
            }
        }
    }
    return $linePoints;
}
