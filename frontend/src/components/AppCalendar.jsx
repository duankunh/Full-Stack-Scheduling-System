import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import {useState} from "react";

const localizer = dayjsLocalizer(dayjs)

const AppCalendar = ({events}) => {
  // const [myEventsList, setMyEventsList] = useState([]);
  // console.log("jack", events)
  const myEventsList = [
    ...events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
    }))
  ]
  const sheEventsList = [
    {
      id: 1,
      title: 'Long Event',
      start: dayjs("2024-04-06 14:00").toDate(),
      end: dayjs("2024-04-06 16:30").toDate(),
    },

    {
      id: 2,
      title: 'DTS STARTS',
      start: new Date(2016, 2, 13, 0, 0, 0),
      end: new Date(2016, 2, 20, 0, 0, 0),
    },
  ]
  // console.log("my type", myEventsList)
  // console.log("she type", sheEventsList)

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
        style={{height: 500}}
      />
    </div>
  );
}
export default AppCalendar;

