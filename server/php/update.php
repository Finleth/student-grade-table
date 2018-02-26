<?php

require_once('studentClass.php');

$studentOperations = new StudentOperations;

$update_output = $studentOperations -> update();

$json_output = json_encode($update_output);

print($json_output);

?>