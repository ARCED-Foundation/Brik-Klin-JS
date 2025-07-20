<?php
include 'db.php'; // Include database connection

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES["csvFile"])) {
    $file = $_FILES["csvFile"]["tmp_name"];

    if (($handle = fopen($file, "r")) !== FALSE) {

         // Expected columns for kiln_harm_data
        $expected_columns = [
            'FID', 'Latitude (Decimal Degrees)', 'Longitude (Decimal Degrees)', 'Deaths', 'Type_correct', 'Union', 'ADM4_PCODE', 'Upazila', 'ADM3_PCODE', '_ID',
            'color', 'District', 'ADM2_PCODE', 'uid', 'Deaths', 'health_harm_index_numerical', 'NAME', 'metre_to_school',
            'metre_to_clinic', '1km_school', '1km_clinic', '2km_forest', '1km_pa', '1km_railway', '1km_wetland',
            'google_map', 'Division', 'in_paurashava', 'Deaths_10yr', 'Deaths over 10 years', 'harm_range', 'deaths_10yr_limited'
        ];


        // Read the header row
        $header = fgetcsv($handle, 1000, ",");

        // Check if header matches expected columns
        if ($header === FALSE || array_diff($expected_columns, $header) || count($header) != count($expected_columns)) {
            fclose($handle);
            $conn->close();
            header("Location: indexAPI.php?error=" . urlencode("Invalid CSV file: Column headers do not match the expected format."));
            exit();
        }
        
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            // Prepare data and escape
            $FID = $conn->real_escape_string($data[0]);
            $Latitude = $conn->real_escape_string($data[1]);
            $Longitude = $conn->real_escape_string($data[2]);
            $Deaths = $conn->real_escape_string($data[3]);
            $Type_correct = $conn->real_escape_string($data[4]);
            $Union = $conn->real_escape_string($data[5]);
            $ADM4_PCODE = $conn->real_escape_string($data[6]);
            $Upazila = $conn->real_escape_string($data[7]);
            $ADM3_PCODE = $conn->real_escape_string($data[8]);
            $_ID = $conn->real_escape_string($data[9]);
            $color = $conn->real_escape_string($data[10]);
            $District = $conn->real_escape_string($data[11]);
            $ADM2_PCODE = $conn->real_escape_string($data[12]);
            $uid = $conn->real_escape_string($data[13]);
            $Deaths_dup = $conn->real_escape_string($data[14]);
            $health_index = $conn->real_escape_string($data[15]);
            $NAME = $conn->real_escape_string($data[16]);
            $metre_school = $conn->real_escape_string($data[17]);
            $metre_clinic = $conn->real_escape_string($data[18]);
            $km_school = $conn->real_escape_string($data[19]);
            $km_clinic = $conn->real_escape_string($data[20]);
            $forest = $conn->real_escape_string($data[21]);
            $pa = $conn->real_escape_string($data[22]);
            $railway = $conn->real_escape_string($data[23]);
            $wetland = $conn->real_escape_string($data[24]);
            $google_map = $conn->real_escape_string($data[25]);
            $Division = $conn->real_escape_string($data[26]);
            $in_paurashava = $conn->real_escape_string($data[27]);
            $Deaths_10yr = $conn->real_escape_string($data[28]);
            $Deaths_over_10_years = $conn->real_escape_string($data[29]);
            $harm_range = $conn->real_escape_string($data[30]);
            $deaths_limited = $conn->real_escape_string($data[31]);

            $sql = "INSERT INTO kiln_harm_data (
                FID, Latitude, Longitude, Deaths, Type_correct, `Union`, ADM4_PCODE, Upazila, ADM3_PCODE, _ID,
                color, District, ADM2_PCODE, uid, Deaths_dup, health_harm_index_numerical, NAME, metre_to_school,
                metre_to_clinic, `1km_school`, `1km_clinic`, `2km_forest`, `1km_pa`, `1km_railway`, `1km_wetland`,
                google_map, Division, in_paurashava, Deaths_10yr, `Deaths over 10 years`, harm_range, deaths_10yr_limited
            ) VALUES (
                '$FID', '$Latitude', '$Longitude', '$Deaths', '$Type_correct', '$Union', '$ADM4_PCODE', '$Upazila', '$ADM3_PCODE', '$_ID',
                '$color', '$District', '$ADM2_PCODE', '$uid', '$Deaths_dup', '$health_index', '$NAME', '$metre_school',
                '$metre_clinic', '$km_school', '$km_clinic', '$forest', '$pa', '$railway', '$wetland',
                '$google_map', '$Division', '$in_paurashava', '$Deaths_10yr', '$Deaths_over_10_years', '$harm_range', '$deaths_limited'
            )";

            if (!$conn->query($sql)) {
                // Check for duplicate entry error (MySQL error code 1062)
                if ($conn->errno == 1062) {
                    fclose($handle);
                    $conn->close();
                    header("Location: indexAPI.php?error=" . urlencode("There is another record with the same primary key. Please delete the current data before uploading."));
                    exit();
                } else {
                    // Handle other database errors
                    fclose($handle);
                    $conn->close();
                    header("Location: indexAPI.php?error=" . urlencode("Error inserting data: " . $conn->error));
                    exit();
                }
            }
        }

        fclose($handle);
        $conn->close();
        // Redirect to index.php with success message
        header("Location: indexAPI.php");
        exit();
        
    } else {
        echo "Error opening the file.";
    }
} else {
    echo "No file uploaded.";
}
