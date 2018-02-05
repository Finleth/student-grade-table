DELIMITER $$

CREATE PROCEDURE `updateStudent`(
    IN `in_name` VARCHAR(20), 
    IN `in_course` VARCHAR(25), 
    IN `in_grade` SMALLINT(3), 
    IN `in_id` MEDIUMINT(6)
    )

BEGIN
    UPDATE students SET
        name = in_name,
        course = in_course,
        grade = in_grade
    WHERE id = in_id;

    SELECT * FROM students
    WHERE id = in_id;
END$$

DELIMITER ;