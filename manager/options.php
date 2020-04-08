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
	<script src="jscolor.js"></script>
  </head>
  <body>
	<h3>Загрузить файл:</h3>
    <form method="POST" action="optionadd.php" enctype="multipart/form-data">
		<p>Название: <input name="name"></p>
		<p><input name="option" type="file"></p>
		<p>Color: <input name="colorhex" class="jscolor"></p>
		<input type="submit" value="Загрузить">
    </form>
	<div>
		<table border="black">
			<tr>
				<td>Название</td>
				<td>Имя файла</td>
				<td>Загружен</td>
			</tr>
			<?php
			$rows = $mysql->query("SELECT * FROM options");
			foreach ($rows as $row) {
				echo "<tr><td>" . $row["name"] . "</td><td>" . $row["path"] . "</td><td>" . $row["upload_time"] . "</td></tr>";
			}
			?>
		</table>
  </body>
</html>