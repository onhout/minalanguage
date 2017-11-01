const icons = {
    'success': '<i class="now-ui-icons ui-2_like"></i>',
    'info': '<i class="now-ui-icons travel_info"></i>',
    'warning': '<i class="now-ui-icons ui-1_bell-53"></i>',
    'danger': '<i class="fa fa-exclamation-circle"></i>'
};
class Alert {
    constructor(message, level) {
        let alert = $('<div/>', {
            'class': 'alert alert-' + level || 'danger' + ' alert-dismissible',
            'role': 'alert'
        }).append($('<div/>', {
            'class': 'container'
        }));
        let closeButton = $('<button/>', {
            'class': 'close',
            'data-dismiss': 'alert',
            'aria-label': 'Close'
        }).append('<i class="now-ui-icons ui-1_simple-remove"></i>');
        return alert.append($(icons[level])).append(' ' + message).append(closeButton)
            .fadeTo(5000, 1) //making opacity 1 to achieve a hack similar to window.setTimeout
            .slideUp(500, () => {
                $(this).remove();
            })
    }
}
export default Alert