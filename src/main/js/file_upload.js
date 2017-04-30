var csrf_token = require('../../globals/csrf_token').default;
var Alert = require('../../globals/Alert').default;

class FileUpload {
    constructor(element) {
        var id_file = $(element);
        id_file.click();

        id_file.fileupload({
            dataType: 'json',
            sequentialUploads: true,
            start: function (e) {
                $('.progress').show();
            },
            stop: function (e) {
                $('.progress').hide();
            },
            progressall: function (e, data) {  /* UPDATE THE PROGRESS BAR */
                var progress = parseInt(data.loaded / data.total * 100, 10);
                var strProgress = progress + "%";
                $(".progress-bar").css({"width": strProgress});
                $(".progress-text").text(strProgress)
            },
            done: function (e, data) {  /* PROCESS THE RESPONSE FROM THE SERVER */
                if (data.result.status == 'success') {
                    var fileTableRow = new FileTableRow(data, csrf_token);
                    $('#file_table tbody').prepend(fileTableRow);
                }
            }
        })
    }

    static deleteFN(file_id, csrftoken, SELF) {
        return function (e) {
            e.preventDefault();
            var self = this || SELF;
            var href = '/file/delete/' + file_id + '/';
            $.post(href, csrftoken, function (data) {
                if (data.success) {
                    $(self).closest('tr').remove();
                    if ($('.js-upload-files').hasClass('disabled')) {
                        $('.js-upload-files').removeClass('disabled')
                    }
                }
            })
        }
    }

    // static makePrimaryPhoto(file_id, csrftoken, SELF) {
    //     return function (e) {
    //         e.preventDefault();
    //         var self = this || SELF;
    //         var href = '/products/file/set_primary/' + file_id + '/';
    //         $.post(href, csrftoken, function (data) {
    //             if (data.success) {
    //                 $(self).closest('tr').css('background-color:red');
    //                 $(self).hide();
    //                 $('.make_primary_photo').not(self).show()
    //             }
    //         })
    //     }
    // }
}

class FileTableRow {

    constructor(data, csrfToken) {
        var self = this;
        this.row = $('<tr>');
        this.link = $('<a>', {
            href: data.result.url,
            text: data.result.file_name
        });
        this.updated = $('<td>' + data.result.uploaded_at + '</td>');
        this.deleteBtn = $('<a/>',
            {
                'class': 'btn btn-danger delete_file',
                'text': 'Delete'
            }).click(FileUpload.deleteFN(data.result.file_id,
            {csrfmiddlewaretoken: '' + csrfToken.getCookie('csrftoken')}));
        // this.makePrimaryBtn = $('<a/>', {
        //     'class': 'btn btn-info btn-raised make_primary_photo',
        //     'text': 'Make Primary'
        // }).click(FileUpload.makePrimaryPhoto(data.result.file_id,
        //     {csrfmiddlewaretoken: '' + csrfToken.getCookie('csrftoken')}));
        this._row = this.row
            .append($('<td>').append(this.link))
            .append(this.updated)
            .append($('<td>').append(this.deleteBtn));

        return this._row;
    }
}

export default FileUpload