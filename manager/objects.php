<?php
session_start();
if (!isset($_SESSION["user"])) {
	die();
}
include_once("../mysql.php");
?>
<html>
  <head>
    <title>Shopcase Предметы</title>
  </head>
  <body>
	<h3>Загрузить файл:</h3>
    <form method="POST" action="objectadd.php" enctype="multipart/form-data">
      <input name="object" type="file">
      <input type="submit" value="Загрузить">
    </form>
	<div>
		<table border=black>
			<tr>
				<td>Имя файла</td>
				<td>Загружен</td>
			</tr>
			<?php
			$rows = $mysql->query("SELECT * FROM objects");
			foreach ($rows as $row) {
				echo "<tr><td><a href=\"object.php?id=" . $row["id"] . "\">" . 
					$row["file_name"] . "</a></td><td>" . 
					$row["upload_time"] . "</td></tr>";
			}
			?>
		</table>
  </body>
</html>