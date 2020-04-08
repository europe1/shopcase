<?php
session_start();
if (!(isset($_SESSION["user"]) && isset($_FILES["object"]))) {
	die();
}

include_once("../mysql.php");

$target_dir = "shopcase_files/objects/";
$target_file = $target_dir . basename($_FILES["object"]["name"]);
$upload_ok = 0;
$file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

if (file_exists($target_file)) {
  echo "<p>File already exists.</p>";
} else {
  $upload_ok += 1;
}

if ($file_type == "gltf" || $file_type == "glb") {
    $upload_ok += 1;
} else {
  echo "<p>Format not supported.</p>";
}

if ($upload_ok == 2) {
  if (move_uploaded_file($_FILES["object"]["tmp_name"], $target_file)) {
	$insert = "INSERT INTO objects (file_name, path) VALUES (?, ?)";
	$stmt = $mysql->prepare($insert);
	$stmt->bind_param("ss", basename($_FILES["object"]["name"]), $target_file);
	$stmt->execute();
	header("Location: objects.php");
  } else {
    echo "<p>An unexpected error occured.</p>";
  }
}
?>
