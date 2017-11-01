const File_Upload = require('./file_upload').default;

$(() => {
    $('.js-upload-files').click(() => {
        new File_Upload('#id_file');
    });
    $('.delete_file').click((e) => {
        var ID = $(this).data('file_id');
        return File_Upload.deleteFN(ID, $(this).data('csrftoken'), $(this))(e)
    });
});