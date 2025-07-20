<?php

// Allow requests from your front-end origin
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
// Allow GET requests
header('Access-Control-Allow-Methods: GET');
// Set JSON content type
header('Content-Type: application/json');
// Include database connection
header('Content-Type: application/json');

include 'db.php';


// SQL query to fetch all data from the kiln_harm_data table
$sql = "SELECT * FROM kiln_harm_data";
$result = $conn->query($sql);

$features = [];

while ($row = $result->fetch_assoc()) {
    $feature = [
        "type" => "Feature",
        "geometry" => [
            "type" => "Point",
            "coordinates" => [
                floatval($row["Longitude"]),
                floatval($row["Latitude"])
            ]
        ],
        "properties" => [
            "FID" => intval($row["FID"]),
            "Deaths" => floatval($row["Deaths"]),
            "Type_correct" => $row["Type_correct"],
            "Union" => $row["Union"],
            "ADM4_PCODE" => $row["ADM4_PCODE"],
            "Upazila" => $row["Upazila"],
            "ADM3_PCODE" => $row["ADM3_PCODE"],
            "_ID" => intval($row["_ID"]),
            "color" => $row["color"],
            "District" => $row["District"],
            "ADM2_PCODE" => $row["ADM2_PCODE"],
            "uid" => intval($row["uid"]),
            "health_harm_index_numerical" => floatval($row["health_harm_index_numerical"]),
            "NAME" => $row["NAME"],
            "metre_to_school" => floatval($row["metre_to_school"]),
            "metre_to_clinic" => floatval($row["metre_to_clinic"]),
            "1km_school" => $row["1km_school"],
            "1km_clinic" => $row["1km_clinic"],
            "2km_forest" => $row["2km_forest"],
            "1km_pa" => $row["1km_pa"],
            "1km_railway" => $row["1km_railway"],
            "1km_wetland" => $row["1km_wetland"],
            "google_map" => $row["google_map"],
            "Division" => $row["Division"],
            "in_paurashava" => $row["in_paurashava"],
            "Deaths_10yr" => floatval($row["Deaths_10yr"]),
            "Deaths over 10 years" => $row["Deaths over 10 years"],
            "harm_range" => $row["harm_range"],
            "deaths_10yr_limited" => floatval($row["deaths_10yr_limited"])
        ]
    ];

    $features[] = $feature;
}

$geojson = [
    "type" => "FeatureCollection",
    "features" => $features
];

echo json_encode($geojson, JSON_PRETTY_PRINT);
