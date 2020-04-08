<?php
session_start();
if (!isset($_SESSION["user"])) {
	die();
}
?>
<html>
  <head>
    <title>Upload</title>
  </head>
  <body>
    <form method="POST" action="uploader.php?type=model" enctype="multipart/form-data">
      <input name="model" type="file">
      <input type="submit">
    </form>
  </body>
</html>
