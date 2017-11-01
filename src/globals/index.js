const MODAL = require('./Modal.js').default;
const navbar = $('nav.navbar');

$(() => {
    $('#contactForm').validate();
    $('.navbar-nav li a').bind('click', (event) => {
        let $anchor = $(this);
        let nav = $($anchor.attr('href') != '#' ? $anchor.attr('href') != '#' : '');
        if (nav.length) {
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        }
    });
    // Add smooth scrolling to all links in navbar
    $(".navbar a, a.mouse-hover, .overlay-detail a").on('click', (event) => {
        event.preventDefault();
        let hash = this.hash;
        if (hash) {
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 900, () => {
                window.location.hash = hash;
            });
        }
    });
    $('.btn-unsubscribe').click(() => {
        let self = this;
        let modal_id = 'unsub-' + $(this).data('id');
        let modal = new MODAL('Unsubscribe', 'Are you sure you want to remove this subscription?', modal_id);
        modal.run_modal((e) => {
            window.location.href = $(self).data('href')
        })
    });
    $(() => {
        $('[data-toggle="tooltip"]').tooltip()
    })
});
