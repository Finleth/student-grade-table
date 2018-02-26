<?php

require_once('studentClass.php');

$studentOperations = new StudentOperations;

$read_output = $studentOperations -> read();

$json_output = json_encode($read_output);

print($json_output);

?>