function doGet(e) {
  var GOOGLE_CALENDAR_ID = "your_calendar_id@group.calendar.google.com";
  var AMU_EXPORT_URL = "https://ade-consult.univ-amu.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?projectId=8&resources=21220&calType=ical";

  updateSchoolCalendar("name", GOOGLE_CALENDAR_ID, AMU_EXPORT_URL);

  return HtmlService.createHtmlOutputFromFile('Index');
}
