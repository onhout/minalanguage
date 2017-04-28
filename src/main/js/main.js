var eventsArray = [];
var newEvent = new Object();
var ALERT = require('../../globals/Alert.js').default;
var CSRF_TOKEN = require('../../globals/csrf_token.js').default;

newEvent.title = "some text";
newEvent.start = moment("04-28-2017 11:00:00", "MM-DD-YYYY hh:mm:ss");
newEvent.end = moment("04-28-2017 16:00:00", "MM-DD-YYYY hh:mm:ss");
newEvent.allDay = false;


$(function () {
    var csrftoken = CSRF_TOKEN.getCookie('csrftoken');
    var eventList = [];
    var calendar = $('#calendar').fullCalendar({
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
        select: function (start, end, jsEvent, view) {
            if (moment(start).subtract(1, 'hour') > moment()) {
                var eventData;
                if (confirm('Do you want to book from ' +
                        moment(start).format('MM/DD hh:mm:ss') + ' to ' +
                        moment(end).format('MM/DD hh:mm:ss') + '?')) {
                    eventData = {
                        title: 'Booked',
                        start: start,
                        end: end
                    };
                    if (!checkOverlap(eventData)) {
                        calculateDuration(eventData);
                        $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
                    } else {
                        $('.errors').append(new ALERT('Meeting overlapped'));
                        $('#calendar').fullCalendar('unselect');
                    }
                } else {
                    $('#calendar').fullCalendar('unselect');
                }
                $('#calendar').fullCalendar('unselect');
            } else {
                $('.errors').append(new ALERT('Cannot book previous dates or one hour before start time, sorry.'));
                $('#calendar').fullCalendar('unselect');
            }
        },
        events: '/meetings/get_meetings',
        startParam: 'from_date',
        endParam: 'to_date'
    });

    function calculateDuration(eventData) {
        eventList.push(eventData);
        var totalDurationHours = 0;
        var totalDurationMinutes = 0;
        $.each(eventList, function (i, event) {
            var differenceInMs = moment(event.end).diff(moment(event.start)); // diff yields milliseconds
            var duration = moment.duration(differenceInMs);
            totalDurationHours += duration.asHours();
            totalDurationMinutes += duration.asMinutes();
        });
        $('#duration').text(totalDurationHours);
        $('#pay_btn').attr('disabled', false);
        $('.initial_dollar').text(totalDurationMinutes);
    }

    function checkOverlap(event) {
        var start = new Date(event.start);
        var end = new Date(event.end);

        var overlap = $('#calendar').fullCalendar('clientEvents', function (ev) {
            if (ev == event)
                return false;
            var estart = new Date(ev.start);
            var eend = new Date(ev.end);

            return (Math.round(estart) / 1000 < Math.round(end) / 1000 && Math.round(eend) > Math.round(start));
        });
        return overlap.length
    }

    $('#super_btn').click(function () {
        if (eventList.length > 0) {
            $.each(eventList, function (i, v) {
                console.log(v.start.format('MM-DD-YYYY hh:mm:ss'));
                $.ajax({
                    type: 'POST',
                    url: '/meetings/book/',
                    data: {
                        csrfmiddlewaretoken: csrftoken,
                        book_type: 'in-person',
                        class_location: 'Anywhere',
                        booked_time_start: v.start.format('YYYY-MM-DD HH:mm:ss'),
                        booked_time_end: v.end.format('YYYY-MM-DD HH:mm:ss'),
                    }
                })
            })
        }
    });

    // $('#calendar').fullCalendar('renderEvent',events, true);

});


