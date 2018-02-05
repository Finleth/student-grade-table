<?php

require_once('sgtcreds.php');

$name = $_POST['name'];
$course = $_POST['course'];
$grade = $_POST['grade'];
$id = $_POST['id'];

$sql = "CALL updateStudent('{$name}', '{$course}', {$grade}, {$id})";

$result = mysqli_query($conn, $sql);

$output = [
    'success' => false,
    'data' => [],
    'errors' => []
];

if ($result) {
    if ( mysqli_affected_rows($conn) > 0 ){
        $row = mysqli_fetch_assoc($result);
        $output['data'][] = $row;
        $output['success'] = true;
    } else {
        $output['errors'][] = 'The server was not able to update the student on the database';
    }
} else {
    $output['errors'][] = 'error in SQL query or credentials';
}


$json_output = json_encode($output);

print($json_output);

?>