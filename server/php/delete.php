<?php

require_once('studentClass.php');

$studentOperations = new StudentOperations;

$delete_output = $studentOperations -> delete();

$json_output = json_encode($delete_output);

print($json_output);

?>