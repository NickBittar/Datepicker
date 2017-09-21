# ncb-datepicker
A datepicker with no dependencies.
Check out a simple demo here: https://nickbittar.github.io/Datepicker/

## Getting Started

HTML
```html
<!-- Include the JS and CSS files -->
<link rel="stylesheet" type="text/css" href="dist/datepicker.css">
<script src="dist/datepicker.js"></script>

<input id="my-date-input" class="datepicker" />
```
JavaScript 
```javascript
var dateElem = document.getElementById('#my-date-input');
var datepicker1 = datepicker.create(dateElem);
```
*note: Requires the input to have a unique id attribute*

OR, to initalize all of your datepickers:
```javascript
var dateElems = document.querySelectorAll('.datepicker');
for(var elem of dateElems) {
  datepicker.create(elem);
}
```
OR, if you prefer jQuery:
```javascript
// Single element
datepicker.create($('#my-date-input')[0]);
// Multiple elements
$('.datepicker').each((index, elem) => datepicker.create(elem));
```
Pass options in when initializing
```javascript
var options = {
	minDate: '2016-01-01',
        maxDate: '2020-12-31',
        compact: true
};
var datepicker1 = datepicker.create(dateElem, options);
```
Update these options afterwards:
```javascript
// Use the object returned from the original 'datepicker.create' to call methods on it
datepicker1.updateOptions({
	minDate: '2011-01-01',
        darkMode: true
});
```
---
        
## Options
Option | Datatype | Description | Possible Values | Default Value
-------|----------|-------------|-----------------|--------------
`defaultDate` | Date | The date the calendar shows when no date is selected. | Any| Today's Date
`minDate` | Date | The earliest date that can be selected. (Inclusive) | Any | 1900-01-01
`maxDate` | Date | The latest date that can be selected. (Inclusive) | Any | 2100-01-01
`startViewMode` | String | What view is shown when the datepicker is first opened.  'day' shows a calendar month to pick a day.  'month' shows a year to pick a month.  'year' shows a decade to pick a year.  | 'day', 'month', 'year' | 'day'
`hideCalendarOnClickOff` | Boolean | Hides the datepicker when the user clicks on something besides the datepicker or the associated input element. | true, false | true
`hideCalendarOnSelect` | Boolean | Hides the datepicker once a date is picked. | true, false | true
`todayButton` | Boolean | Shows a button to jump to and select today's date. | true, false | true
`darkMode` | Boolean | Changes the color scheme to better suit dark themes. | true, false | false
`compact` | Boolean | Reduces the size of the datepicker and inner elements. | true, false | false
`selectedDateColor` | Color | The background color of the date selected.  Can be CSS color or hexadecimal representation (eg #FF3311). | Valid CSS color | 'gold'
`onDateSelect` | Function | Calls this function when a date is picked from the datepicker. | Any | null
`enableDateParsing` | Boolean | When enabled, as the user types a date into the input element, the datepicker will show and highlight the corresponding date in the datepicker. | true, false | true


## More Advances Examples
#### Easily initialize all your datepickers with a few exceptions
Trying to create a datepicker on an input that alread has a datepicker will end up skipped.  You can initialize all your datepickers with special options first and then create your datepicker on all datepickers to get the rest but preserve the exceptions.

HTML
```HTML
<input id="special-input-1" class="datepicker" />
<input id="special-input-2" class="datepicker" />
<input id="special-input-3" class="datepicker" />

<input class="datepicker" />
<input class="datepicker" />
<input class="datepicker" />
<input class="datepicker" />
```
JavaScript
```javascript
var specialInput1 = document.getElementById('special-input-1');
var specialInput2 = document.getElementById('special-input-2');
var specialInput3 = document.getElementById('special-input-3');
var dateInputs = document.querySelectorAll('.datepicker');

datepicker.create(specialInput1, {
	minDate: new Date(1900,0,1),
        maxDate: new Date(1949,11,31)
});
datepicker.create(specialInput2, {
	minDate: new Date(2000,0,1),
        darkMode: true
});
datepicker.create(specialInput3, {
	compact: true,
        selectedDateColor: '#7788EE'
});
    
for(var elem of dateInputs) {
  datepicker.create(elem);
}
```


#### Dynamically created pairs of date range inputs that should constrain a end date to be on or after the start date

HTML
```HTML
<div id="datepickers-container">
   	<input id="start-date-for-entity-id-123" class="datepicker" placeholder="mm/dd/yyyy"/>
    <input id="end-date-for-entity-id-123" class="datepicker" placeholder="mm/dd/yyyy"/>
       
    <input id="start-date-for-entity-id-321" class="datepicker" placeholder="mm/dd/yyyy"/>
    <input id="end-date-for-entity-id-321" class="datepicker" placeholder="mm/dd/yyyy"/>
        
    // ...
        
    <input id="start-date-for-entity-id-999" class="datepicker" placeholder="mm/dd/yyyy"/>
    <input id="end-date-for-entity-id-999" class="datepicker" placeholder="mm/dd/yyyy"/>
</div>
```
JavaScript
```javascript
// Get all elements with the datepicker class inside the datepickers-container element
var dateInputs = document.querySelectorAll('#datepickers-container .datepicker');

// Create an empty object which will use the id of the inputs as the key to their datepicker object.
var datepickerLibrary = {};

for(var inputElem of dateInputs) {

	// Save the datepicker object in the library with its id as the key
	datepickerLibrary[dp.id] = datepicker.create(inputElem);
	
    // Listen for changes to the date value
    inputElem.addEventListener('change', function(e) {
	
    	var inputId = this.id;
		
        // Figure out whether the start or end date was changed
        if(inputId.indexOf('start-date') > -1) {
		
        	// Input was start date, get end date's id
        	var endDatePickerId = inputId.replace('start-date', 'end-date');
			
            // Get end date's datepicker object
            var endDatePicker = datepickerLibrary[endDatePickerId];
			
            // Update the minimum date to the value of the start date
            endDatePicker.updateOptions({
				minDate: this.value
			});
        } else {
		
        	// Input was end date, get the start date's id
        	var startDatePickerId = inputId.replace('end-date', 'start-date');
			
            // Get start date's datepicker object
            var startDatePicker = datepickerLibrary[startDatePickerId];
			
            // Update the maximum date to the value of the end date
            startDatePicker.updateOptions({
				maxDate: this.value
			});
        }
    });
}
```

