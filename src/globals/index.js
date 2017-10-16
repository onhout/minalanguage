var MODAL = require('./Modal.js').default;
const navbar = $('nav.navbar');


$(function () {
    $('#contactForm').validate();

    $('.navbar-nav li a').bind('click', function (event) {
        // $('.navbar-nav li').removeClass('active');
        // $(this).closest('li').addClass('active');
        var $anchor = $(this);
        var nav = $($anchor.attr('href') != '#' ? $anchor.attr('href') != '#' : '');
        if (nav.length) {
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');

            event.preventDefault();
        }
    });

    // Add smooth scrolling to all links in navbar
    $(".navbar a, a.mouse-hover, .overlay-detail a").on('click', function (event) {
        event.preventDefault();
        var hash = this.hash;
        if (hash) {
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 900, function () {
                window.location.hash = hash;
            });
        }

    });

    $('.btn-unsubscribe').click(function () {
        var self = this;
        var modal_id = 'ubsub-' + $(this).data('id');
        var modal = new MODAL('Unsubscribe', 'Are you sure you want to remove this subscription?', modal_id);
        modal.run_modal(function (e) {
            window.location.href = $(self).data('href')
        })
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
});

