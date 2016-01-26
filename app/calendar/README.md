# Calendar
## props
|property| description|
|--------|------------|
|onAddCard| recevie time data after selected a new Card in Calendar|
|cellHeight| height of table row|
|schedule| all schudle info, map by date|
|cardTemplate| schedule card render template|

#### TimeObject
|property| type|
|--------|-----|
|hour| number|
|minute| number|
#### `onAddCard`
accept a function as property, will be called after select a new card in calendar.
- from, {TimeObject} begin time of card
- to, {TimeObject} end time of card
- date, {Date} date of card


#### Usage:

```javascript
class CalendarView extends React.Component {
  onAddCard(from, to, date) {
    // create your card at here
  }
  
  render() {
    return (
      <Calendar
        onAddCard={this.onAddCard.bind(this)}
      />
    );
  }
}
```

# WeflexCalendar
#### `.updateClasses(newClass)`
- newClass, {Class} update new class and update schedule of the table

