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
        $output['errors'][] = 'no data available';
    }
} else {
    $output['errors'][] = 'error in SQL query or credentials';
}

$json_output = json_encode($output);

print($json_output);

?>