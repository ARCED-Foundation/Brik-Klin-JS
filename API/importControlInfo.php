<?php

include 'db.php'; // Include database connection

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES["csvFile"])) {
    $file = $_FILES["csvFile"]["tmp_name"];

    if (($handle = fopen($file, "r")) !== FALSE) {

        // Expected columns for kiln_harm_data
        $expected_columns = [
            'Upazila',
            'exclude'
        ];


        // Read the header row
        $header = fgetcsv($handle, 1000, ",");

        // Check if header matches expected columns
        if ($header === FALSE || array_diff($expected_columns, $header)) {
            fclose($handle);
            $conn->close();
            header("Location: indexAPI.php?error=" . urlencode("Invalid CSV file: Column headers do not match the expected format."));
            exit();
        }



        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            // Prepare data and escape
            $Upazila = $conn->real_escape_string($data[1]);
            $exclude = $conn->real_escape_string($data[8]);

            // Skip rows where Upazila is empty
            if (empty($Upazila)) {
                continue;
            }

            $sq2 = "INSERT INTO kiln_control_data (
                Upazila, exclude 
            ) VALUES (
                '$Upazila', '$exclude'
            )";

            /* $conn->query($sq2); */
            // Execute query and check for errors
            if (!$conn->query($sq2)) {
                echo "Error inserting data: " . $conn->error;
            }
        }

        fclose($handle);
        header('Location: indexAPI.php'); // Redirect back to the main page
        exit();
    } else {
        echo "Error opening the file.";
    }
} else {
    echo "No file uploaded.";
}
