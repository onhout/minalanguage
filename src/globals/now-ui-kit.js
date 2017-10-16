$(function () {
    let nowuiKit = {
        misc: {
            navbar_menu_visible: 0
        },

        checkScrollForTransparentNavbar: debounce(function () {
            if ($(document).scrollTop() > scroll_distance) {
                if (transparent) {
                    transparent = false;
                    $navbar.removeClass('navbar-transparent');
                }
            } else {
                if (!transparent) {
                    transparent = true;
                    $navbar.addClass('navbar-transparent');
                }
            }
        }, 17),

        initNavbarImage: function () {
            let $navbar = $('.navbar').find('.navbar-translate').siblings('.navbar-collapse');
            let background_image = $navbar.data('nav-image');

            if ($(window).width() < 991 || $('body').hasClass('burger-menu')) {
                if (background_image != undefined) {
                    $navbar.css('background', "url('" + background_image + "')")
                        .removeAttr('data-nav-image')
                        .css('background-size', "cover")
                        .addClass('has-image');
                }
            } else if (background_image != undefined) {
                $navbar.css('background', "")
                    .attr('data-nav-image', '' + background_image + '')
                    .css('background-size', "")
                    .removeClass('has-image');
            }
        },

        initSliders: function () {
            // Sliders for demo purpose in refine cards section
            let slider = document.getElementById('sliderRegular');

            noUiSlider.create(slider, {
                start: 40,
                connect: [true, false],
                range: {
                    min: 0,
                    max: 100
                }
            });

            let slider2 = document.getElementById('sliderDouble');

            noUiSlider.create(slider2, {
                start: [20, 60],
                connect: true,
                range: {
                    min: 0,
                    max: 100
                }
            });
        }
    };
    let big_image;

// Javascript just for Demo purpose, remove it from your project
    let nowuiKitDemo = {
        checkScrollForParallax: debounce(function () {
            let current_scroll = $(this).scrollTop();

            let oVal = ($(window).scrollTop() / 3);
            big_image.css({
                'transform': 'translate3d(0,' + oVal + 'px,0)',
                '-webkit-transform': 'translate3d(0,' + oVal + 'px,0)',
                '-ms-transform': 'translate3d(0,' + oVal + 'px,0)',
                '-o-transform': 'translate3d(0,' + oVal + 'px,0)'
            });

        }, 6)

    };

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

    function debounce(func, wait, immediate) {
        let timeout;
        return function () {
            let context = this,
                args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    }
    let transparent = true;

    let transparentDemo = true;
    let fixedTop = false;

    let navbar_initialized,
        backgroundOrange = false,
        toggle_initialized = false;

    let $navbar = $('nav.navbar');
    let scroll_distance = $navbar.attr('color-on-scroll');
    //  Activate the Tooltips
    $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip();

    // Activate Popovers and set color for popovers
    $('[data-toggle="popover"]').each(function () {
        color_class = $(this).data('color');
        $(this).popover({
            template: '<div class="popover popover-' + color_class + '" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
        });
    });

    // Activate the image for the navbar-collapse
    nowuiKit.initNavbarImage();


    // Check if we have the class "navbar-color-on-scroll" then add the function to remove the class "navbar-transparent" so it will transform to a plain color.

    if ($('.navbar[color-on-scroll]').length != 0 && window.location.pathname === '/') {
        nowuiKit.checkScrollForTransparentNavbar();
        $(window).on('scroll', nowuiKit.checkScrollForTransparentNavbar)
    } else {
        $('.navbar-logo').show();
        $navbar.removeClass('navbar-transparent');
    }

    $('.form-control').on("focus", function () {
        $(this).parent('.input-group').addClass("input-group-focus");
    }).on("blur", function () {
        $(this).parent(".input-group").removeClass("input-group-focus");
    });

    // Activate bootstrapSwitch
    $('.bootstrap-switch').each(function () {
        $this = $(this);
        data_on_label = $this.data('on-label') || '';
        data_off_label = $this.data('off-label') || '';

        $this.bootstrapSwitch({
            onText: data_on_label,
            offText: data_off_label
        });
    });

    if ($(window).width() >= 992) {
        big_image = $('.page-header-image[data-parallax="true"]');

        $(window).on('scroll', nowuiKitDemo.checkScrollForParallax);
    }

    // Activate Carousel
    $('.carousel').carousel({
        interval: 4000
    });

    $('.date-picker').each(function () {
        $(this).datepicker({
            templates: {
                leftArrow: '<i class="now-ui-icons arrows-1_minimal-left"></i>',
                rightArrow: '<i class="now-ui-icons arrows-1_minimal-right"></i>'
            }
        }).on('show', function () {
            $('.datepicker').addClass('open');

            datepicker_color = $(this).data('datepicker-color');
            if (datepicker_color.length != 0) {
                $('.datepicker').addClass('datepicker-' + datepicker_color + '');
            }
        }).on('hide', function () {
            $('.datepicker').removeClass('open');
        });
    });

    $('.switch.switch-background input').on("switchChange.bootstrapSwitch", function () {
        $input = $(this);

        if (!$input.is(':checked')) {
            $('.section:not(.section-notifications):not(.section-tabs):not(.section-download):not(.section-examples)').each(function () {
                $(this).fadeOut('fast', function () {
                    $(this).attr('data-background-color', 'orange');
                    $(this).fadeIn('fast');
                });

            });

            switch_orange = $('.navbar .collapse .navbar-nav.navbar-switch .nav-item .nav-link p.hidden');
            switch_white = $('.navbar .collapse .navbar-nav.navbar-switch .nav-item .nav-link p.visible');
            switch_white.removeClass('visible').addClass('hidden');
            switch_orange.removeClass('hidden').addClass('visible');

            $('.section.section-navbars > .container .navbar.bg-primary, .section.section-navbars > .container .navbar.bg-info').each(function () {
                $(this).addClass('bg-white');
            });

            $('.btn-primary,.btn-default,.btn-link').each(function () {
                $(this).addClass('btn-neutral');
            });

            $('button[data-toggle="popover"], button[data-toggle="tooltip"]').each(function () {
                $(this).removeClass('btn-default');
                $(this).addClass('btn-neutral');
            });

            $('.nav.nav-pills').each(function () {
                $(this).addClass('nav-pills-neutral');

                if ($('.nav.nav-pills.nav-pills-primary').length != 0) {
                    $(this).removeClass('nav-pills-primary');
                }
            });

            $('.pagination').each(function () {
                $(this).addClass('pagination-neutral');
            });

            $('.progress-container').each(function () {
                $(this).addClass('progress-neutral');

                if ($('.progress-container.progress-neutral').length != 0) {
                    $(this).removeClass('progress-primary');
                }
            });

            $('.badge').each(function () {
                $(this).addClass('badge-neutral');
            });

            $('.slider').each(function () {
                $(this).addClass('slider-neutral');

                if ($('.slider.slider-neutral').length != 0) {
                    $(this).removeClass('slider-primary')
                        .removeClass('slider-default');
                }
            });

            $('.blockquote').each(function () {
                $(this).addClass('blockquote-white');

                if ($('.blockuote.blockquote-white').length != 0) {
                    $(this).removeClass('blockquote-primary');
                }
            });

            backgroundOrange = true;
        } else {
            $('.section:not(.section-notifications):not(.section-tabs):not(.section-download):not(.section-examples)').each(function () {
                $(this).fadeOut('fast', function () {
                    $(this).removeAttr('data-background-color', 'orange');
                    $(this).fadeIn('fast');
                });
            });

            switch_white.removeClass('hidden').addClass('visible');
            switch_orange.removeClass('visible').addClass('hidden');

            $('.btn-primary,.btn-default,.btn-link').each(function () {
                $(this).removeClass('btn-neutral');
            });

            $('.section.section-navbars > .container .navbar.bg-primary, .section.section-navbars > .container .navbar.bg-info').each(function () {
                $(this).removeClass('bg-white');
            });

            $('button[data-toggle="popover"], button[data-toggle="tooltip"]').each(function () {
                $(this).removeClass('btn-neutral');
                $(this).addClass('btn-default');
            });

            $('.nav.nav-pills').each(function () {
                $(this).removeClass('nav-pills-neutral');

                if ($('.nav.nav-pills.nav-pills-neutral').length == 0) {
                    $(this).addClass('nav-pills-primary');
                }
            });

            $('.pagination').each(function () {
                $(this).removeClass('pagination-neutral');
            });

            $('.progress-container').each(function () {
                $(this).removeClass('progress-neutral');

                if ($('.progress-container.progress-neutral').length == 0) {
                    $(this).addClass('progress-primary');
                }
            });

            $('.badge').each(function () {
                $(this).removeClass('badge-neutral');
            });

            $('.slider').each(function () {
                $(this).removeClass('slider-neutral');

                if ($('.slider.slider-neutral').length == 0) {
                    $(this).addClass('slider-primary');
                }
            });

            $('.blockquote').each(function () {
                $(this).removeClass('blockquote-white');

                if ($('.blockuote.blockquote-white').length == 0) {
                    $(this).addClass('blockquote-primary');
                }
            });

            backgroundOrange = false;
        }
    });

    $(window).on('resize', function () {
        nowuiKit.initNavbarImage();
    });

    $('.navbar-toggler').click(function () {
        let $toggle = $(this);

        if (nowuiKit.misc.navbar_menu_visible == 1) {
            $('html').removeClass('nav-open');
            nowuiKit.misc.navbar_menu_visible = 0;
            $('#bodyClick').remove();
            setTimeout(function () {
                $toggle.removeClass('toggled');
            }, 550);
        } else {
            setTimeout(function () {
                $toggle.addClass('toggled');
            }, 580);
            let div = '<div id="bodyClick"></div>';
            $(div).appendTo('body').click(function () {
                $('html').removeClass('nav-open');
                nowuiKit.misc.navbar_menu_visible = 0;
                setTimeout(function () {
                    $toggle.removeClass('toggled');
                    $('#bodyClick').remove();
                }, 550);
            });

            $('html').addClass('nav-open');
            nowuiKit.misc.navbar_menu_visible = 1;
        }
    });


});
