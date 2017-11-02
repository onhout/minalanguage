const csrf_token = require('../../globals/csrf_token').default;
const Alert = require('../../globals/Alert').default;
class FileUpload {

    openDialog(element) {
        $(element).click();
        $(element).fileupload({
            dataType: 'json',
            sequentialUploads: true,
            start: (e) => {
                $('.progress-container').show();
            },
            stop: (e) => {
                $('.progress-container').hide();
            },
            progressall: (e, data) => {  /* UPDATE THE PROGRESS BAR */
                let progress = parseInt(data.loaded / data.total * 100, 10);
                let strProgress = progress + "%";
                $(".progress-bar").css({"width": strProgress});
                $(".progress-text").text(strProgress)
            },
            done: (e, data) => {  /* PROCESS THE RESPONSE FROM THE SERVER */
                if (data.result.status == 'success') {
                    $('.errors').append(new Alert('File successfully uploaded', 'success'));
                    let fileTableRow = new FileTableRow(data, csrf_token);
                    $('#file_table tbody').prepend(fileTableRow);
                }
            }
        })
    }

    deleteFN(file_id, csrftoken, SELF) {
        return (e) => {
            e.preventDefault();
            let self = SELF;
            let href = '/file/delete/' + file_id + '/';
            $.post(href, csrftoken, (data) => {
                if (data.success) {
                    $('.errors').append(new Alert('File successfully deleted', 'danger'));
                    $(self).closest('tr').remove();
                    if ($('.js-upload-files').hasClass('disabled')) {
                        $('.js-upload-files').removeClass('disabled')
                    }
                }
            })
        }
    }
}
class FileTableRow {
    constructor(data, csrfToken) {
        let self = this;
        this.row = $('<tr>');
        this.link = $('<a>', {
            href: data.result.url,
            text: data.result.file_name
        });
        this.updated = $('<td>' + data.result.uploaded_at + '</td>');
        var newupload = new FileUpload();
        this.deleteBtn = $('<a/>',
            {
                'href': '#',
                'class': 'btn btn-danger delete_file',
                'text': 'Delete'
            });
        this.deleteBtn.click(newupload.deleteFN(data.result.file_id,
            {csrfmiddlewaretoken: '' + csrfToken.getCookie('csrftoken')},
            this.deleteBtn)
        );

        this._row = this.row
            .append($('<td>').append(this.link))
            .append(this.updated)
            .append($('<td>').append(this.deleteBtn));
        return this._row;
    }
}
export default FileUpload