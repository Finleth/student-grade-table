<?php

require_once('sgtcreds.php');

$id = filter_var($_POST['student_id'], FILTER_SANITIZE_NUMBER_INT);

$output = [
    'success' => false,
    'data' => [],
    'errors' => []
];

$stmt = mysqli_prepare($conn, "DELETE FROM students WHERE id = ?");

mysqli_stmt_bind_param($stmt, 's', $id);

mysqli_stmt_execute($stmt);


if ( mysqli_affected_rows($conn) > 0 ){
    $output['success'] = true;
    $output['data'][] = 'Student was successfully deleted';
} else {
    $output['errors'][] = 'There was an error on the server. Try again.';
}

$json_output = json_encode($output);

print($json_output);

?>