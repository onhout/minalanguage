class Modal {
    constructor(title, text, id) {
        this.id = id;
        this.save_text = 'Yes';
        this.modal_body = $('<p/>', {
            'text': text
        });
        this.modal_title = $('<h4/>', {
            'class': 'modal-title',
            'text': title
        });

        this.close_button = $('<button/>', {
            'class': 'btn btn-default btn-raised',
            'data-dismiss': 'modal',
            'text': 'Close'
        });
    }

    run_modal(callback) {
        var self = this;
        self.modal = $('<div/>', {
            'class': 'modal fade in',
            'id': 'modal-' + self.id
        })
            .append($('<div/>', {
                'class': 'modal-dialog'
            })
                .append($('<div/>', {
                    'class': 'modal-content'
                })
                    .append($('<div/>', {
                        'class': 'modal-header'
                    })
                        .append($('<button/>', {
                            'type': 'button',
                            'class': 'close',
                            'data-dismiss': 'modal',
                            'aria-hidden': 'true',
                            'text': 'x'
                        }))
                        .append(self.modal_title))
                    .append($('<div/>', {
                        'class': 'modal-body'
                    })
                        .append(self.modal_body))
                    .append($('<div/>', {
                        'class': 'modal-footer'
                    })
                        .append(self.close_button)
                        .append($('<button/>', {
                            'class': 'btn btn-primary btn-raised',
                            'data-dismiss': 'modal',
                            'text': self.save_text
                        }).click(callback)))));
        self.modal.appendTo($('body'));
        $('#modal-'+self.id).modal('show');
        $('#modal-'+self.id).on('hide.bs.modal', function () {
            self.modal.remove();
        })
    }
}

export default Modal