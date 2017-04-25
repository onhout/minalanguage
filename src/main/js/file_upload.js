var csrf_token = require('../../globals/Utils/csrf_token').default;
var Alert = require('../../globals/Parts/Alert').default;

class ImageUpload {
    constructor(element) {
        var id_image = $(element);
        id_image.click();

        id_image.fileupload({
            dataType: 'json',
            sequentialUploads: true,
            acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
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
            },
            done: function (e, data) {  /* PROCESS THE RESPONSE FROM THE SERVER */
                if (data.result.is_valid) {
                    console.log(data.result)
                    var imageTableRow = new ImageTableRow(data, csrf_token);
                    $('#product_gallery tbody').prepend(imageTableRow);
                    if (data.result.total_image_num = 7) {
                        $('.js-upload-photos').addClass('disabled');
                    }
                } else if (!data.result.is_valid && data.result.total_image_num >= 8) {
                    $('#product_gallery').before(new Alert('Maximum 8 pictures are allowed'));
                    $('.js-upload-photos').addClass('disabled');
                    return false;
                }
            }
        })
    }

    static deleteFN(image_id, csrftoken, SELF) {
        return function (e) {
            e.preventDefault();
            var self = this || SELF;
            var href = '/products/image/delete/' + image_id + '/';
            $.post(href, csrftoken, function (data) {
                if (data.success) {
                    $(self).closest('tr').remove();
                    if ($('.js-upload-photos').hasClass('disabled')) {
                        $('.js-upload-photos').removeClass('disabled')
                    }
                }
            })
        }
    }

    static makePrimaryPhoto(image_id, csrftoken, SELF) {
        return function (e) {
            e.preventDefault();
            var self = this || SELF;
            var href = '/products/image/set_primary/' + image_id + '/';
            $.post(href, csrftoken, function (data) {
                if (data.success) {
                    $(self).closest('tr').css('background-color:red');
                    $(self).hide();
                    $('.make_primary_photo').not(self).show()
                }
            })
        }
    }
}

class ImageTableRow {

    constructor(data, csrfToken) {
        var self = this;
        this.row = $('<tr>');
        this.imgLink = $('<a>', {
            href: data.result.url
        });
        this.img = $('<img>',
            {
                'class': 'img-responsive img-rounded',
                'src': data.result.url,
                'style': 'max-height:56px'
            });
        this.updated = $('<td>' + data.result.updated_at + '</td>');
        this.deleteBtn = $('<a/>',
            {
                'class': 'btn btn-danger btn-raised delete_photo',
                'text': 'Delete'
            }).click(ImageUpload.deleteFN(data.result.image_id,
            {csrfmiddlewaretoken: '' + csrfToken.getCookie('csrftoken')}));
        this.makePrimaryBtn = $('<a/>', {
            'class': 'btn btn-info btn-raised make_primary_photo',
            'text': 'Make Primary'
        }).click(ImageUpload.makePrimaryPhoto(data.result.image_id,
            {csrfmiddlewaretoken: '' + csrfToken.getCookie('csrftoken')}));
        this._row = this.row
            .append($('<td>').append(this.imgLink.append(this.img)))
            .append(this.updated)
            .append($('<td>').append(this.deleteBtn).append(this.makePrimaryBtn));

        return this._row;
    }
}

export default ImageUpload