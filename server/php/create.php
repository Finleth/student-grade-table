<?php

require_once('studentClass.php');

$studentOperations = new StudentOperations;

$create_output = $studentOperations -> create();

$json_output = json_encode($create_output);

print($json_output);

?>