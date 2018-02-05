<?php

require_once('sgtcreds.php');

$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$course = filter_var($_POST['course'], FILTER_SANITIZE_STRING);
$grade = filter_var($_POST['grade'], FILTER_SANITIZE_NUMBER_INT);
$grade = intval($grade);

$output = [
    'success' => false,
    'data' => [],
    'errors' => []
];

// check for any errors in input types and exit if so with errors

if (!preg_match('/^[a-zA-Z ]{2,20}$/', $name)){
    $output['errors'][] = 'Name must be between 2 and 20 characters long and can contain only letters and spaces.';
}
if (!preg_match('/^[a-zA-Z ]{2,25}$/', $course)){
    $output['errors'][] = 'Course must be between 2 and 25 characters long and can contain only letters and spaces.';
}
if (!preg_match('/^\d{1,2}$|100/', $grade)){
    $output['errors'][] = 'Grade must be an integer between 0 and 100.';
}

if (!empty($output['errors'])){
    $json_output = json_encode($output);
    print($json_output);
    exit;
}



$sql = "INSERT INTO students SET name = '{$name}', course = '{$course}', grade = {$grade}";

$result = mysqli_query($conn, $sql);


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