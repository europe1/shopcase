<?php
require("wfUTrg9kWZv.php");

$name = isset($_POST["name"]) ? $_POST["name"] : NULL;
$email = isset($_POST["email"]) ? $_POST["email"] : NULL;
$phone = isset($_POST["phone"]) ? $_POST["phone"] : NULL;
$text = isset($_POST["text"]) ? $_POST["text"] : NULL;

$insert = "INSERT INTO feedback (name, email, phone, text) VALUES (?, ?, ?, ?)";
$stmt = $mysql->prepare($insert);
$stmt->bind_param("ssss", $name, $email, $phone, $text);
$stmt->execute();
?>
<html>
  <head>
    <meta charset='utf-8'>
    <title>Ваша заявка принята - Shopcase</title>
    <link rel='shortcut icon' href='favicon.ico'>
    <style>
    body {
      margin: 0;
      font-family: Helvetica, sans-serif;
      text-align: center;
      color: #1a1a1a;
    }

    .message {
      display: inline-block;
      border: 1px solid black;
      padding: 20px;
      border-radius: 5px;
      text-align: left;
      margin: 30px 10px;
    }

    .title {
      margin: 0;
      font-size: 1.5em;
      text-align: center;
    }
    </style>
  </head>
  <body>
    <div class='message'>
      <h1 class='title'>Заявка сохранена в системе</h1>
      <p class='greetings'>
        Здравствуйте<?= empty($name) ? "." : ", " . $name . "." ?>
      </p>
      <p class='text'>
        Мы благодарны Вам за то, что уделили нам время.<br>
        Ваша заявка была добавлена в систему и будет рассмотрена в ближайшее время.
      </p>
      <p class='signature'>Искренне Ваш, Shopcase.</p>
    </div>
  </body>
</html>
