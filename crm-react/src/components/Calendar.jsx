import { useMemo } from 'react';

const Calendar = ({ meetings }) => {
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    return {
      title: `${monthNames[month]} ${year}`,
      startDay,
      daysInMonth,
      year,
      month
    };
  }, []);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDayEvents = (day) => {
    const dateStr = `${calendarData.year}-${(calendarData.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return meetings.filter(m => m.date === dateStr);
  };

  return (
    <section className="card">
      <div className="topbar-inner">
        <div className="brand">Calendar</div>
        <div className="muted">Weekly/monthly view of events</div>
        <span className="right"></span>
        <div>
          <button className="pill">Month</button>
          <button className="pill">Week</button>
          <button className="pill primary">Today</button>
        </div>
      </div>

      <div className="calendar-header">
        <button className="ghost">
          <i className="fas fa-chevron-left"></i>
        </button>
        <h3>{calendarData.title}</h3>
        <button className="ghost">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}

        {[...Array(calendarData.startDay)].map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day other-month"></div>
        ))}

        {[...Array(calendarData.daysInMonth)].map((_, i) => {
          const day = i + 1;
          const events = getDayEvents(day);

          return (
            <div key={day} className="calendar-day">
              <div className="calendar-day-header">{day}</div>
              {events.map(event => (
                <div key={event.id} className="calendar-event" title={`${event.contact_name}: ${event.subject}`}>
                  {event.time || ''} {event.contact_name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Calendar;
