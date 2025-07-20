<?php

// Database include
include 'db.php';

// SQL query to delete all data from the kiln_info table
$sql = "DELETE FROM $table_Info_Klin_name";
$conn->query($sql);
$conn->close();
header('Location: indexAPI.php'); // Redirect back to the main page
exit();
?>