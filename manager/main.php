<?php
if (!isset($_GET["action"])) {
  http_response_code(400);
  die("400 Bad request");
}

require_once("../mysql.php");
$error = False;
$DASHBOARD_URL = "http://localhost:3000/";

if ($_GET["action"] == "login") {
  $stmt = $mysql->prepare("SELECT password FROM users WHERE username = ?");
  $stmt->bind_param("s", $_POST["login"]);
  $stmt->execute();
  $stmt->store_result();
  if ($stmt->num_rows > 0) {
    $stmt->bind_result($password);
    $stmt->fetch();
    if (password_verify($_POST["pass"], $password)) {
      session_start();
      $_SESSION["user"] = $_POST["login"];
    } else {
      $error = True;
    }
  } else {
    $error = True;
  }
  $stmt->close();
}

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION["user"])) {
  http_response_code(404);
  die("404 Not found");
}

switch ($_GET["action"]) {
  case "object":
    $query = $mysql->query("SELECT * FROM objects WHERE id = " . $_GET["id"]);
    if ($query->num_rows > 0) {
      $row = $query->fetch_array();
      $object = array(
        "id" => $row["id"],
        "uid" => $row["uid"],
        "name" => $row["name"],
        "path" => $row["path"]
      );
      header('Content-Type: application/json');
      echo json_encode($object);
      break;
    } else {
      $error = True;
      break;
    }
  case "objopt":
    $options = $mysql->query(
    	"SELECT options.name, options.type, options.path, object_options.mat_name,
    	options.id, object_options.object3d FROM object_options INNER JOIN options ON
    	object_options.option_id = options.id WHERE object_id = " . $_GET["id"]
    );

    $dict = array();

    foreach ($options as $option) {
    	if (!array_key_exists($option["mat_name"], $dict)) {
    		$dict[$option["mat_name"]] = array();
    	}
      array_push($dict[$option["mat_name"]], array(
        "id" => $option["id"],
        "name" => $option["name"],
        "type" => $option["type"],
        "value" => $option["path"],
        "obj3d" => $option["object3d"]
      ));
    }

    header('Content-Type: application/json');
    echo json_encode($dict);
    break;
  case "options":
    $all_options = $mysql->query("SELECT * FROM options");
    $options = array();
    foreach ($all_options as $option) {
      array_push($options, array(
        "id" => $option["id"],
        "name" => $option["name"],
        "type" => $option["type"],
        "value" => $option["path"]
      ));
    }

    header('Content-Type: application/json');
    echo json_encode($options);
    break;
  case "objects":
    $all_objects = $mysql->query("SELECT * FROM objects");
    $obj_options = $mysql->query("SELECT object_options.object_id, options.id,
	  options.name, options.path, options.type FROM object_options
	  INNER JOIN options ON object_options.option_id = options.id");

    $object_options = array();
    foreach ($obj_options as $objopt) {
      if (!array_key_exists($objopt["object_id"], $object_options)) {
    		$object_options[$objopt["object_id"]] = array();
    	}
      array_push($object_options[$objopt["object_id"]], array(
    		"id" => $objopt["id"],
    		"name" => $objopt["name"],
    		"type" => $objopt["type"],
    		"value" => $objopt["path"]
  	  ));
    }

    $objects = array();
    foreach ($all_objects as $object) {
      $opts = array_key_exists($object["id"], $object_options) ?
        $object_options[$object["id"]] : array();
      array_push($objects, array(
        "id" => $object["id"],
        "uid" => $object["uid"],
        "name" => $object["name"],
        "path" => $object["path"],
        "options" => $opts
      ));
    }

    header('Content-Type: application/json');
    echo json_encode($objects);
    break;
  case "objectadd":
    $target_dir = "shopcase_files/objects/";
    $target_file = $target_dir . basename($_FILES["file"]["name"]);
    $upload_ok = 0;
    $file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    if (file_exists($target_file)) {
      $error = True;
      break;
    } else {
      $upload_ok += 1;
    }

    if ($file_type == "gltf" || $file_type == "glb") {
        $upload_ok += 1;
    } else {
      $error = True;
      break;
    }

    if ($upload_ok == 2) {
      if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        $insert = "INSERT INTO objects (uid, name, path) VALUES (?, ?, ?)";
        $stmt = $mysql->prepare($insert);
        $stmt->bind_param("dss", time(), basename($_FILES["file"]["name"]), $target_file);
        $stmt->execute();
        header("Location: " . $DASHBOARD_URL . "objects/");
        break;
      } else {
        $error = True;
        break;
      }
    }
    break;
  case "objaddopt":
    $stmt = $mysql->prepare("INSERT INTO object_options
      (object_id, object3d, mat_name, option_id) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("dssd", $_POST["object_id"], $_POST["object_3d"],
      $_POST["material"], $_POST["option_id"]);
    $stmt->execute();
    break;
  case "objdelopt":
    $stmt = $mysql->prepare("DELETE FROM object_options WHERE option_id = ? AND object_id = ?");
    $stmt->bind_param("dd", $_GET["opt_id"], $_GET["obj_id"]);
    $stmt->execute();
    break;
  case "optionadd":
    $texture = FALSE;
    if (isset($_FILES["file"])) {
    	$target_dir = "shopcase_files/images/";
    	$target_file = $target_dir . basename($_FILES["file"]["name"]);
    	$upload_ok = 0;
    	$file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    	if (file_exists($target_file)) {
        $error = True;
        break;
    	} else {
    	  $upload_ok += 1;
    	}

    	if ($file_type == "png" || $file_type == "jpeg" || $file_type == "jpg") {
    		$upload_ok += 1;
    	} else {
        $error = True;
        break;
    	}

    	if ($upload_ok == 2) {
    	  if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    		  $texture = TRUE;
    	  } else {
    		  $error = True;
          break;
    	  }
    	}
    }

    $types = array("texture" => 0, "color" => 1);
    $color = $_POST["value"];
    $insert = "INSERT INTO options (name, type, path) VALUES (?, ?, ?)";
    $stmt = $mysql->prepare($insert);
    if ($texture) {
    	$stmt->bind_param("sds", $_POST["name"], $types["texture"], $target_file);
    } else {
    	$stmt->bind_param("sds", $_POST["name"], $types["color"], $color);
    }
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
      if ($texture) {
        header("Location: " . $DASHBOARD_URL . "options/");
      } else {
        $response = array("id" => strval($mysql->insert_id));
        header('Content-Type: application/json');
        echo json_encode($response);
      }
    }
    break;
  case "optiondel":
    $query = $mysql->query("SELECT type, path FROM options WHERE id = " . $_GET["id"]);
    $option = $query->fetch_array();
    if ($option["type"] == "0") {
      unlink($option["path"]);
    }
    $stmt = $mysql->prepare("DELETE FROM options WHERE id = ?");
    $stmt->bind_param("d", $_GET["id"]);
    $stmt->execute();
    break;
  case "objectdel":
    $query = $mysql->query("SELECT path FROM objects WHERE id = " . $_GET["id"]);
    $object = $query->fetch_array();
    unlink($object["path"]);
    $stmt = $mysql->prepare("DELETE FROM objects WHERE id = ?");
    $stmt->bind_param("d", $_GET["id"]);
    $stmt->execute();
    break;
  default:
    $error = True;
}

if ($error) {
  http_response_code(404);
  die("404 Not found");
}
?>
