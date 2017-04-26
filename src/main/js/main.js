var eventsArray = [];
var newEvent = new Object();

newEvent.title = "some text";
newEvent.start = moment("04-25-2017 11:00:00", "MM-DD-YYYY hh:mm:ss");
newEvent.end = moment("04-25-2017 16:00:00", "MM-DD-YYYY hh:mm:ss");
newEvent.allDay = false;


$(function () {
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
        color: 'yellow',
        textColor: 'black',
        timezone: "local",
        viewRender: function (view, element) {
            var b = $('#calendar').fullCalendar('getDate');
            // console.log(b);
            $('#calendar').fullCalendar('renderEvent', newEvent);
        },
        select: function (start, end, jsEvent, view) {
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
                    calculateDuration(start, end, eventData);
                    $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
                } else {
                    $('#calendar').fullCalendar('unselect');
                }
            } else {
                $('#calendar').fullCalendar('unselect');
            }
            $('#calendar').fullCalendar('unselect');
        }
    });

    function calculateDuration(start, end, eventData) {
        eventList.push(eventData);
        $.each(eventList, function (i, event) {
            var differenceInMs = moment(event.end).diff(moment(event.start)); // diff yields milliseconds
            var duration = moment.duration(differenceInMs);

        });
        var differenceInMs = moment(eventData.end).diff(moment(eventData.start)); // diff yields milliseconds
        var duration = moment.duration(differenceInMs);
        $('#duration').text(duration.asHours());
        $('#pay_btn').attr('disabled', false);
        $('.initial_dollar').text(duration.asMinutes());
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

    $('#calendar').fullCalendar('renderEvent', newEvent);
});


