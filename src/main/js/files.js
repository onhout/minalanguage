import File_Upload from "./file_upload";

$(()=> {
    let fileupload = new File_Upload();
    $('.js-upload-files').click(() => {
        fileupload.openDialog('#id_file');
    });
    $('.delete_file').click(function (e) {
        let ID = $(this).data('file_id');
        fileupload.deleteFN(ID, $(this).data('csrftoken'), $(this))(e)
    });
});