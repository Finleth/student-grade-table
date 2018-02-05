<?php

require_once('sgtcreds.php');

$name = $_POST['name'];
$course = $_POST['course'];
$grade = $_POST['grade'];

$sql = "INSERT INTO students SET
    name = '{$name}',
    course = '{$course}',
    grade = '{$grade}'
";

$result = mysqli_query($conn, $sql);

$output = [
    'success' => false,
    'data' => [],
    'errors' => []
];

if ($result) {
    if ( mysqli_affected_rows($conn) > 0 ){
        $new_id = mysqli_insert_id($conn);
        $output['success'] = true;
        $output['new_id'] = $new_id;
    } else {
        $output['errors'][] = 'The server was not able to insert the student to the database';
    }
} else {
    $output['errors'][] = 'error in SQL query or credentials';
}


$json_output = json_encode($output);

print($json_output);

?>