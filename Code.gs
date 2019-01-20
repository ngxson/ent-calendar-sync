var DAYS_AHEAD = 7*3;
var TIME_OFFSET = 1*60*60000;
var SLEEP_AT = 10;
var count_to_sleep = 0;

function updateSchoolCalendar(NAME, CALENDAR_ID, SERVER_BASE_URL) {
  var cal = CalendarApp.getCalendarById(CALENDAR_ID);
  var now = new Date();
  var startTime = new Date(parseInt(now.getTime()/(60*60000))*60*60000);
  var endTime = new Date(startTime.getTime() + (DAYS_AHEAD*24*60*60000));
  var newevents = fetchNewEvents(SERVER_BASE_URL, startTime, endTime);
  deleteEvents(cal, startTime, endTime);
  pushEvents(cal, newevents, startTime, endTime);
  createCheckpointEvent(NAME, cal, startTime);
}

function fetchNewEvents(SERVER_BASE_URL, startTime, endTime) {
  var ics_file = UrlFetchApp.fetch(SERVER_BASE_URL+"&firstDate="+getDateStr(startTime)+"&lastDate="+getDateStr(endTime));
  ics_file = ics_file.toString();
  return parseICAL(ics_file.toString());
}

function deleteEvents(cal, startTime, endTime) {
  var events = cal.getEvents(startTime, endTime);
  events.forEach(function(event) {
    checkSleep();
    event.deleteEvent();
  });
}

function pushEvents(cal, newevents, startTime, endTime) {
  newevents.forEach(function(event) {
    checkSleep();
    if (event.DTSTART < startTime || event.DTEND > endTime) return;
    try {
      var startAt = new Date(event.DTSTART.getTime() + TIME_OFFSET);
      var endAt = new Date(event.DTEND.getTime() + TIME_OFFSET);
      cal.createEvent(event.SUMMARY, startAt, endAt, {
        description: event.DESCRIPTION,
        location: event.LOCATION
      });
    } catch (e) {}
  });
}

function createCheckpointEvent(NAME, cal, startTime) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var lastid = scriptProperties.getProperty('last_update_id_'+NAME);
  if (lastid) deleteEventById(cal, lastid);
  var newid = cal.createEvent("Updated", startTime, new Date(startTime.getTime() + 10*60000)).getId();
  scriptProperties.setProperty('last_update_id_'+NAME, newid);
}

function deleteEventById(cal, id) {
  var events = cal.getEventById(id);
  try {
    events.deleteEvent();
  } catch(e) {}
}

function getDateStr(currentdate) {
  var month = currentdate.getMonth()+1;
  var year = currentdate.getFullYear();
  var date = currentdate.getDate();
  return year + "-"  
    + (month<10 ? "0":"") + month + "-"  
    + (date<10 ? "0":"") + date;
}

function checkSleep() {
  if (count_to_sleep == SLEEP_AT) {
    Utilities.sleep(1200);
    count_to_sleep = 0;
  } else {
    count_to_sleep++;
  }
}

function debug() {
  var cal = CalendarApp.getCalendarById(CALENDAR_ID);
  Logger.log(cal.getEventById("atsi27iom1ot04fgfcd8rprivc@google.com").deleteEvent());
}
