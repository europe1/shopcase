<?php
session_start();
if (!(isset($_SESSION["user"]) && isset($_GET["action"]))) {
	die();
}

if (($_GET["action"] == "add" && !(isset($_POST["object_id"]) && 
	isset($_POST["object_3d"]) && isset($_POST["option_id"]))) ||
	($_GET["action"] == "del" && !isset($_GET["id"]))) {
	die();
}

require_once("../mysql.php");
if ($_GET["action"] == "add") {
	$stmt = $mysql->prepare("INSERT INTO object_options (object_id, object3d, option_id) VALUES (?, ?, ?)");
	$stmt->bind_param("dsd", $_POST["object_id"], $_POST["object_3d"], $_POST["option_id"]);
} else if ($_GET["action"] == "del") {
	$stmt = $mysql->prepare("DELETE FROM object_options WHERE id = ?");
	$stmt->bind_param("d", $_GET["id"]);
}
$stmt->execute();
$id = isset($_GET["oid"]) ? $_GET["oid"] : $_POST["object_id"];
header("Location: object.php?id=" . $id);
?>