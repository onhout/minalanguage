import '../main/js/calendar.js'
import '../main/js/file_upload.js'
import '../main/js/files.js'
import '../main/js/main.js'
import '../main/js/outline-tree.js'
import '../main/js/payment.js'
import MODAL from "./Modal";

const navbar = $('nav.navbar');

$(() => {
    $('#contactForm').validate();
    $('.navbar-nav li a:not(a.link)').click(event => {
        const target = $(this.hash);
        const self = $(this);
        event.preventDefault();
        if (self[0].hash && window.location.pathname == '/') {
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 1500, 'easeInOutExpo', function () {
                // Callback after animation
                // Must change focus!F
                const $target = $(target);
                $target.focus();
                if ($target.is(":focus")) { // Checking if the target was focused
                    return false;
                } else {
                    $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                    $target.focus(); // Set focus again
                }
            });
        } else {
            window.location.href = self.attr('href');
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
