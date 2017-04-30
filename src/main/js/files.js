var File_Upload = require('./file_upload').default;


$(function () {
    $('.js-upload-files').click(function () {
        new File_Upload('#id_file');
    });

    $('.delete_file').click(function (e) {
        var ID = $(this).data('file_id');
        return File_Upload.deleteFN(ID, $(this).data('csrftoken'), $(this))(e)
    });

})