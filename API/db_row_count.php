<?php
include 'db.php';

// Function to get the row count of a table

function getRowCount($conn , $tablename){
    $sql = "SELECT COUNT(*) AS TOTAL FROM $tablename";
    $result = $conn->query($sql);
    if($result){
        $row = $result->fetch_assoc();
        return $row['TOTAL'];
    } else {
        return "Error: " . $conn->error;
    }
}


// Get row counts for both tables
$klin_info_count_row = getRowCount($conn, $table_Info_Klin_name);
$control_info_count_row = getRowCount($conn, $table_Control_name);

$conn->close();
























?>