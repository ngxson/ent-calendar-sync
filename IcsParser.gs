function parseICAL(data) {
	//Ensure cal is empty
	events = [];
	
	//Clean string and split the file so we can handle it (line by line)
	cal_array = data.replace(/\r/g, "").replace(/\n /g, "").split("\n");
	
	//Keep track of when we are activly parsing an event
	var in_event = false;
	//Use as a holder for the current event being proccessed.
	var cur_event = null;
	for(var i=0;i<cal_array.length;i++) {
		ln = cal_array[i];
		//If we encounted a new Event, create a blank event object + set in event options.
		if(!in_event && ln == 'BEGIN:VEVENT') {
			in_event = true;
			cur_event = {};
		}
		//If we encounter end event, complete the object and add it to our events array then clear it for reuse.
		if(in_event && ln == 'END:VEVENT') {
			in_event = false;
			this.events.push(cur_event);
			cur_event = null;
		}
		//If we are in an event
		if(in_event) {
			//Split the item based on the first ":"
			idx = ln.indexOf(':');
			//Apply trimming to values to reduce risks of badly formatted ical files.
			type = ln.substr(0,idx).replace(/^\s\s*/, '').replace(/\s\s*$/, '');//Trim
			val = ln.substr(idx+1,ln.length-(idx+1)).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			
			//If the type is a date
			if (type =='DTSTART' || type =='DTEND' || type =='DTSTAMP') {
				val = makeDate(val);
			}
			if (type == 'DESCRIPTION' || type == 'SUMMARY' || type == 'LOCATION') {
				val = val.replace(/\\n/g, "\n").replace(/\s{2,100}/g, " ").trim();
			}
			
			//Add the value to our event object.
			if (type != 'BEGIN') {
				cur_event[type] = val;
			}
		}
	}
	return events;
}

function makeDate(ical_date) {
	//break date apart
	var dt =  {
		year: ical_date.substr(0,4),
		month: ical_date.substr(4,2),
		day: ical_date.substr(6,2),
		hour: ical_date.substr(9,2),
		minute: ical_date.substr(11,2)
	}
	//Create JS date (months start at 0 in JS - don't ask)
	return new Date(dt.year, (dt.month-1), dt.day, dt.hour, dt.minute);
}
