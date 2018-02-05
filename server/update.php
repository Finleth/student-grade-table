<?php

require_once('sgtcreds.php');

$name = $_POST['name'];
$course = $_POST['course'];
$grade = $_POST['grade'];
$id = $_POST['id'];

$sql = "CALL updateStudent('{$name}', '{$course}', {$grade}, {$id})";

?>