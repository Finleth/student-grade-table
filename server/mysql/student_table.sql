

CREATE TABLE `students` (
  `id` int(5) NOT NULL AUTO_INCREMENT COMMENT 'Unique ID',
  `name` varchar(25) NOT NULL COMMENT 'Student name',
  `grade` int(3) NOT NULL COMMENT 'Grade in number format ',
  `course` varchar(25) NOT NULL COMMENT 'Course name',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;