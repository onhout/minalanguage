var ALERT = require('../../globals/Alert.js').default;
var CSRF_TOKEN = require('../../globals/csrf_token.js').default;
var PAYMENT = require('./payment.js').default;
var MODAL = require('../../globals/Modal.js').default;

$(function () {
    var totalMinutes = 0;
    var totalHours = 0;
    var payment = new PAYMENT;
    var csrftoken = CSRF_TOKEN.getCookie('csrftoken');
    var payment_obj = {};
    var eventList = [];
    var calendar = $('#calendar');
    var calendarOptions = {
        defaultView: 'agendaWeek',
        theme: true,
        header: {
            left: 'title',
            center: '',
            right: 'today,month,agendaWeek prev,next'
        },
        selectable: true,
        selectHelper: true,
        allDaySlot: false,
        minTime: '07:30',
        maxTime: '17:30',
        snapDuration: '00:60:00',
        slotDuration: '00:30:00',
        businessHours: {
            dow: [0, 1, 2, 3, 4, 5, 6],
            start: '8:00',
            end: '17:00'
        },
        selectConstraint: {
            start: '08:00',
            end: '17:00'
        },
        eventConstraint: {
            start: '08:00', // a start time (10am in this example)
            end: '17:00', // an end time (6pm in this example)
        },
        eventOverlap: false,
        height: 'auto',
        firstDay: moment().day(),
        unselectAuto: false,
        select: function (start, end, jsEvent, view) {
            var modal_id = 'confirm-time';
            if (moment(start).subtract(12, 'hour') > moment()) {
                var eventData;
                var modal = new MODAL('Confirm', '', modal_id);
                var class_type = $('<div class="form-group">' +
                    '<div class="category">Choose lecture type: </div>' +
                    '<select class="form-control" id="class_type">' +
                    '<option value="korean">Korean</option>' +
                    '<option value="chinese">Chinese</option>' +
                    '</select></div>');

                var select = $('<div class="form-group">' +
                    '<div class="category">Choose booking type: </small>' +
                    '<select class="form-control" id="booking_type">' +
                    '<option value="online">Online</option>' +
                    '<option value="in-person">In Person</option>' +
                    '</select></div>');
                modal.modal_body = $('<div><h4>Do you want to book from ' +
                    moment(start).format('MM/DD hh:mm:ss') + ' to ' +
                    moment(end).format('MM/DD hh:mm:ss') + '?</h4></div>').append("<hr>").append(class_type).append(select);
                modal.run_modal(function () {
                    var differenceInMs = moment(end).diff(moment(start)); // diff yields milliseconds
                    var duration = moment.duration(differenceInMs);
                    eventData = {
                        book_type: $('#booking_type').val() ? $('#booking_type').val() : 'online',
                        class_type: $('#class_type').val() ? $('#class_type').val() : 'korean',
                        title: 'Booked - (' + ($('#booking_type').val() ? $('#booking_type').val() : 'online') + ')',
                        start: start,
                        end: end,
                        transaction_amount: duration.asMinutes()
                    };
                    if (!checkOverlap(eventData)) {
                        calculateDuration(eventData);
                        calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
                    } else {
                        $('.errors').append(new ALERT('Meeting cannot be booked 30 minutes before or after another event', 'danger'));
                        calendar.fullCalendar('unselect');
                    }

                });
                $('#modal-' + modal_id).on('hide.bs.modal', function () {
                    calendar.fullCalendar('unselect');
                });
            } else {
                $('.errors').append(new ALERT('Cannot book previous dates or at least twelve hours before start time, sorry.', 'danger'));
                calendar.fullCalendar('unselect');
            }
        },
        events: '/meetings/get_meetings',
        startParam: 'from_date',
        endParam: 'to_date',
        eventDrop: function (event, delta, revertFunc) {
            if (moment(event.start).subtract(12, 'hour') < moment()) {
                $('.errors').append(new ALERT('Cannot move to previous dates or at least twelve hours before start time, sorry.', 'danger'));
                revertFunc()
            } else if (checkOverlap(event)) {
                $('.errors').append(new ALERT('Meeting cannot be booked 30 minutes before or after another event', 'danger'));
                revertFunc()
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/meetings/edit?meeting_id=' + event.meeting_id,
                    data: {
                        csrfmiddlewaretoken: csrftoken,
                        start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
                        end: moment(event.end).format('YYYY-MM-DD HH:mm:ss')
                    }
                }).done(function (data) {
                    if (data.status == 'success') {
                        $('.errors').append(new ALERT('Time changed successfully', 'success'));
                    } else {
                        $('.errors').append(new ALERT('Error occurred', 'warning'));
                    }
                })
            }

        },
        eventResize: function (event, delta, revertFunc) {
            if (moment(event.start).subtract(12, 'hour') < moment()) {
                $('.errors').append(new ALERT('Cannot move to previous dates or at least twelve hours before start time, sorry.', 'danger'));
                revertFunc()
            } else if (checkOverlap(event)) {
                $('.errors').append(new ALERT('Meeting cannot be booked 30 minutes before or after another event', 'danger'));
                revertFunc()
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/meetings/edit?meeting_id=' + event.meeting_id,
                    data: {
                        csrfmiddlewaretoken: csrftoken,
                        start: moment(event.start).format('YYYY-MM-DD HH:mm:ss'),
                        end: moment(event.end).format('YYYY-MM-DD HH:mm:ss')
                    }
                }).done(function (data) {
                    if (data.status == 'success') {
                        $('.errors').append(new ALERT('Time changed successfully', 'success'));
                    } else {
                        $('.errors').append(new ALERT('Error occurred', 'warning'));
                    }
                })
            }

        },
        eventClick: function (calEvent, jsEvent, view) {
            if (calEvent.meeting_id) {
                var modal_id = 'edit' + calEvent.start;
                var modal = new MODAL('Edit Meeting', '', modal_id);
                var edit_location = '';
                var class_type = '';
                if (calEvent.is_admin && calEvent.type == 'in-person') {
                    edit_location = $('<div/>', {
                        class: 'form-group'
                    }).append($('<label/>', {
                        "for": 'location',
                        "text": "Location: "
                    })).append($('<input/>', {
                        id: "location",
                        class: 'form-control',
                        placeholder: 'Location',
                        value: calEvent.location
                    }))
                } else if (!calEvent.is_admin && calEvent.type == 'in-person') {
                    edit_location = $('<h5/>', {
                        text: "Meeting Location: " + calEvent.location
                    });
                } else {
                    edit_location = '';
                }

                if (calEvent.subscription) {
                    class_type = $('<div/>', {
                        class: 'text-warning',
                        text: 'Sorry, currently subscription events cannot switch between Chinese or Korean'
                    })
                } else {
                    class_type = $('<div class="form-group">' +
                        '<small>Choose lecture type: </small>' +
                        '<select class="form-control" id="class_type">' +
                        '<option value="korean">Korean</option>' +
                        '<option value="chinese">Chinese</option>' +
                        '</select></div>');
                }


                var select = $('<div class="form-group">' +
                    '<small>Choose booking type: </small>' +
                    '<select class="form-control" id="booking_type">' +
                    '<option value="online">Online</option>' +
                    '<option value="in-person">In Person</option>' +
                    '</select></div>');

                modal.modal_body = $('<div/>', {
                    text: "Currently this lecture is a " + calEvent.class_type + " lecture and its " + calEvent.type + "."
                }).append('<hr>').append(class_type).append(select).append(edit_location);

                modal.run_modal(function () {
                    $.ajax({
                        type: 'POST',
                        url: '/meetings/edit?meeting_id=' + calEvent.meeting_id,
                        data: {
                            csrfmiddlewaretoken: csrftoken,
                            book_type: $('#booking_type').val(),
                            class_type: $('#class_type').val() || '',
                            location: $('#location').val()
                        }
                    }).done(function (data) {
                        if (data.status == 'success') {
                            $('.errors').append(new ALERT('Event settings changed successfully', 'success'));
                            calendar.fullCalendar('refetchEvents')
                        } else {
                            $('.errors').append(new ALERT('Error occurred', 'warning'));
                        }
                    });
                });
                $('#modal-' + modal_id).on('hide.bs.modal', function () {
                    calendar.fullCalendar('unselect');
                });

                $('select > option[value="' + calEvent.type + '"]').attr('selected', 'selected');
                $('select > option[value="' + calEvent.class_type + '"]').attr('selected', 'selected')
            }
        }
    };

    function calculateDuration(eventData) {
        eventData.id = 'temp';
        eventList.push(eventData);
        var totalDurationHours = 0;
        var totalDurationMinutes = 0;
        $.each(eventList, function (i, event) {
            var differenceInMs = moment(event.end).diff(moment(event.start)); // diff yields milliseconds
            var duration = moment.duration(differenceInMs);
            totalDurationHours += duration.asHours();
            totalDurationMinutes += duration.asMinutes();
            event.start = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
            event.end = moment(event.end).format('YYYY-MM-DD HH:mm:ss');
        });

        if (totalDurationHours >= 5) {
            totalDurationMinutes -= 20;
            totalMinutes -= 20;
        }
        totalMinutes = totalDurationMinutes;
        totalHours = totalDurationHours;

        $('#duration').text(totalDurationHours);
        $('#pay_btn').attr('disabled', false);
        totalDurationHours == 2 ? $('#subscribe_btn').attr('disabled', false) :
            $('#subscribe_btn').attr('disabled', true);
        $('.initial_dollar').text(totalDurationMinutes);

        payment_obj = {
            name: "Mina's Language Class",
            description: totalDurationHours + ' hours booking',
            amount: totalDurationMinutes * 100
        };
    }

    function checkOverlap(event) {
        var start = new Date(event.start);
        var end = new Date(event.end);

        var overlap = calendar.fullCalendar('clientEvents', function (ev) {
            var evEnd = moment(ev.end).add(30, 'minute');
            var evStart = moment(ev.start).subtract(30, 'minute');
            if (ev == event)
                return false;
            var estart = new Date(evStart);
            var eend = new Date(evEnd);

            return (Math.round(estart) / 1000 < Math.round(end) / 1000 && Math.round(eend) > Math.round(start));
        });
        return overlap.length
    }

    $('#super_btn').click(function () {
        if (eventList.length > 0) {
            $.each(eventList, function (i, v) {
                $.ajax({
                    type: 'POST',
                    url: '/meetings/superbook/',
                    data: {
                        csrfmiddlewaretoken: csrftoken,
                        start: moment(v.start).format('YYYY-MM-DD HH:mm:ss'),
                        end: moment(v.end).format('YYYY-MM-DD HH:mm:ss'),
                        book_type: 'in-person',
                        class_location: 'None'
                    }
                })
            })
            window.location.reload()
        }

    });

    $('#reset_btn').click(function () {
        calendar.fullCalendar('removeEvents', 'temp');
        eventList = [];
        $('#duration').text('0');
        $('#pay_btn').attr('disabled', true);
        $('#subscribe_btn').attr('disabled', true);
        $('.initial_dollar').text('0');
    });

    calendar.fullCalendar(calendarOptions);

    $('#pay_btn').click(function (e) {
        payment.pay_obj = payment_obj;
        payment.token_function = function (token) {
            if (eventList.length > 0 && token) {
                $.ajax({
                    type: 'POST',
                    url: '/book/',
                    data: {
                        csrfmiddlewaretoken: csrftoken,
                        booking: JSON.stringify({
                            stripeToken: token,
                            bookings: eventList,
                            cost: totalMinutes * 100
                        })
                    }
                }).done(function () {
                    window.location.reload()
                });
            }
        };
        e.preventDefault();
        payment.create()
    });

    $('#subscribe_btn').click(function (e) {
        payment.pay_obj = {
            name: "Mina's Language Class",
            description: 'Monthly Subscription - 8 sessions per month',
            amount: 40000
        };
        payment.token_function = function (token) {
            if (eventList.length > 0 && token) {
                $.ajax({
                    type: 'POST',
                    url: '/subscribe/',
                    data: {
                        csrfmiddlewaretoken: csrftoken,
                        booking: JSON.stringify({
                            stripeToken: token,
                            bookings: eventList,
                            cost: 40000
                        })
                    }
                }).done(function () {
                    window.location.reload()
                });
            }
        };
        e.preventDefault();
        payment.create();
    });


});


