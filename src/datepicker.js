'use strict';

var datepicker = {
	inputElem: null,
	container: null,
	datepicker: null,
	focusFlag: false,
	
	inputInFocus: false,
	datepickerInFocus: false,
	
	viewMode: 'day',	// day, month, year, decade
	options: {
		defaultDate: new Date(),
		minDate: new Date(1900,0,1),
		maxDate: new Date(2100,0,1),
		startViewMode: 'day',
		hideCalendarOnClickOff: true,
		hideCalendarOnSelect: true,
		todayButton: true,
		darkMode: false,
		compact: false,
		selectedDateColor: 'gold',
		onDateSelect: null,
		enableDateParsing: true,
	},
	dateRegex: /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/,
	
	create: function create(input, options) {
		// Check for input Id
		if(!input.id) {
			console.error('Input element must have a unique id attribute value to apply a datepicker to.');
			return false;
		}
		
		// Check if datepicker is already initialized for input
		var possibleDatepicker = document.getElementById('ncb-datepicker-' + input.id);
		if(!possibleDatepicker) {
			var dp = Object.create(this);
			dp.options = Object.create(this.options);
			dp.init(input, options);
			return dp;
		}
	},
	
	updateOptions: function updateOptions(options) {
		// options
		if(options) {
			if(options.selectedDate instanceof Date || !isNaN(Date.parse(options.selectedDate)))
				this.inputElem.value = this.utils.toNormalDateFormat(options.selectedDate);
			
			if(options.defaultDate instanceof Date || !isNaN(Date.parse(options.defaultDate)))
				this.options.defaultDate = new Date(options.defaultDate);
			
			if(options.minDate instanceof Date || !isNaN(Date.parse(options.minDate)))
				this.options.minDate = new Date(options.minDate);
			
			if(options.maxDate instanceof Date || !isNaN(Date.parse(options.maxDate)))
				this.options.maxDate = new Date(options.maxDate);
			
			this.options.startViewMode = options.startViewMode || 'day';
			this.viewMode = this.options.startViewMode;
			
			if(options.hideCalendarOnClickOff != undefined) {
				this.options.hideCalendarOnClickOff = options.hideCalendarOnClickOff;
			}
			if(options.hideCalendarOnSelect != undefined) {
				this.options.hideCalendarOnSelect = options.hideCalendarOnSelect;
			}
			if(options.todayButton != undefined) {
				this.options.todayButton = options.todayButton;
			}
			if(options.darkMode != undefined) {
				this.options.darkMode = options.darkMode;
			}
			if(options.compact != undefined) {
				this.options.compact = options.compact;
			}
			if(options.selectedDateColor) {
				this.options.selectedDateColor = options.selectedDateColor;
			}
			if(options.onDateSelect) {
				this.options.onDateSelect = options.onDateSelect;
			}
			if(options.enableDateParsing != undefined) {
				this.options.enableDateParsing = options.enableDateParsing;
			}
		}
		
		if(this.options.darkMode) {
			this.container.classList.add('dark');
		} else {
			this.container.classList.remove('dark');
		}
		
		if(this.options.compact) {
			this.container.classList.add('compact');
		} else {
			this.container.classList.remove('compact');
		}
		
	},
	
	init: function init(inputElem, options) {
		var _this = this;
		
		this.inputElem = inputElem;
		
		
		this.container = document.createElement('div'); 
		this.container.id = 'ncb-datepicker-' + this.inputElem.id;
		this.inputElem.setAttribute('data-ncb-datepicker-id', this.container.id);
		
		function getZIndex(e) {   
            var z = window.document.defaultView.getComputedStyle(e).getPropertyValue('z-index');
            if (isNaN(z) && e.parentNode != null && e.parentNode != document) return getZIndex(e.parentNode);
            return z;
        }
        var zIndex = getZIndex(this.inputElem);
		if(!isNaN(parseInt(zIndex))) {		
				this.container.style.zIndex = zIndex+1;
		}
		
		this.container.classList.add('ncb-datepicker-container');
		this.container.tabIndex = 0;
		
		// OPTIONS
		this.updateOptions(options);
		
        //document.body.insertAdjacentElement('beforeend', this.container);		  		
		this.inputElem.insertAdjacentElement('afterend', this.container);
		
		this.inputElem.addEventListener('focus', function(event) {
			_this.inputInFocus = true;
			_this.updateCalendar(null);
		});
		
		this.inputElem.addEventListener('blur', function(event){
			_this.inputInFocus = false;
			if(_this.options.hideCalendarOnClickOff) 
				setTimeout(function(event) { _this.closeCalendar(event); }, 100);
		});
		this.container.addEventListener('blur', function(event) { _this.datepickerInFocus = false; if(_this.options.hideCalendarOnClickOff) setTimeout(function() { _this.closeCalendar(event);}, 100); });
		this.container.addEventListener('focus', function(event) { _this.datepickerInFocus = true; });
		this.container.addEventListener('mousedown', function(event) { setTimeout(function() {_this.container.focus();}, 50); });
		
		// DISABLED TEMPORARILY
		// this.inputElem.addEventListener('change', function(event) {
			// if(_this.options.enableDateParsing && _this.inputElem.value) {
				// if((_this.options.enableDateParsing && !_this.dateRegex.test(_this.inputElem.value)) || (_this.options.minDate && new Date(_this.inputElem.value) < _this.options.minDate) || (_this.options.maxDate && new Date(_this.inputElem.value) > _this.options.maxDate)) {
					// console.warn(_this.inputElem.value, !_this.dateRegex.test(_this.inputElem.value));
					// _this.inputElem.value = '';
				// }
			// }
		// });
		
		this.inputElem.addEventListener('input', function(event) {
			if (_this.options.enableDateParsing) {
				let parts = _this.inputElem.value.split('/');
				let guess = _this.options.defaultDate;
				
				if(parts[0] != undefined && parts[0] != '' && !isNaN(parts[0])) {
					let month = parseInt(parts[0]);
					if(month < 1) month = 1;
					if(month > 12) month = 12;
					guess.setMonth(month-1);
				}
				if(parts[1] != undefined && parts[1] != '' && !isNaN(parts[1])) {
					let date = parseInt(parts[1]);
					if(date < 1) date = 1;
					if(date > 31) date = 31;
					guess.setDate(date);
				}
				if(parts[2] != undefined && parts[2] != '' && !isNaN(parts[2])) {
					let year = parts[2];
					if(year.length == 2) {
						if(year >= 20) {
							year = '19' + year;
						} else {
							year = '20' + year;
						}
					} else if (year.length == 3) {
						year = year + '0';
					}
					if(year.length >= 2 && year.length <= 4) {
						guess.setFullYear(year);
					}
				}
				
				_this.updateCalendar(guess);
			}
		});
		
		
	},

	updateCalendar: function updateCalendar(date) {
		
		var selectedDate;
		
		if(isNaN(Date.parse(date))) {
			if(!isNaN(Date.parse(this.inputElem.value))) {
				date = new Date(this.inputElem.value);
				selectedDate = date;
			} else {
				date = this.options.defaultDate;
			}
		}
		if(!isNaN(Date.parse(this.inputElem.value))) {
				selectedDate =  new Date(this.inputElem.value);
		}
		
		date = new Date(date);
		
		let dates;
		let html = null;
		switch(this.viewMode) {
			case 'day':
				dates = this.getCalendarDates(date);
				html = this.generateMonthHtml(dates, selectedDate);
				break;
			case 'month': 
				dates = this.getCalendarMonths(date);
				html = this.generateYearHtml(dates, selectedDate);
				break;
			case 'year': 
				dates = this.getCalendarYears(date);
				html = this.generateDecadeHtml(dates, selectedDate);
				break;
			case 'decade':
			
				break;
			default:
				dates = this.getCalendarDates(date);
				html = this.generateMonthHtml(dates, selectedDate);
				break;
		}
		
		if(this.options.todayButton) {
			let calendarFooter = document.createElement('div');
			calendarFooter.classList.add('calendar-footer');
			
				let todayButton = this.generateTodayButton();
			calendarFooter.appendChild(todayButton);
			
			html.appendChild(calendarFooter);
		}
		
		this.container.innerHTML = '';
		
		this.repositionCalendar();
		
		this.datepicker = html;
		this.container.appendChild(html);
		
	},
	repositionCalendar: function repositionCalendar() {
		// var rect = this.inputElem.getBoundingClientRect();
		// this.container.style.top = (rect.bottom + this.container.parentNode.scrollTop + 5) + 'px';
		// this.container.style.left = rect.left + this.container.parentNode.scrollLeft + 'px';
		this.container.style.top = (this.inputElem.offsetTop + this.inputElem.offsetHeight + 5) + 'px';
		this.container.style.left = this.inputElem.offsetLeft + 'px';
	},

	closeCalendar: function closeCalendar(event) {
		if(!(this.inputInFocus || this.datepickerInFocus) && this.datepicker.parentNode) {
			this.datepicker.parentNode.removeChild(this.datepicker);
		}	
	},
		
	generateMonthHtml: function generateMonthHtml(dates, selectedDate) {
		var _this = this;
		
		var currMonth = new Date(dates[15].date);
		var prevMonth = this.utils.addMonths(currMonth, -1);
		var nextMonth = this.utils.addMonths(currMonth, 1);
		
		
		let calendar = document.createElement('div');
		calendar.classList.add('calendar');
		
			let calendarHeader = document.createElement('div');
			calendarHeader.classList.add('calendar-header');
			calendar.appendChild(calendarHeader);
			
				let prevMonthBtn = document.createElement('div');
				prevMonthBtn.classList.add('prev-month-btn');
				prevMonthBtn.classList.add('calendar-header-control');
				prevMonthBtn.classList.add('calendar-header-label');
				prevMonthBtn.title = 'Go to previous month: ' + this.utils.getMonthName(prevMonth) + ' ' + prevMonth.getFullYear();
				prevMonthBtn.addEventListener('click', function(event) { _this.updateCalendar(prevMonth); });
				prevMonthBtn.innerHTML = '&#171;';
				calendarHeader.appendChild(prevMonthBtn);

				let currMonthLabel = document.createElement('div');
				currMonthLabel.classList.add('current-month-name');
				currMonthLabel.classList.add('calendar-header-control');
				currMonthLabel.classList.add('calendar-header-label');
				currMonthLabel.title = 'Go to month selection';
				currMonthLabel.innerHTML = dates[15].date.getFullYear() + '<br>' + this.utils.getMonthName(dates[15].date);
				currMonthLabel.addEventListener('click', function(event) {
					_this.changeViewMode('month', dates[15].date);
					_this.viewMode = 'month';
				});
				calendarHeader.appendChild(currMonthLabel);
				
				let nextMonthBtn = document.createElement('div');
				nextMonthBtn.classList.add('next-month-btn');
				nextMonthBtn.classList.add('calendar-header-control');
				nextMonthBtn.classList.add('calendar-header-label');
				nextMonthBtn.title = 'Go to next month: ' + this.utils.getMonthName(nextMonth) + ' ' + nextMonth.getFullYear();
				nextMonthBtn.addEventListener('click', function(event) { _this.updateCalendar(nextMonth); });
				nextMonthBtn.innerHTML = '&#187;';
				calendarHeader.appendChild(nextMonthBtn);
			
			let calendarBody = document.createElement('div');
			calendarBody.classList.add('calendar-body');
			calendar.appendChild(calendarBody);
			
				for(let i = 0; i < 7; i++) {
					let calendarWeekdayLabel = document.createElement('div');
					calendarWeekdayLabel.classList.add('calendar-item');
					calendarWeekdayLabel.classList.add('calendar-weekday-label');
					calendarWeekdayLabel.title = this.utils.WEEKDAYS[i].fullName;
					calendarWeekdayLabel.innerText = this.utils.WEEKDAYS[i].fullName.slice(0, 2);
					calendarBody.appendChild(calendarWeekdayLabel);
				}
				
				for(let i = 0; i < dates.length; i++) {
					let currDate = dates[i];
					
					let calendarDate = document.createElement('div');
					calendarDate.classList.add('calendar-item');
					calendarDate.classList.add('calendar-date');
					calendarDate.classList.add('calendar-option');
					if(selectedDate && this.utils.toISODateFormat(selectedDate) == this.utils.toISODateFormat(currDate.date)) calendarDate.style.background = this.options.selectedDateColor;
					calendarDate.classList.add((currDate.currentMonth ? 'current-month' : 'not-current-month' ));
					calendarDate.title = this.utils.toNormalDateFormat(currDate.date);
					calendarDate.setAttribute('data-date-value', this.utils.toISODateFormat(currDate.date));
					
					calendarDate.innerText = currDate.date.getDate();
					if(this.options.minDate && currDate.date < this.options.minDate ) {
						calendarDate.classList.add('calendar-item-disabled');
					}
					if(this.options.maxDate && currDate.date > this.options.maxDate ) {
						calendarDate.classList.add('calendar-item-disabled');
					}
					
					if(!calendarDate.classList.contains('calendar-item-disabled')) {
						calendarDate.addEventListener('click', function(event) { _this.pickDate(event, currDate.date, false); });
						calendarDate.classList.add('calendar-date-option');
					} else {
						calendarDate.classList.remove('calendar-option');
					}
					
					calendarBody.appendChild(calendarDate);
				}
		
		return calendar;
	},
	
		
	generateYearHtml: function generateYearHtml(dates, selectedDate) {
		var _this = this;
		
		var currYear = new Date(dates[0].date);
		var prevYear = this.utils.addMonths(currYear, -12);
		var nextYear = this.utils.addMonths(currYear, 12);
		
		
		let calendar = document.createElement('div');
		calendar.classList.add('calendar');
		
			let calendarHeader = document.createElement('div');
			calendarHeader.classList.add('calendar-header');
			calendar.appendChild(calendarHeader);
			
				let prevYearBtn = document.createElement('div');
				prevYearBtn.classList.add('prev-year-btn');
				prevYearBtn.classList.add('calendar-header-control');
				prevYearBtn.classList.add('calendar-header-label');
				prevYearBtn.title = 'Go to previous year: ' + prevYear.getFullYear();
				prevYearBtn.addEventListener('click', function(event) { _this.updateCalendar(prevYear); });
				prevYearBtn.innerHTML = '&#171;';
				calendarHeader.appendChild(prevYearBtn);

				let currYearLabel = document.createElement('div');
				currYearLabel.classList.add('current-year-name');
				currYearLabel.classList.add('calendar-header-control');
				currYearLabel.classList.add('calendar-header-label');
				currYearLabel.title = 'Go to year selection';
				currYearLabel.innerHTML = dates[0].date.getFullYear();
				currYearLabel.addEventListener('click', function(event) {
					_this.changeViewMode('year', dates[0].date);
				});
				calendarHeader.appendChild(currYearLabel);
				
				let nextYearBtn = document.createElement('div');
				nextYearBtn.classList.add('next-year-btn');
				nextYearBtn.classList.add('calendar-header-control');
				nextYearBtn.classList.add('calendar-header-label');
				nextYearBtn.title = 'Go to next year: ' + nextYear.getFullYear();
				nextYearBtn.addEventListener('click', function(event) { _this.updateCalendar(nextYear); });
				nextYearBtn.innerHTML = '&#187;';
				calendarHeader.appendChild(nextYearBtn);
			
			let calendarBody = document.createElement('div');
			calendarBody.classList.add('calendar-body');
			calendar.appendChild(calendarBody);
				
				for(let i = 0; i < dates.length; i++) {
					let currDate = dates[i];
					
					let calendarMonth = document.createElement('div');
					calendarMonth.classList.add('calendar-item');
					calendarMonth.classList.add('calendar-month');
					calendarMonth.classList.add('calendar-option');
					if(selectedDate && this.utils.toISODateFormat(this.utils.getFirstDayOfTheMonth(selectedDate)) == this.utils.toISODateFormat(this.utils.getFirstDayOfTheMonth(currDate.date))) calendarMonth.style.background = this.options.selectedDateColor;
					calendarMonth.title = this.utils.getMonthName(currDate.date) + ' ' + currDate.date.getFullYear();
					calendarMonth.setAttribute('data-date-value', this.utils.toISODateFormat(currDate.date));
					calendarMonth.innerText = this.utils.getMonthName(currDate.date).slice(0, 3);
					let minMonth = this.utils.getFirstDayOfTheMonth(this.options.minDate);
					if(this.options.minDate && currDate.date < minMonth ) {
						calendarMonth.classList.add('calendar-item-disabled');
					}
					let maxMonth = this.utils.addMonths(this.utils.getFirstDayOfTheMonth(this.options.maxDate), 0);
					if(this.options.maxDate && currDate.date > maxMonth ) {
						calendarMonth.classList.add('calendar-item-disabled');
					}
					
					if(!calendarMonth.classList.contains('calendar-item-disabled')) {
						calendarMonth.addEventListener('click', function(event) {
							_this.changeViewMode('day', currDate.date);
						});
						calendarMonth.classList.add('calendar-month-option');
					} else {
						calendarMonth.classList.remove('calendar-option');
					}
					
					calendarBody.appendChild(calendarMonth);
				}
		
		return calendar;
	},
	
	
	generateDecadeHtml: function generateDecadeHtml(dates, selectedDate) {
		var _this = this;
		
		var currDecade = new Date(dates[0].date);
		var prevDecade = this.utils.addMonths(currDecade, -12*10);
		var nextDecade = this.utils.addMonths(currDecade, 12*10);
		
		
		let calendar = document.createElement('div');
		calendar.classList.add('calendar');
		
			let calendarHeader = document.createElement('div');
			calendarHeader.classList.add('calendar-header');
			calendar.appendChild(calendarHeader);
			
				let prevDecadeBtn = document.createElement('div');
				prevDecadeBtn.classList.add('prev-decade-btn');
				prevDecadeBtn.classList.add('calendar-header-control');
				prevDecadeBtn.classList.add('calendar-header-label');
				prevDecadeBtn.title = 'Go to previous decade: ' + prevDecade.getFullYear();
				prevDecadeBtn.addEventListener('click', function(event) { _this.updateCalendar(prevDecade); });
				prevDecadeBtn.innerHTML = '&#171;';
				calendarHeader.appendChild(prevDecadeBtn);

				let currDecadeLabel = document.createElement('div');
				currDecadeLabel.classList.add('current-decade-name');
				//currDecadeLabel.classList.add('calendar-header-control');
				currDecadeLabel.classList.add('calendar-header-label');
				//currDecadeLabel.title = 'Go to decade selection';
				currDecadeLabel.title = dates[0].date.getFullYear() + 's';
				currDecadeLabel.innerHTML = dates[0].date.getFullYear() + 's';
				calendarHeader.appendChild(currDecadeLabel);
				
				let nextDecadeBtn = document.createElement('div');
				nextDecadeBtn.classList.add('next-decade-btn');
				nextDecadeBtn.classList.add('calendar-header-control');
				nextDecadeBtn.classList.add('calendar-header-label');
				nextDecadeBtn.title = 'Go to next decade: ' + nextDecade.getFullYear();
				nextDecadeBtn.addEventListener('click', function(event) { _this.updateCalendar(nextDecade); });
				nextDecadeBtn.innerHTML = '&#187;';
				calendarHeader.appendChild(nextDecadeBtn);
			
			let calendarBody = document.createElement('div');
			calendarBody.classList.add('calendar-body');
			calendar.appendChild(calendarBody);
				
				for(var i = 0; i < dates.length; i++) {
					let currDate = dates[i];
					
					let calendarYear = document.createElement('div');
					calendarYear.classList.add('calendar-item');
					calendarYear.classList.add('calendar-year');
					calendarYear.classList.add('calendar-option');
					if(selectedDate && selectedDate.getFullYear() == currDate.date.getFullYear()) calendarYear.style.background = this.options.selectedDateColor;
					calendarYear.title = currDate.date.getFullYear();
					calendarYear.setAttribute('data-date-value', this.utils.toISODateFormat(currDate.date));
					calendarYear.innerText = currDate.date.getFullYear();
					
					let minYear = this.options.minDate.getFullYear();
					if(this.options.minDate && currDate.date.getFullYear() < minYear ) {
						calendarYear.classList.add('calendar-item-disabled');
					}
					let maxYear = this.options.maxDate.getFullYear();
					if(this.options.maxDate && currDate.date.getFullYear() > maxYear ) {
						calendarYear.classList.add('calendar-item-disabled');
					}
					
					if(!calendarYear.classList.contains('calendar-item-disabled')) {
						calendarYear.addEventListener('click', function(event) {
							_this.changeViewMode('month', currDate.date);
						});
						calendarYear.classList.add('calendar-year-option');
					} else {
						calendarYear.classList.remove('calendar-option');
					}
					
					calendarBody.appendChild(calendarYear);
				}
		
		return calendar;
	},
	
	generateTodayButton: function generateTodayButton() {
		var _this = this;
		
		let todayButton = document.createElement('div');
		todayButton.classList.add('calendar-today-button');
		todayButton.title = 'Go to today (' + this.utils.toNormalDateFormat(new Date()) + ')';
		todayButton.innerText = 'Today';
		todayButton.addEventListener('click', function(event) {
			_this.viewMode = 'day';	// Maybe change this to check min view mode
			_this.pickDate(event, new Date(), true);
		});
		return todayButton;
	},
	
	
	pickDate: function(event, date, keepOpen) {
		this.inputElem.value = this.utils.toNormalDateFormat(date);
		
		var evt = new Event('change', {bubbles: false});
		this.inputElem.dispatchEvent(evt);
		
		this.updateCalendar(date);
		if(this.options.hideCalendarOnSelect && !keepOpen)
			this.datepicker.parentNode.removeChild(this.datepicker);
		
		if(this.options.onDateSelect) {
			this.options.onDateSelect(event, date);
		}
	
	},
	
	getCalendarDates: function getCalendarDates(d) {
		let startDate = this.utils.getFirstDayOfTheMonth(d);
		
		// If the start of the month is Sunday, Monday, or Tuesday, show the previous month's week
		if(startDate.getDay() <= 2) {
			startDate = this.utils.addDays(startDate, -7);
		}
		
		startDate = this.utils.addDays(startDate, -startDate.getDay());
		
		const currMonth = d.getMonth();
		const dates = [];
		
		for(let i = 0; i < this.utils.DATES_IN_VIEW; i++) {
			const date = this.utils.addDays(startDate, i);
			dates.push({
				date: date,
				currentMonth: currMonth == date.getMonth()
			});
		}
		
		return dates;
	},
	
	getCalendarMonths: function getCalendarMonths(d) {
		let startDate = this.utils.getFirstDayOfTheMonth(d);
		startDate.setMonth(0);
		
		const months = [];
		
		for(let i = 0; i < this.utils.MONTHS_IN_VIEW; i++) {
			const date = this.utils.addMonths(startDate, i);
			months.push({
				date: date,
			});
		}
		return months;
	},
	
	getCalendarYears: function getCalendarYears(d) {
		let startDate = this.utils.getFirstDayOfTheMonth(d);
		startDate.setMonth(0);
		startDate.setFullYear(startDate.getFullYear() - (startDate.getFullYear()%10));
		
		const years = [];
		
		for(let i = 0; i < this.utils.YEARS_IN_VIEW; i++) {
			const date = this.utils.addMonths(startDate, i*12);
			years.push({
				date: date,
			});
		}
		return years;
	},
	
	changeViewMode: function changeViewMode(newViewMode, currDate) {
		this.viewMode = newViewMode;
		this.updateCalendar(currDate);
	},

	utils: {
				
		getFirstDayOfTheMonth: function getFirstDayOfTheMonth(d) {
			const first = new Date(d);
			first.setDate(1);
			return first;
		},


		addDays: function addDays(d, i) {
			d = new Date(d);
			d.setDate(d.getDate() + i);
			return d;
		},
		addMonths: function addMonths(d, i) {
			d = new Date(d);
			d.setMonth(d.getMonth() + i);
			return d;
		},

		getMonthName: function getMonthName(monthNumber) {
			if (monthNumber instanceof Date) {
				monthNumber = monthNumber.getMonth();
			} else if (typeof monthNumber == 'number' && 1 <= monthNumber && monthNumber <= 12) {
				monthNumber = monthNumber - 1;
			} else {
				console.error(monthNumber + ' is not a valid month.');
				monthNumber = 0;
			}
			
			return this.MONTHS[monthNumber].fullName;
		},

		toISODateFormat: function toISODateFormat(d) {
			d = new Date(d);
			d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
			return d.toISOString().slice(0, 10)
		},
		
		toNormalDateFormat: function toISODateFormat(d) {
			d = new Date(d);
			//d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
			return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
		},
		
		DATES_IN_VIEW: 7 * 6,  // 7 days * 6 weeks
		MONTHS_IN_VIEW: 12, // Full year
		YEARS_IN_VIEW: 12,	// Full decade
		WEEKDAYS: [
			{
				weekDayIndex: 0,
				weekdayNumber: 1,
				fullName: 'Sunday',
			},
			{
				weekDayIndex: 0,
				weekdayNumber: 1,
				fullName: 'Monday',
			},
			{
				weekDayIndex: 0,
				weekdayNumber: 1,
				fullName: 'Tuesday',
			},
			{
				weekDayIndex: 0,
				weekdayNumber: 1,
				fullName: 'Wednesday',
			},
			{
				weekDayIndex: 0,
				weekdayNumber: 1,
				fullName: 'Thursday',
			},
			{
				weekDayIndex: 0,
				weekdayNumber: 1,
				fullName: 'Friday',
			},
			{
				weekDayIndex: 0,
				weekdayNumber: 1,
				fullName: 'Saturday',
			},
		],
		MONTHS: [
			{
				monthNumber: 1,
				fullName: 'January',
				abbreviation: 'Jan',
			},
			{
				monthNumber: 2,
				fullName: 'February',
				abbreviation: 'Feb',
			},
			{
				monthNumber: 3,
				fullName: 'March',
				abbreviation: 'Mar',
			},
			{
				monthNumber: 4,
				fullName: 'April',
				abbreviation: 'Apr',
			},
			{
				monthNumber: 5,
				fullName: 'May',
				abbreviation: 'May',
			},
			{
				monthNumber: 6,
				fullName: 'June',
				abbreviation: 'Jun',
			},
			{
				monthNumber: 7,
				fullName: 'July',
				abbreviation: 'Jul',
			},
			{
				monthNumber: 8,
				fullName: 'August',
				abbreviation: 'Aug',
			},
			{
				monthNumber: 9,
				fullName: 'September',
				abbreviation: 'Sep',
			},
			{
				monthNumber: 10,
				fullName: 'October',
				abbreviation: 'Oct',
			},
			{
				monthNumber: 11,
				fullName: 'November',
				abbreviation: 'Nov',
			},
			{
				monthNumber: 12,
				fullName: 'December',
				abbreviation: 'Dec',
			},
		],
		
	},
	
};


