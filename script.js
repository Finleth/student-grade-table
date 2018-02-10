
$(document).ready( initializeApp );

var student_array = [];
var gradeAvg = 0;
var currentBackend = 'php';
var formSubmitting = false;

var backends = {
    php: {
        create: {
            url: './server/php/create.php',
            method: 'post'
        },
        update: {
            url: './server/php/update.php',
            method: 'post'
        },
        'delete': {
            url: './server/php/delete.php',
            method: 'post'
        },
        read: {
            url: './server/php/get.php',
            method: 'get'
        }
    },
    node: {
        create: {
            url: '/apps/sgt/studentcreate',
            method: 'post'
        },
        update: {
            url: '/apps/sgt/studentupdate',
            method: 'post'
        },
        'delete': {
            url: '/apps/sgt/studentdelete',
            method: 'post'
        },
        read: {
            url: '/apps/sgt/student',
            method: 'get'
        }
    }
};

function initializeApp(){
    addClickHandlersToElements();
    updateStudentList(student_array);
    requestServerData(null);
}


function addClickHandlersToElements(){
    $('form#loginForm').submit( handleSubmit );
    $('#reset').on('click', handleCancelClick);
    $('#switchServer').on('click', handleServerSwitchClick);
}

function handleSubmit(event){
    event.preventDefault();
    addLoadingForButton($('#add'));
    if (formSubmitting){
        return false;
    }
    formSubmitting = true;
    addStudent();
}

function handleCancelClick(){
    clearAddStudentFormInputs();
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

function requestServerData(){
    $.ajax( {
        dataType: 'json',
        method: backends[currentBackend].read.method,
        url: backends[currentBackend].read.url,
        success: function(data){
            if (data.success) {
                addServerDataToStudentArray(data);
            } else {
                displayErrorModal("Unable To Obtain Student Data", data.error);
            }
        },
        error: handleAjaxError,
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
                displayErrorModal("Unable To Add Student", data.errors)
            }
        },
        error: handleAjaxError,
        complete: function(){
            setTimeout(function(){
                removeLoadingForButton($('#add'));
                formSubmitting = false;
            }, 200);
        }
    });
}


function clearAddStudentFormInputs(){
    $('#studentName').val('');
    $('#course').val('');
    $('#studentGrade').val('');
    $('#studentName').focus();
}


function renderStudentOnDom(studentObj){
    var row = $('<tr>');
    var name = $('<td>').text(studentObj.name);
    var course = $('<td>').text(studentObj.course);
    var grade = $('<td>').text(studentObj.grade);
    var operations = $('<td>');
    var buttons, rowContents;
    var editBtn = $('<button>',{
        'text': 'Edit',
        'class': 'btn btn-success btn-sm operation-btn'
    }).on('click', editStudent);
    var deleteBtn = $('<button>',{
        'class': 'btn btn-danger btn-sm operation-btn'
    }).on('click', initiateDeleteStudent);
    var loadingSpinner = $('<span>',{
        'class': 'loadingSpinner'
    });

    buttons = [editBtn, deleteBtn];
    rowContents = [name, course, grade, operations];

    deleteBtn.append(loadingSpinner, ' Delete');
    operations.append(buttons);
    row.append(rowContents);
    $('.student-list tbody').append(row);


    function editStudent(event){
        revertAnyEditing();

        var rowNodeList = row[0].childNodes;
        var editInputs = [
            {
                type: 'text',
                name: 'student',
                required: 'true',
                value: rowContents[0].text(),
                pattern: '[a-zA-Z ]{2,20}',
                title: 'Name must be between 2 and 20 characters long containing only letters and spaces.',
                'class': 'form-control inline-inputs'
            },
            {
                type: 'text',
                name: 'course',
                required: 'true',
                value: rowContents[1].text(),
                pattern: '[a-zA-Z ]{2,25}',
                title: 'Course must be between 2 and 25 characters long containing only letters and spaces.',
                'class': 'form-control inline-inputs'
            },
            {
                type: 'text',
                name: 'grade',
                required: 'true',
                value: rowContents[2].text(),
                pattern: '^\\d{1,2}$|100',
                title: 'Grade must be an integer between 0 and 100.',
                'class': 'form-control inline-inputs'
            }
        ]
        var td = $('<td>',{
            colspan: 4
        });
        var form = $('<form>',{
            autocomplete: 'off'
        }).on('submit', confirmEdit);
        var btnDiv = $('<div>',{
            'class': 'edit-delete-container'
        })
        var confirmBtn = $('<button>',{
            'type': 'submit',
            'class': 'btn btn-success btn-sm operation-btn',
            'id': 'confirm-edit'
        });
        var cancelBtn = $('<button>',{
            'text': 'Cancel',
            'class': 'btn btn-danger btn-sm operation-btn float-right'
        }).on('click', cancelEdit);
        confirmBtn.append(loadingSpinner, 'Confirm');
        btnDiv.append([confirmBtn, cancelBtn]);

        for (var i=0; i<3; i++){
            var input = $('<input>',editInputs[i]);
            form.append(input);
        }

        form.append(btnDiv);
        td.append(form);
        row.empty().append(td);

        removeLoadingForButton($(confirmBtn));
        
        function confirmEdit(event){
            event.preventDefault(); 
            if (formSubmitting){
                return false;
            }
            formSubmitting = true;
            addLoadingForButton(confirmBtn);
            updateStudentOnServer(form[0], student_array.indexOf(studentObj), revertEditAndDelete, rowContents);           
        }

        function cancelEdit(event){
            event.preventDefault();
            revertEditAndDelete(rowContents);
        }

        function revertEditAndDelete(contents){
            editBtn.on('click', editStudent);
            deleteBtn.on('click', initiateDeleteStudent);
            row.empty().append(contents);
        }
    }

    function initiateDeleteStudent(event){
        displayDeleteModal(studentObj);
        $('#confirm_delete').off('click');
        $('#confirm_delete').on('click', deleteStudent.bind(null, event));
    }

    function deleteStudent(event){
        addLoadingForButton(event.target);
        $('#delete_modal').modal('hide');
        var objIndex = student_array.indexOf(studentObj);
    
        deleteStudentFromServer(event.target, objIndex, deleteStudent);
    }
}

function revertAnyEditing(){
    $('table tbody').find('form').find('button.btn-danger').click();
}

function updateStudentOnServer(editForm, student_index, successCallback, rowContents){
    var ajaxOptions = {
        method: backends[currentBackend].update.method,
        data: {
            name: editForm[0].value,
            course: editForm[1].value,
            grade: editForm[2].value,
            id: student_array[student_index].id
        },
        dataType: 'json',
        url: backends[currentBackend].update.url,
        success: function(results){
            if (results.success) {
                const { name, course, grade } = results.data[0];

                student_array[student_index].name = name;
                student_array[student_index].course = course;
                student_array[student_index].grade = grade;

                rowContents[0].text(name);
                rowContents[1].text(course);
                rowContents[2].text(grade);

                successCallback(rowContents);
                calculateGradeAverage(student_array);
                renderGradeAverage(gradeAvg);
            } else {
                displayErrorModal("Unable to Update", results.errors)
            }
        },
        error: handleAjaxError,
        complete: function(){
            setTimeout(function(){
                removeLoadingForButton($('#confirm-edit'));
                formSubmitting = false;
            }, 200);
        }
    }
    $.ajax(ajaxOptions);
}

function deleteStudentFromServer(domElmt, objIndex, deleteStudent){
    var ajaxOptions = {
        method: backends[currentBackend]['delete'].method,
        data: {
            student_id: student_array[objIndex].id,
        },
        dataType: 'json',
        url: backends[currentBackend]['delete'].url,
        success: function(results){
            if (results.success) {
                deleteStudentForUser(objIndex, domElmt.parentNode.parentNode);
            } else {
                displayErrorModal("Unable To Delete", results.errors)
            }
        },
        error: handleAjaxError,
        complete: function(){
            setTimeout(function(){
                removeLoadingForButton(domElmt, deleteStudent);
            }, 200)
        }
    }
    $.ajax(ajaxOptions);
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

function displayDeleteModal(studentObj){
    $('#delete_modal').modal('show');
    $('.delete_modal_name').empty().text('Name:  ' + studentObj.name);
    $('.delete_modal_course').empty().text('Course:  ' + studentObj.course);
    $('.delete_modal_grade').empty().text('Grade:  ' + studentObj.grade);
}

function displayErrorModal(errorTitle, errorMessages){
    $('#errorModal').modal('show');
    $('#errorModal .errorModalTitle').text(errorTitle);
    $('#errorModal .errorModalMessage p').empty().append(errorMessages);
}

function handleAjaxError(){
    displayErrorModal("Server Error", ['There was a problem connecting to the server. Try again in a few minutes.']);
}

function addLoadingForButton(button){
    $(button).off('click');
    $(button).find('.loadingSpinner').addClass('glyphicon glyphicon-refresh animateSpin');
}

function removeLoadingForButton(button, callbackFunction){
    $(button).find('.loadingSpinner').removeClass('glyphicon glyphicon-refresh animateSpin');
    if (callbackFunction){
        $(button).on('click', callbackFunction);
    }
}