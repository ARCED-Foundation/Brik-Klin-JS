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

// SQL query to fetch all data from the kiln_control_data table
$sql = "SELECT * FROM kiln_control_data";
$result = $conn->query($sql);

$features = [];

while($row = $result->fetch_assoc()){
    $feature = [
        "Upazila" => $row["Upazila"],
        "exclude" => intval($row["exclude"]),
    ];

    $features[] = $feature;
}

echo json_encode($features,  JSON_PRETTY_PRINT);

// Close the database connection
$conn->close();

/* header("Location: indexAPI.php"); // Redirect back to the main page */
exit();





