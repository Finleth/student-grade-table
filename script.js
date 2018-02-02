
$(document).ready( initializeApp );

var student_array = [];
var gradeAvg = 0;
var currentBackend = 'php';

const backends = {
    php: {
        create: {
            url: './server/create.php',
            method: 'get'
        },
        'delete': {
            url: './server/delete.php',
            method: 'get'
        },
        read: './server/sgt.php',
    },
    node: {
        create: {
            url: 'http://localhost:3000/studentcreate',
            method: 'post'
        },
        'delete': {
            url: 'http://localhost:3000/studentdelete',
            method: 'post'
        },
        read: 'http://localhost:3000/student',
    }
};

function initializeApp(){
    addClickHandlersToElements();
    updateStudentList(student_array);
}


function addClickHandlersToElements(){
    $('form#loginForm').submit( handleSubmit );
    $('#cancel').on('click', handleCancelClick);
    $('#getData').on('click', handleGetDataClick);
    $('#switchServer').on('click', handleServerSwitchClick);
}

function handleSubmit(event){
    addStudent();
    return false;
}

function handleCancelClick(){
    clearAddStudentFormInputs();
}


function handleGetDataClick(event){
    addLoadingForButton(event.target);
    requestServerData(event.target, handleGetDataClick);
}

function handleServerSwitchClick(event){
    if (currentBackend === 'node'){
        event.target.innerText = 'Use Node Server';
        currentBackend = 'php';
    } else {
        event.target.innerText = 'Use PHP Server'
        currentBackend = 'node';
    }
}

function requestServerData(targetButton){
    $.ajax( {
        dataType: 'json',
        method: 'get',
        url: backends[currentBackend].read,
        success: function(data){
            if (data.success) {
                addServerDataToStudentArray(data);
            } else {
                displayError("Error", 'There was a ' + data.error[0] + ' on the server')
            }
        },
        error: handleAjaxError,
        complete: function(){
            setTimeout(function(){
                removeLoadingForButton(targetButton, handleGetDataClick);
            }, 200);
        }
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
            name: student.name,
            course: student.course,
            grade: student.grade
        },
        method:  backends[currentBackend].create.method,
        url: backends[currentBackend].create.url,
        success: function(data){
            if (data.success) {
                clearAddStudentFormInputs();
                student.id = data.new_id;
                student_array.push(student);
                updateStudentList(student_array);
            } else {
                displayError("Invalid Input", data.errors[0])
            }
        },
        error: handleAjaxError,
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
    var operations = $('<td>');
    var editBtn = $('<button>',{
        'text': 'Edit',
        'class': 'btn btn-success btn-sm'
    }).on('click', editStudent);
    var deleteBtn = $('<button>',{
        'class': 'btn btn-danger btn-sm'
    }).on('click', deleteStudent);
    var deleteSpinner = $('<span>',{
        'class': 'loadingSpinner'
    });

    deleteBtn.append(deleteSpinner, ' Delete');
    operations.append([editBtn, deleteBtn]);
    row.append([name, course, grade, operations]);
    $('.student-list tbody').append(row);

    function editStudent(event){
        const rowNodeList = row[0].childNodes;
        const rowFields = [studentObj.name, studentObj.course, studentObj.grade];
        const form = $('<form>');

        for (var i=0; i<3; i++){
            var td = $(rowNodeList[i]);
            var input = $('<input>',{
                type: 'text',
                name: 'name',
                required: 'true',
                value: td.text(),
                'class': 'form-control'
            })  

            form.append(input);
        }
        debugger;

        editBtn.text('Confirm').off('click').on('click', confirmEdit);
        deleteBtn.text('Cancel').off('click').on('click', cancelEdit);
        form.append([editBtn, deleteBtn]);

        row.empty();
        row.append(form);

        function confirmEdit(){
            revertEditAndDelete();
        }

        function cancelEdit(){
            revertEditAndDelete();
        }

        function revertEditAndDelete(){
            for (var i=0; i<3; i++){
                var td = $(rowNodeList[i]);
                td.empty().text(rowFields[i]);
            }
            editBtn.text('Edit').off('click').on('click', editStudent);
            deleteBtn.text('Delete').off('click').on('click', deleteStudent);
        }
    }

    function deleteStudent(event){
        addLoadingForButton(event.target);
        var objIndex = student_array.indexOf(studentObj);

        deleteStudentFromServer(event.target, objIndex, deleteStudent);
    }
}

function deleteStudentFromServer(domElmt, objIndex, deleteStudent){
    $.ajax({
        method: backends[currentBackend]['delete'].method,
        data: {
            student_id: student_array[objIndex].id,
        },
        dataType: 'json',
        url: backends[currentBackend]['delete'].url,
        success: function(data){
            if (data.success) {
                deleteStudentForUser(objIndex, domElmt.parentNode.parentNode);
            } else {
                displayError("Unauthorized To Delete", data.errors[0])
            }
        },
        error: handleAjaxError,
        complete: function(){
            setTimeout(function(){
                removeLoadingForButton(domElmt, deleteStudent);
            }, 100)
        }
    });
}


function deleteStudentForUser(objIndex, row){
    student_array.splice(objIndex, 1);
    $(row).remove();

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

function handleAjaxError(data){
    displayError(data.status+" Error", data.statusText);
}

function addLoadingForButton(button){
    $(button).off('click');
    $(button).find('.loadingSpinner').addClass('glyphicon glyphicon-refresh animateSpin');
}


function removeLoadingForButton(button, callbackFunction){
    $(button).find('.loadingSpinner').removeClass('glyphicon glyphicon-refresh animateSpin');
    $(button).on('click', callbackFunction);
}



