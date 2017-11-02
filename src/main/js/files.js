const File_Upload = require('./file_upload').default;

$(()=> {
    var fileupload = new File_Upload();
    $('.js-upload-files').click(() => {
        fileupload.openDialog('#id_file');
    });
    $('.delete_file').click(function (e) {
        var ID = $(this).data('file_id');
        fileupload.deleteFN(ID, $(this).data('csrftoken'), $(this))(e)
    });
});