$(function () {
    var calendar = $('#calendar').fullCalendar({
        defaultView: 'agendaWeek',
        theme: true,
        header: {
            left: 'title',
            center: '',
            right: 'today,month,agendaWeek prev,next'
        },
        selectable:true,
        selectHelper: true,
    });
});