<?php

require_once('sgtcreds.php');

$id = filter_var($_POST['student_id'], FILTER_SANITIZE_NUMBER_INT);

$sql = "DELETE FROM students WHERE id=$id";

$result = mysqli_query($conn, $sql);

$output = [
    'success' => false,
    'data' => [],
    'errors' => []
];

if ($result){
    if ( mysqli_affected_rows($conn) > 0 ){
        $output['success'] = true;
        $output['data'][] = 'Student was successfully deleted';
    } else {
        $output['errors'][] = 'The server was not able to delete the student in the database';
    }
} else {
    $output['errors'][] = 'error in SQL query or credentials';
}

$json_output = json_encode($output);

print($json_output);

?>