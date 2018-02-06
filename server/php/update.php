<?php

require_once('sgtcreds.php');

$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$course = filter_var($_POST['course'], FILTER_SANITIZE_STRING);
$grade = filter_var($_POST['grade'], FILTER_SANITIZE_NUMBER_INT);
$id = filter_var($_POST['id'], FILTER_SANITIZE_NUMBER_INT);

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

$sql = "CALL updateStudent('{$name}', '{$course}', {$grade}, {$id})";

$result = mysqli_query($conn, $sql);

if ($result) {
    if ( mysqli_affected_rows($conn) > 0 ){
        $row = mysqli_fetch_assoc($result);
        $output['data'][] = $row;
        $output['success'] = true;
    } else {
        $output['errors'][] = 'There was an error on the server. Try again.';
    }
} else {
    $output['errors'][] = 'There was an error on the server. Try again.';
}


$json_output = json_encode($output);

print($json_output);

?>