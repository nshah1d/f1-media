<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

$CHANNELS = [
    'formula1'           => 'UCd8iY-kEHtaB8qt8MH--zGw',
    'lollipopman'        => 'UCvBO5Do9eiSDVY3qY7tfX7A',
    'mattamys'           => 'UCxRoe4rs5xt8tbOCv3gKa4w',
    'p1mattandtommy'     => 'UCD5jAyCSDRR5yTgswfDbK8w',
    'joshrevell'         => 'UCaKupPt0SQL8HHb2zc8ViKA',
    'rocketpoweredmohawk'=> 'UCDhkOEABmUZRJhF_YCzei2w',
    'tommo'              => 'UCFHaLSX-Kqy5pGTszklkE8w',
    'fullthrottlef1'     => 'UC-XWVIsxzHo905JK7_PPONA',
    'boxboxstories'      => 'UCItL2cz3kxhc4mzL1dYmgIQ',
    'conormooref1'       => 'UCRYClabiIIzeBNOimosroYg',
    'wtf1'               => 'UCuAUcrYMQzwmb-n61Ep_qKA',
    'jackbuzzaf1'        => 'UC9tSfEsRzj_3TkKWrtqXFMA',
    'driver61'           => 'UCtbLA0YM6EpwUQhFUyPQU9Q',
    'topgear'            => 'UCjOl2AUblVmg2rA_cRgZkFg',
    'thegrandtour'       => 'UCZ1Sc5xjWpUnp_o_lUTkvgQ',
    'drivetribe'         => 'UChiwLDIBJrV5SxqdixMHmQA',
    'mrjww'              => 'UCK_zuVq6ZpSRMjsZ5JRPx5g',
    'seenthroughglass'   => 'UCrBr8w4ki1xAcQ1JVDp_-Fg',
    'shmee150'           => 'UCIRgR4iANHI2taJdz8hjwLw',
    'supercarblondie'    => 'UCKSVUHI9rbbkXhvAXK-2uxA',
    'supercarsoflondon'  => 'UCyoSWGYKkusssZWzRrsX4RA',
    'carfection'         => 'UCwuDqQjo53xnxWKRVfw_41w',
    'donutmedia'         => 'UCL6JmiMXKoXS6bpP1D3bk8g',
    'carwow'             => 'UCUhFaUpnq31m6TNX2VKVSVA',
    'autotrader'         => 'UC5XoIXdf_zeLvaBG3jErFkw',
    'matarmstrong'       => 'UCD8yQ79h1BYvR_vkDAnqbzg',
    'pushinpistons'      => 'UCyC9NivN2P4aVDUhSmOoYGg',
    'throttlehouse'      => 'UCyXiDU5qjfOPxgOPeFWGwKw',
    'mrwhosetheboss'     => 'UCMiJRAwDNSNzuYeN2uWa0pA',
    'jerryrigeverything' => 'UCWFKCr40YwOZQx8FHU_ZqqQ',
    'mkbhd'              => 'UCBJycsmduvYEL83R_U4JriQ',
    'thestudio'          => 'UCG7J20LhUeLl6y_Emi7OJrA',
    'techshottg'         => 'UCs6EmLAT4lTWwCSJRgbbchQ',
    'fireship'           => 'UCsBjURrPoezykLs9EqgamOA',
    'networkchuck'       => 'UC9x0AN7BWHpCDHSm9NiJFJQ',
    'linustechtips'      => 'UCXuqSBlHAE6Xw-yeJA0Tunw',
    'austinev'           => 'UCXGgrKt94gR6lmN4aN3mYTg',
    'dave2d'             => 'UC1PZXJzeGNUUWFNSldidkpX',
    'techquickie'        => 'UC0vBXGSyV14uvJ4hECDOl0Q',
    'cleoabram'          => 'UC415bOPUcGSamy543abLmRA',
    'therestisscience'   => 'UCThg2IH7bNbIQF0hmXA9ECw',
    'markrober'          => 'UCY1kMZp36IQSyNx_9h4mpCg',
    'nilered'            => 'UCFhXFikryT4aFcLkLw2LBLA',
    'hankgreen'          => 'UC_dvqFmaVUj16kRKSLYBaSw',
    'veritasium'         => 'UCHnyfMqiRRG1u-2MsSQLbXA',
    'kurzgesagt'         => 'UCsXVk37bltHxD1rDPwtNM8Q',
    'vsauce'             => 'UC6nSFpj9HTCZ5t-N3Rm3-HA',
    'astrum'             => 'UC-9b7aDP6ZN0coj9-xFnrtw',
    'tomscott'           => 'UCBa659QWEk1AI4Tg--mrJ2A',
    'computerphile'      => 'UC9-y-6csu5WGm29I7JiwpnA',
    'smartereveryday'    => 'UC6107grRI4m0o2-emgoDnAA',
    'realengineering'    => 'UCR1IuLEqb6UEA_zQ81kwXfg',
    'wendover'           => 'UC9RM-iSvTu1uPJb8X5yp3EQ',
    'pbsspacetime'       => 'UC7_gcs09iThXybpVgjHZ_7g',
    'scishow'            => 'UCZYTClx2T1of7BRZ86-8fow',
    'cgpgrey'            => 'UC2C_jShtL725hvbm1arSV9w',
    'primer'             => 'UCL7DDQWP6x7wy0O6L5ZIgxg',
    'thegoldenbalance'   => 'UCsEmkNdR_HQ_INJd_M9lULQ',
    'mrnigelng'          => 'UCVjlpEjEY9GpksqbEesJnNA',
    'gugafoods'          => 'UCfE5Cz44GlZVyoaYTHJbuZw',
    'chefrush'           => 'UCOrCugMRzX49mVUjM2jEu9w',
    'nickdigiovanni'     => 'UCMyOj6fhvKFMjxUCp3b_3gA',
    'gordonramsay'       => 'UCIEv3lZ_tNXHzL3ox-_uUGQ',
    'joshuaweissman'     => 'UChBEbMKI1eCcejTtmI32UEw',
    'albertcancook'      => 'UClDX61BihgrRt0HRXW1PbCQ',
    'babish'             => 'UCkRklKNxteF8mc0l1GAnNHQ',
    'bayashitv'          => 'UCCI3m8mGLZQiDx4D9ZX8UiQ',
    'maxthemeatguy'      => 'UC_pT_Iz6XjuM-eMTlXghdfw',
    'mythicalkitchen'    => 'UCXGR70CkW_pXb8n52LzCCRw',
    'zachchoi'           => 'UCI78AdiI6f7VKhqW1i4B3Rw',
    'samthecookingguy'   => 'UCbRj3Tcy1Zoz3rcf83nW5kw',
    'sortedfood'         => 'UCfyehHM_eo4g5JUyWmms2LA',
    'firstwefeast'       => 'UCPD_bxCRGpmmeQcbe2kpPaA',
    'andycooks'          => 'UCB2kVwJM7adiyjbssntEaUQ',
    'ethanc'             => 'UCDq5v10l4wkV5-ZBIJJFbzQ',
    'ordinarysausage'    => 'UCJLKwTg0IaSMoq6hLHT3CAA',
    'amauryguichon'      => 'UC0fvGpDXi7sV2hbgD-O47yw',
    'startalk'           => 'UCqoAEDirJPjEUFcF2FklnBA',
    'itstherespawn'      => 'UCqygaV0tqBVDBBverQrv74g',
    'dailymail'          => 'UCw3fku0sH3qA3c3pZeJwdAw',
    'gameranx'           => 'UCNvzD7Z-g64bPXxGzaQaa4g',
    'ign'                => 'UCKy1dAqELo0zrOtPkf0eTMw',
    'thespiffingbrit'    => 'UCRHXUZ0BxbkU2MYZgsuFgkQ',
    'letsgameitout'      => 'UCto7D1L-MiRoOziCXK9uT5Q',
    'vivaladirtleague'   => 'UCchBatdUMZoMfJ3rIzgV84g',
    'jacksepticeye'      => 'UCYzPXprvl5Y-Sf0g4vX-m6g',
    'lazarbeam'          => 'UCw1SQ6QRRtfAhrN_cjkrOgA',
    'gamespot'           => 'UCbu2SsF-Or3Rsn3NxqODImw',
    'theradbrad'         => 'UCpqXJOEqGS-TCnazcHCo0rA',
    'playstation'        => 'UC-2Y8dQb0S6DtpxNgAKoJKA',
    'xbox'               => 'UCjBp_7RuDBUYbd1LegWEJ8g',
    'nintendo'           => 'UCGIY_O-8vW4rfX98KlMkvRg',
    'scotthewoz'         => 'UC4rqhyiTs7XyuODcECvuiiQ',
    'lawbymike'          => 'UCKmmERguliWTynG9OIoDhDw',
    'alanchikichow'      => 'UC5gxP-2QqIh_09djvlm9Xcg',
    'mrbeast'            => 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    'loljustforlaughs'   => 'UCZnlRhSFoDwlKhJYH0aeXMw',
    'zackdfilms'         => 'UC01TG9YRWZWY1dXNVRmMVJD',
    'daniellabelle'      => 'UCb8vrqP8Z7Oz9ZTYvUtjUHQ',
    'howridiculous'      => 'UC5f5IV0Bf79YLp_p9nfInRA',
    'taskmaster'         => 'UCT5C7yaO3RVuOgwP8JVAujQ',
    'sidmenshorts'       => 'UCbAZH3nTxzyNmehmTUhuUsA',
    'crackermilk'        => 'UCMn-zv1SE-2y6vyewscfFqw',
    'dropout'            => 'UCPDXXXJj9nax0fr0Wfc048g',
    'goodmythicalmorning'=> 'UC4PooiX37Pld1T8J5SYT-SQ',
    'gqvideos'           => 'UCsEukrAd64fqA7FjwkmZ_Dw',
    'calmlings'          => 'UCUe_aQGTkLRqJEiEcv7uExA',
    'bruhzen'            => 'UCk0IgUcegwHnWrijGBe5CaA',
    'naturalhabitatshorts'=> 'UCSb_Sui6FBxVS4_ROsrU_Iw',
    'corridorcrew'       => 'UCSpFnDQr88xCZ80N-X7t0nQ',
    'ryantrahan'         => 'UCaa3j6OXRZWCu0mq7S1zK9g',
    'nathanespinoza'     => 'UCkSVnUZq3q14lVajaQAlLpA',
    'dillybydally'       => 'UCKo4wcpkMw1foR5bMjRSLuA',
    'goharsguide'        => 'UCPk2s5c4R_d-EUUNvFFODoA',
    'yestheory'          => 'UCvK4bOhULCpmLabd2pDMtnA',
    'drewbinsky'         => 'UC0Ize0RLIbGdH5x4wI45G-A',
    'geowizard'          => 'UCW5OrUZ4SeUYkUg1XqcjFYA',
    'karaandnate'        => 'UC4ijq8Cg-8zQKx8OH12dUSw',
    'baldandbankrupt'    => 'UCxDZs_ltFFvn0FDHT6kmoXA',
    'indigotraveller'    => 'UCXulruMI7BHj3kGyosNa0jA',
    'abroadinjapan'      => 'UC1VNU9hZDBwRHNtUSIyQUpw',
    'rottentomatoes'     => 'UC1BaE03VkdnWklzOWFDSzFw',
    'kinocheck'          => 'UCOL10n-as9dXO2qtjjFUQbQ',
    'netflix'            => 'UCWOA1ZGywLbqmigxE4Qlvuw',
    'primevideo'         => 'UCQJWtTnAHhEG5w4uN0udnUQ',
    'marvel'             => 'UC0PTC3Ow9dRMrBDvivhS5fQ',
    'starwars'           => 'UCZGYJFUizSax-yElQaFDp5Q',
    'warnerbros'         => 'UC596ztU2h-DMmABuL5B4V_w',
    'universalpictures'  => 'UCq0OueAsdxH6b8nyAspwViw',
    'aljazeera'          => 'UCNye-wNBqNL5ZzHSJj3l8Bg',
    'nowthis'            => 'UC1acS1ETWVVRXBZRGh3YWNE',
    'bbcnews'            => 'UC16niRr50-MSBwiO3YDb3RA',
    'abcnews'            => 'UCBi2mrWuNuyYy4gbM6fU18Q',
    'skynews'            => 'UCoMdktPbSTixAyNGwb-UYkQ',
    'ndtv'               => 'UCZFMm1mMw0F81Z37aaEzTUA',
    'euronews'           => 'UCSrZ3UV4jOidv8ppoVuvW9Q',
    'abpnews'            => 'UCRWFSbif-RFENbBrSiez1DA',
    'thenationaluae'     => 'UC6V13T-dU0k5ixFo6lgOpHg',
    'scrolldeep'         => 'UCSgTfFfu6aBjl7S5i0Tx1zg',
    'dylanpage'          => 'UCzPpbeK8ANcNKg5aoMB0miw',
    'richardsales'       => 'UCysVG_DvoO0Wm4Iw-I3KoXA',
    'jordanthestallion'  => 'UC9PY_s84IkOV_MJwEL70sfQ',
    'geographykingdom'   => 'UCbRIGSg_uJjoaxDY-7w7NyA',
    'natgeo'             => 'UCpVm7bg6pXKo1Pr6k5kxG9A',
    'primaxanimations'   => 'UCfEKkJ1Ermawd8BhByORyEg',
    'bloombergoriginals' => 'UCUMZ7gohGI9HcU9VNsr2FJQ',
    'jonathanross'       => 'UCgurmV2nVq_1DUb2pvGOKmg',
    'grahamnorton'       => 'UC4PziMH5MvvsmqM0VCZTy-g',
    'snl'                => 'UCqFzWxSCi39LnW1JKFR3efg',
    'jimmycarr'          => 'UCf9BO33b-MnIxB5y0azrxmg',
    'qielves'            => 'UCe6ye3l9WA4SdNkqgs0YeMA',
    'comedycentral'      => 'UCUsN5ZwHx2kILm84-jPDeXw',
];

$channelKey = trim($_GET['channel'] ?? '');

if (!isset($CHANNELS[$channelKey])) {
    http_response_code(400);
    exit(json_encode(['error' => 'invalid_channel']));
}

$channelId = $CHANNELS[$channelKey];

$cacheKey  = preg_replace('/[^a-zA-Z0-9_]/', '', 'yt_' . $channelKey);
$cacheFile = sys_get_temp_dir() . '/entbunker_' . $cacheKey . '.json';
$ttl       = 3600;

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
    exit(file_get_contents($cacheFile));
}

$feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' . urlencode($channelId);

$ctx = stream_context_create([
    'http' => [
        'method'        => 'GET',
        'header'        => 'User-Agent: EntertainmentBunker/1.0 (private)',
        'timeout'       => 10,
        'ignore_errors' => true,
    ],
    'ssl' => ['verify_peer' => true],
]);
$raw = @file_get_contents($feedUrl, false, $ctx);

if ($raw === false) {
    exit(json_encode(['videos' => []]));
}

$status = $http_response_header[0] ?? '';
if (!str_contains($status, '200')) {
    exit(json_encode(['videos' => []]));
}

libxml_use_internal_errors(true);
$xml = simplexml_load_string($raw);
if (!$xml) {
    exit(json_encode(['videos' => []]));
}

$videos = [];
foreach ($xml->entry as $entry) {
    $ns      = $entry->children('http://www.youtube.com/xml/schemas/2015');
    $videoId = (string)($ns->videoId ?? '');
    if (!$videoId) continue;

    $mediaNs   = $entry->children('http://search.yahoo.com/mrss/');
    $thumbnail = '';
    if (isset($mediaNs->group->thumbnail)) {
        $attrs     = $mediaNs->group->thumbnail->attributes();
        $thumbnail = (string)($attrs['url'] ?? '');
    }

    $videos[] = [
        'id'          => 'yt_' . $videoId,
        'type'        => 'youtube',
        'videoId'     => $videoId,
        'title'       => (string)($entry->title ?? ''),
        'channelName' => $channelKey,
        'channelId'   => $channelId,
        'thumbnail'   => $thumbnail,
        'published'   => (string)($entry->published ?? ''),
    ];
}

$response = json_encode(['videos' => array_slice($videos, 0, 15)]);
file_put_contents($cacheFile, $response);
exit($response);
