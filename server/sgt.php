<?php

require_once('sgtcreds.php');

$query = "SELECT name, grade, course, id FROM students";

$result = mysqli_query($conn, $query);

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
        $output['errors'][] = 'no data available, sowwy. Except this is the back end, we aren\'t nice. Deal with it.';
    }
} else {
    $output['errors'][] = 'error in SQL query or credentials';
}

$json_output = json_encode($output);

print($json_output);

?>