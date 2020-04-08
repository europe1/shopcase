<?php
session_start();
if (!(isset($_SESSION["user"]) && isset($_POST["name"]) &&
(!empty($_FILES["option"]) || isset($_POST["colorhex"])))) {
	die();
}

include_once("../mysql.php");
$texture = FALSE;

if (isset($_FILES["option"])) {
	$target_dir = "shopcase_files/options/";
	$target_file = $target_dir . basename($_FILES["option"]["name"]);
	$upload_ok = 0;
	$file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

	if (file_exists($target_file)) {
	  echo "<p>File already exists.</p>";
	} else {
	  $upload_ok += 1;
	}
	
	if ($file_type == "png" || $file_type == "jpeg" || $file_type == "jpg") {
		$upload_ok += 1;
	} else {
	  echo "<p>Format not supported.</p>";
	}
	
	if ($upload_ok == 2) {
	  if (move_uploaded_file($_FILES["option"]["tmp_name"], $target_file)) {
		  $texture = TRUE;
	  } else {
		  die("An unexpected error occured.");
	  }
	}
}

$types = array("texture" => 0, "color" => 1);
$color = "#" . strtolower($_POST["colorhex"]);

$insert = "INSERT INTO options (name, type, path) VALUES (?, ?, ?)";
$stmt = $mysql->prepare($insert);
if ($texture) {
	$stmt->bind_param("sds", $_POST["name"], $types["texture"], $target_file);
} else {
	$stmt->bind_param("sds", $_POST["name"], $types["color"], $color);
}
$stmt->execute();
header("Location: options.php");
?>