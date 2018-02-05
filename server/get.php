<?php

require_once('sgtcreds.php');

$sql = "SELECT * FROM students";

$result = mysqli_query($conn, $sql);

$output = [
    'success' => false,
    'data' => [],
    'errors' => []
];

if ($result){
    if ( mysqli_num_rows($result) > 0 ){
        while ( $row = mysqli_fetch_assoc($result) ){
            $output['data'][] = $row;
        }
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