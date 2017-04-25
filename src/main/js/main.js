$(function () {
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
        height: 'auto',
        select: function (start, end, jsEvent, view) {
            var differenceInMs = moment(end).diff(moment(start)); // diff yields milliseconds
            var duration = moment.duration(differenceInMs);
            // start contains the date you have selected
            // end contains the end date.
            // Caution: the end date is exclusive (new since v2).
            $('#duration').text(duration.asHours());
            $('#pay_btn').attr('disabled', false);
            $('.initial_dollar').text(duration.asMinutes());
            var allDay = !start.hasTime() && !end.hasTime();
            // alert(["Event Start date: " + moment(start).format('hh:mm'),
            //     "Event End date: " + moment(end).format('hh:mm'),
            //     // "Duration:" + moment(start).subtract(duration),
            //     "AllDay: " + allDay].join("\n"));
        }
    });
});