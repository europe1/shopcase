<?php
$error = False;
if ((isset($_COOKIE["username"]) && isset($_COOKIE["password"])) ||
(isset($_POST["login"]) && isset($_POST["pass"]))) {
	require_once("../mysql.php");
	$stmt = $mysql->prepare("SELECT password FROM users WHERE username = ?");
	$login = isset($_COOKIE["username"]) ? $_COOKIE["username"] : $_POST["login"];
	$stmt->bind_param("s", $login);
	$stmt->execute();
	$stmt->store_result();
	if ($stmt->num_rows > 0) {
		$stmt->bind_result($password);
		$stmt->fetch();
		$pass = isset($_COOKIE["password"]) ? $_COOKIE["password"] : $_POST["pass"];
		if (password_verify($pass, $password)) {
			session_start();
			$_SESSION["user"] = $login;

			if (isset($_POST["remember"]) && $_POST["remember"] == "on") {
				setcookie("username", $_POST["login"], time() + 86400 * 30);
				setcookie("password", $_POST["pass"], time() + 86400 * 30);
			}

			header("Location: http://localhost/shopcase/build/");
		} else {
			$error = True;
		}
	} else {
		$error = True;
	}
	$stmt->close();
}
?>
<html>
<head>
	<title>Shopcase Панель управления</title>
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap&subset=cyrillic" rel="stylesheet">
	<style>
	body {
		margin: 0;
		width: 100%;
		font-family: 'Open Sans', sans-serif;
		color: #1b1b1b;
	}

	.page {
		height: 100%;
		display: flex;
	}

	.left {
		width: 40%;
		padding: 40px 0 0 90px;
	}

	.right {
		width: 60%;
		background-image: linear-gradient(135deg, #2b5876, #4e4376);
	}

	.header {
		margin-top: 100px;
	}

	.text {
		margin: 10px 0 50px 0;
		font-size: 1.2em;
		color: #878787;
	}

	.title {
		font-size: 2.6em;
		margin: 0;
		font-weight: 400;
	}

	.input {
		border: 2px solid #e4e4e4;
		height: 72px;
		width: 450px;
		font-family: inherit;
		font-size: 1rem;
		padding: 20px 10px 0 20px;
	}

	.input-group {
		display: inline-block;
		box-shadow: 0 25px 25px rgba(33, 33, 33, 0.1);
		margin-bottom: 30px;
		position: relative;
	}

	.input-first {
		border-bottom: none;
	}

	.label {
		position: absolute;
		left: 22px;
		color: #878787;
	}

	.label-login {
		top: 14px;
	}

	.label-password {
		top: 86px;
	}

	.button {
		background-color: #1b1b1b;
		width: 140px;
		height: 45px;
		border: 2px solid #1b1b1b;
		border-radius: 3px;
		color: #fff;
		font-family: inherit;
		font-size: 0.95rem;
		transition: background-color 150ms, color 200ms;
	}

	.button:hover {
		background-color: #fff;
		color: #1b1b1b;
		border: 2px solid #1b1b1b;
	}

	.remember {
		margin: 15px 0;
	}
	</style>
</head>
<body>
	<div class="page">
		<div class="left">
			<div class="logo-wrap">
				<img class="logo" src="logo.png">
			</div>
			<div class="header">
				<h1 class="title">Панель управления</h1>
				<p class="text">Для продолжения необходимо войти</p>
			</div>
			<div class="form">
				<form method="POST">
					<div class="input-group">
						<div class="label label-login">Имя пользователя</div>
						<div><input class="input input-first" name="login"></div>
						<div class="label label-password">Пароль</div>
						<div><input class="input" name="pass" type="password"></div>
					</div>
					<div class="remember">
						<input type="checkbox" name="remember">Запомнить
					</div>
					<input class="button" type="submit" value="Войти">
				</form>
			</div>
		</div>
		<div class="right"></div>
	</div>
</body>
</html>
