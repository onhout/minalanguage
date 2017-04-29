var ALERT = require('../../globals/Alert.js').default;
var CSRF_TOKEN = require('../../globals/csrf_token.js').default;
var PAYMENT = require('./payment.js').default;
var MODAL = require('../../globals/Modal.js').default;

$(function () {
    var totalMinutes = 0;
    var totalHours = 0;
    var payment = new PAYMENT;
    var csrftoken = CSRF_TOKEN.getCookie('csrftoken');
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
        timezone: "local",
        firstDay: moment().day(),
        unselectAuto: false,
        select: function (start, end, jsEvent, view) {
            if (moment(start).subtract(1, 'hour') > moment()) {
                var eventData;
                var modal = new MODAL('Confirm', '');
                var select = $('<select class="form-control" id="booking_type">' +
                    '<option value="">--Select Meeting Type--</option>' +
                    '<option value="online">Online</option>' +
                    '<option value="in-person">In Person</option>' +
                    '</select>');
                modal.modal_body = $('<h4>Do you want to book from ' +
                    moment(start).format('MM/DD hh:mm:ss') + ' to ' +
                    moment(end).format('MM/DD hh:mm:ss') + '?</h4>').append(select);
                modal.run_modal(function () {
                    eventData = {
                        book_type: $('#booking_type').val() ? $('#booking_type').val() : 'online',
                        title: 'Booked - (' + ($('#booking_type').val() ? $('#booking_type').val() : 'online') + ')',
                        start: start,
                        end: end,
                    };
                    if (!checkOverlap(eventData)) {
                        calculateDuration(eventData);
                        calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
                    } else {
                        $('.errors').append(new ALERT('Meeting overlapped'));
                        calendar.fullCalendar('unselect');
                    }

                });
                $('#modal-confirm-time').on('hide.bs.modal', function () {
                    calendar.fullCalendar('unselect');
                });
            } else {
                $('.errors').append(new ALERT('Cannot book previous dates or one hour before start time, sorry.'));
                calendar.fullCalendar('unselect');
            }
        },
        events: '/meetings/get_meetings',
        startParam: 'from_date',
        endParam: 'to_date',
        eventDrop: function (event, delta, revertFunc) {
            if (moment(event.start).subtract(1, 'hour') < moment()) {
                $('.errors').append(new ALERT('Cannot move to previous dates or one hour before start time, sorry.'));
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

        }
    };

    function calculateDuration(eventData) {
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
        $('#duration').text(totalDurationHours);
        $('#pay_btn').attr('disabled', false);
        $('.initial_dollar').text(totalDurationMinutes);
        totalMinutes = totalDurationMinutes;
        totalHours = totalDurationHours;

        payment.pay_obj = {
            name: "Mina's Language Class",
            description: totalDurationHours + ' hours booking',
            amount: totalDurationMinutes * 100
        };
    }

    function checkOverlap(event) {
        var start = new Date(event.start);
        var end = new Date(event.end);

        var overlap = calendar.fullCalendar('clientEvents', function (ev) {
            if (ev == event)
                return false;
            var estart = new Date(ev.start);
            var eend = new Date(ev.end);

            return (Math.round(estart) / 1000 < Math.round(end) / 1000 && Math.round(eend) > Math.round(start));
        });
        return overlap.length
    }

    calendar.fullCalendar(calendarOptions);

    payment.token_function = function (token) {
        if (eventList.length > 0 && token) {
            $.ajax({
                type: 'POST',
                url: '/meetings/book/',
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

    payment.create();

});


