<?php

// Database connection parameters
$host = "localhost";
$root = "root";
$pass = "";
$database = "brikklin";

$table_Control_name = "kiln_control_data"; 
$table_Info_Klin_name = "kiln_harm_data"; 

// Create connection
$conn = new mysqli($host, $root, $pass , $database);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

