<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSV to Database</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
</head>

<body>

    <?php
    // Check for message or error and trigger alert popup coming from other scripts
    if (isset($_GET['message'])) {
        $message = htmlspecialchars($_GET['message']);
        echo "<script>alert('$message');</script>";
    } elseif (isset($_GET['error'])) {
        $error = htmlspecialchars($_GET['error']);
        echo "<script>alert('Error: $error');</script>";
    }
    ?>

    <!--------------------------------------------------------------------- Body Starts Here ---------------------------------------------------------------->

    <h1 class="mb-5"><u>ARCED Briklin Information Uploader Center</u></h1>


    <div class="row">

            <!------------------------------------------------------ ALL KLIN INFO STARTS  -------------------------------------------->

        <div class="col p-3">
            <h2>ALL KLIN INFO</h2>

            <?php
            include 'db_row_count.php';
            echo "<p class='alert alert-primary' role='alert'>Total rows in kiln_info: $klin_info_count_row</p>";
            if ($klin_info_count_row > 0) {
                echo "<p  class='alert alert-info' role='alert'>You need to delete the current data before uploading new data.</p>";
                echo "File imported successfully! <a href='get_geojson.php'>View GeoJSON</a>";
            }
            ?>


            <form action="import.php" method="post" enctype="multipart/form-data" class="mt-5">
                <label for="csvFile" class="form-label">Select CSV file:</label>
                <input type="file" class="form-control" name="csvFile" id="csvFile" accept=".csv" required>
                <br><br>
                <input type="submit" class="btn btn-primary" value="Import CSV" <?php if ($klin_info_count_row > 0) echo 'disabled'; ?>>
                <?php if ($klin_info_count_row > 0): ?>
                    <input type="button" class="btn btn-danger" value="Delete Data" onclick="if(confirm('Are you sure you want to delete all data?')) window.location.href='delete_klin_info.php'">
                <?php endif; ?>
            </form>
        </div>
         <!------------------------------------------------------ ALL KLIN INFO ENDS  -------------------------------------------->

         <!------------------------------------------------------ ALL control INFO START  -------------------------------------------->
        <div class="col p-3">
            <h2>All control info of KLIN</h2>

            <?php
            echo "<p class='alert alert-primary' role='alert'>Total rows in kiln_control_data: $control_info_count_row</p>";
            if ($control_info_count_row > 0) {
                echo "<p class='alert alert-info' role='alert'>You need to delete the current data before uploading new data.</p>";
                echo "File imported successfully! <a href='get_geojson_ControlInfo.php'>View GeoJSON</a>";
            }
            ?>

            <form action="importControlInfo.php" method="post" enctype="multipart/form-data" class="mt-5">
                <label for="csvFile" class="form-label"> Select CSV file:</label>
                <input type="file" class="form-control" name="csvFile" id="csvFile" accept=".csv" required>
                <br><br>
                <input type="submit" class="btn btn-primary" value="Import CSV" <?php if ($control_info_count_row > 0) echo 'disabled'; ?>>
                <?php if ($control_info_count_row > 0): ?>
                    <input type="button" class="btn btn-danger" value="Delete Data" onclick="if(confirm('Are you sure you want to delete all data?')) window.location.href='delete_control_info.php'">
                <?php endif; ?>
            </form>
        </div>

         <!------------------------------------------------------ ALL control INFO ENDS  -------------------------------------------->



    </div>
    <!--------------------------------------------------------------------- Body ENDS Here ---------------------------------------------------------------->



    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO" crossorigin="anonymous"></script>
</body>

</html>