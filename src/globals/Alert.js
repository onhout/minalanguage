class Alert {
    constructor(message) {
        var alert = $('<div/>', {
            'class': 'alert alert-danger alert-dismissible',
            'role': 'alert'
        });
        var closeButton = $('<button/>', {
            'class': 'close',
            'data-dismiss': 'alert',
            'aria-label': 'Close'
        }).append('<span aria-hidden="true">&times;</span>');
        return alert.append(closeButton).append(message)
    }
}

export default Alert