<?php


class StudentOperations {
    public function read(){

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
                $output['success'] = true;
                $output['errors'][] = 'No student data available';
            }
        } else {
            $output['errors'][] = 'There was an error on the server. Try again.';
        }

        return $output;
    }

    public function create(){
        
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


        $stmt = mysqli_prepare($conn, "INSERT INTO students SET name = ?, course = ?, grade = ?");

        mysqli_stmt_bind_param($stmt, "sss", $name, $course, $grade);

        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_fetch($stmt);


        if ( mysqli_affected_rows($conn) > 0 ){
            $new_id = mysqli_insert_id($conn);
            $output['success'] = true;
            $output['new_id'] = $new_id;
        } else {
            $output['errors'][] = 'There was an error on the server. Try again.';
        }

        return $output;
    }

    public function delete(){

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

        return $output;
    }

    public function update(){
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

        return $output;
    }
}

?>