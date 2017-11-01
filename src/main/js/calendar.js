const ALERT = require('../../globals/Alert.js').default;
const CSRF_TOKEN = require('../../globals/csrf_token.js').default;
const PAYMENT = require('./payment.js').default;
const MODAL = require('../../globals/Modal.js').default;
$(() => {
    let totalMinutes = 0;
    let totalHours = 0;
    let payment = new PAYMENT;
    let csrftoken = CSRF_TOKEN.getCookie('csrftoken');
    let payment_obj = {};
    let eventList = [];
    let calendar = $('#calendar');
    let calendarOptions = {
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
        select: (start, end, jsEvent, view) => {
            let modal_id = 'confirm-time';
            if (moment(start).subtract(12, 'hour') > moment()) {
                let eventData;
                let modal = new MODAL('Confirm', '', modal_id);
                let class_type = $('<div class="form-group">' +
                    '<div class="category">Choose lecture type: </div>' +
                    '<select class="form-control" id="class_type">' +
                    '<option value="korean">Korean</option>' +
                    '<option value="chinese">Chinese</option>' +
                    '</select></div>');
                let select = $('<div class="form-group">' +
                    '<div class="category">Choose booking type: </small>' +
                    '<select class="form-control" id="booking_type">' +
                    '<option value="online">Online</option>' +
                    '<option value="in-person">In Person</option>' +
                    '</select></div>');
                modal.modal_body = $('<div>Do you want to book from ' +
                    moment(start).format('MM/DD hh:mm:ss') + ' to ' +
                    moment(end).format('MM/DD hh:mm:ss') + '?</div>').append("<hr>").append(class_type).append(select);
                modal.run_modal(() => {
                    let differenceInMs = moment(end).diff(moment(start)); // diff yields milliseconds
                    let duration = moment.duration(differenceInMs);
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
                        $('.errors').append(new ALERT('Meeting cannot be booked/edited 30 minutes before or after another event', 'danger'));
                        calendar.fullCalendar('unselect');
                    }
                });
                $('#modal-' + modal_id).on('hide.bs.modal', () => {
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
        eventDrop: (event, delta, revertFunc) => {
            if (moment(event.start).subtract(12, 'hour') < moment()) {
                $('.errors').append(new ALERT('Cannot move to previous dates or at least twelve hours before start time, sorry.', 'danger'));
                revertFunc()
            } else if (checkOverlap(event) > 1 /*reason being that the node being moved counts as 1*/) {
                $('.errors').append(new ALERT('Meeting cannot be booked/edited 30 minutes before or after another event', 'danger'));
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
                }).done((data) => {
                    if (data.status == 'success') {
                        $('.errors').append(new ALERT('Time changed successfully', 'success'));
                    } else {
                        $('.errors').append(new ALERT('Error occurred', 'warning'));
                    }
                })
            }
        },
        eventResize: (event, delta, revertFunc) => {
            if (moment(event.start).subtract(12, 'hour') < moment()) {
                $('.errors').append(new ALERT('Cannot move to previous dates or at least twelve hours before start time, sorry.', 'danger'));
                revertFunc()
            } else if (checkOverlap(event) > 1 /*reason being that the node being moved counts as 1*/) {
                $('.errors').append(new ALERT('Meeting cannot be booked/edited 30 minutes before or after another event', 'danger'));
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
                }).done((data) => {
                    if (data.status == 'success') {
                        $('.errors').append(new ALERT('Time changed successfully', 'success'));
                    } else {
                        $('.errors').append(new ALERT('Error occurred', 'warning'));
                    }
                })
            }
        },
        eventClick: (calEvent, jsEvent, view) => {
            if (calEvent.meeting_id) {
                let modal_id = 'edit' + calEvent.start;
                let modal = new MODAL('Edit Meeting', '', modal_id);
                let edit_location = '';
                let class_type = '';
                if (calEvent.is_admin && calEvent.type == 'in-person') {
                    edit_location = $('<div/>', {
                        class: 'form-group'
                    }).append($('<div/>', {
                        "class": 'category',
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
                        text: 'Sorry, subscription events cannot switch between classes currently, contact Mina Jeong for more info.'
                    })
                } else {
                    class_type = $('<div class="form-group">' +
                        '<div class="category">Choose lecture type: </div>' +
                        '<select class="form-control" id="class_type">' +
                        '<option value="korean">Korean</option>' +
                        '<option value="chinese">Chinese</option>' +
                        '</select></div>');
                }

                let select = $('<div class="form-group">' +
                    '<div class="category">Choose booking type: </div>' +
                    '<select class="form-control" id="booking_type">' +
                    '<option value="online">Online</option>' +
                    '<option value="in-person">In Person</option>' +
                    '</select></div>');
                modal.modal_body = $('<div/>', {
                    text: "Currently this lecture is a " + calEvent.class_type + " lecture and its " + calEvent.type + "."
                }).append('<hr>').append(class_type).append(select).append(edit_location);
                modal.run_modal(() => {
                    $.ajax({
                        type: 'POST',
                        url: '/meetings/edit?meeting_id=' + calEvent.meeting_id,
                        data: {
                            csrfmiddlewaretoken: csrftoken,
                            book_type: $('#booking_type').val(),
                            class_type: $('#class_type').val() || '',
                            location: $('#location').val()
                        }
                    }).done((data) => {
                        if (data.status == 'success') {
                            $('.errors').append(new ALERT('Event settings changed successfully', 'success'));
                            calendar.fullCalendar('refetchEvents')
                        } else {
                            $('.errors').append(new ALERT('Error occurred', 'warning'));
                        }
                    });
                });
                $('#modal-' + modal_id).on('hide.bs.modal', () => {
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
        let totalDurationHours = 0;
        let totalDurationMinutes = 0;
        $.each(eventList, (i, event) => {
            let differenceInMs = moment(event.end).diff(moment(event.start)); // diff yields milliseconds
            let duration = moment.duration(differenceInMs);
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
        let start = new Date(event.start);
        let end = new Date(event.end);
        let overlap = calendar.fullCalendar('clientEvents', (ev) => {
            let evEnd = moment(ev.end).add(30, 'minute');
            let evStart = moment(ev.start).subtract(30, 'minute');
            if (ev == event)
                return false;
            let estart = new Date(evStart);
            let eend = new Date(evEnd);
            return (((Math.round(estart) / 1000) < (Math.round(end) / 1000)) && (Math.round(eend) > Math.round(start)));
        });
        return overlap.length
    }

    $('#super_btn').click(() => {
        if (eventList.length > 0) {
            $.each(eventList, (i, v) => {
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
            });
            window.location.reload()
        }
    });
    $('#reset_btn').click(() => {
        calendar.fullCalendar('removeEvents', 'temp');
        eventList = [];
        $('#duration').text('0');
        $('#pay_btn').attr('disabled', true);
        $('#subscribe_btn').attr('disabled', true);
        $('.initial_dollar').text('0');
    });
    calendar.fullCalendar(calendarOptions);
    $('#pay_btn').click((e) => {
        payment.pay_obj = payment_obj;
        payment.token_function = (token) => {
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
                }).done(() => {
                    window.location.reload()
                });
            }
        };
        e.preventDefault();
        payment.create()
    });
    $('#subscribe_btn').click((e) => {
        payment.pay_obj = {
            name: "Mina's Language Class",
            description: 'Monthly Subscription - 8 sessions per month',
            amount: 40000
        };
        payment.token_function = (token) => {
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
                }).done(() => {
                    window.location.reload()
                });
            }
        };
        e.preventDefault();
        payment.create();
    });

});

