<?php

// Database include
include 'db.php';

// Sql query to delete all data from the kiln_control_data table
$sql = "DELETE FROM $table_Control_name";
$conn->query($sql);
$conn->close();
header('Location: indexAPI.php'); // Redirect back to the main page
exit();
?>