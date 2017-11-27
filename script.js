/* information about jsdocs: 
* param: http://usejsdoc.org/tags-param.html#examples
* returns: http://usejsdoc.org/tags-returns.html
* 
/**
 * Listen for the document to load and initialize the application
 */

$(document).ready( initializeApp );

var student_array = [];
var gradeAvg = 0;


function initializeApp(){
    addClickHandlersToElements();
    updateStudentList(student_array);
    requestServerData();
}


function addClickHandlersToElements(){
    $('#add').on('click', handleAddClicked);
    $('#cancel').on('click', handleCancelClick);
    $('#getData').on('click', handleGetDataClick);
}


function handleAddClicked(event){
    addLoadingForButton(event.target);
    addStudent();
    setTimeout(function(){
        removeLoadingForButton(event.target, handleAddClicked);
    }, 200);
}


function handleCancelClick(){
    clearAddStudentFormInputs();
}


function handleGetDataClick(event){
    addLoadingForButton(event.target);
    requestServerData();
    setTimeout(function(){
        removeLoadingForButton(event.target, handleGetDataClick);
    }, 200);
}

function requestServerData(){
    $.ajax( {
        dataType: 'json',
        data: {
            api_key: 'XXiW0o1avu'
        },
        method: 'post',
        url: 'http://s-apis.learningfuze.com/sgt/get',
        success: addServerDataToStudentArray
    } );
}


function addStudent(){
    var student = {
        id: null,
        name: $('#studentName').val(),
        grade: parseInt($('#studentGrade').val()),
        course: $('#course').val(),
    };

    addStudentToServer(student);
}

function addStudentToServer(student){
    $.ajax({
        dataType: 'json',
        data: {
            api_key: 'XXiW0o1avu',
            name: student.name,
            course: student.course,
            grade: student.grade
        },
        method: 'post',
        url: 'http://s-apis.learningfuze.com/sgt/create',
        success: function(data){
            if (data.success) {
                clearAddStudentFormInputs();
                student.id = data.new_id;
                student_array.push(student);
                updateStudentList(student_array);
            } else {
                displayError("Invalid Input", data.errors[0])
            }
        }
    });
}


function clearAddStudentFormInputs(){
    $('#studentName').val('');
    $('#course').val('');
    $('#studentGrade').val('');
}


function renderStudentOnDom(studentObj){
    var row = $('<tr>');
    var name = $('<td>').text(studentObj.name);
    var course = $('<td>').text(studentObj.course);
    var grade = $('<td>').text(studentObj.grade);
    var deleete = $('<td>',{
        'class': 'btn btn-danger btn-xs'
    }).on('click', deleteStudent);
    var deleteSpinner = $('<span>',{
        'class': 'loadingSpinner'
    });

    function deleteStudent(event){
        addLoadingForButton(event.target);
        var objIndex = student_array.indexOf(studentObj);

        deleteStudentFromServer(event, objIndex);

        setTimeout(function(){
            removeLoadingForButton(event.target, deleteStudent);
        }, 200);
    }

    deleete.append(deleteSpinner, ' Delete');
    row.append([name, course, grade, deleete]);
    $('.student-list tbody').append(row);
}

function deleteStudentFromServer(event, objIndex){
    $.ajax({
        method: 'post',
        data: {
            api_key: 'XXiW0o1avu',
            student_id: student_array[objIndex].id
        },
        dataType: 'json',
        url: 'http://s-apis.learningfuze.com/sgt/delete',
        success: function(data){
            if (data.success) {
                deleteStudentForUser(objIndex, event.target);
            } else {
                displayError("Unauthorized To Delete", data.errors[0])
            }
        }
    });
}


function deleteStudentForUser(objIndex, domElement){
    student_array.splice(objIndex, 1);
    $(domElement.parentNode).remove();

    if (!student_array[0]) {
        $('#noInfo').show();
    } else {
        $('#noInfo').hide();
    }

    calculateGradeAverage(student_array);
    renderGradeAverage(gradeAvg);
}


function updateStudentList(students){
    $('.student-list tbody').empty();
    for (var i=0; i<students.length; i++){
      renderStudentOnDom(students[i]);
    }

    if (!students[0]){
        $('#noInfo').show();
    } else {
        $('#noInfo').hide();
    }

    calculateGradeAverage(students);
    renderGradeAverage(gradeAvg);
}

function addServerDataToStudentArray(studentData){
    student_array = studentData.data;

    updateStudentList(student_array);
}

function calculateGradeAverage(students){
    var currentGradeAvg = 0;
    for (var i=0; i<students.length; i++){
        currentGradeAvg += parseInt(students[i].grade);
    }
    gradeAvg = Math.floor(currentGradeAvg/(i));
    if (isNaN(gradeAvg)){
        gradeAvg = 0;
    }
}


function renderGradeAverage(average){
    $('.avgGrade').text(average);
}

function displayError(errorTitle, errorMessage){
    $('#errorModal').modal('show');
    $('#errorModal .errorModalTitle').text(errorTitle);
    $('#errorModal .errorModalMessage').text(errorMessage);
}


function addLoadingForButton(button){
    $(button).off('click');
    $(button).find('.loadingSpinner').addClass('glyphicon glyphicon-refresh animateSpin');
}


function removeLoadingForButton(button, callbackFunction){
    $(button).find('.loadingSpinner').removeClass('glyphicon glyphicon-refresh animateSpin');
    $(button).on('click', callbackFunction);
}



