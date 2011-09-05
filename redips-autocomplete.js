/*
Copyright (c)  2008-2011, www.redips.net  All rights reserved.
Code licensed under the BSD License: http://www.redips.net/license/
http://www.redips.net/javascript/dialog-box/
Version 1.0.0
Sep 05, 2011.
*/

/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false */

/* enable strict mode */
"use strict";

// create REDIPS namespace (if is not already defined in another REDIPS package)
var REDIPS = REDIPS || {};

REDIPS.autocomplete = (function () {
		// method declaration
	var	init,
		autocomplete,
		popup,
		setFocus,
		hidePopup,
		keydown,
		setValue,
		// properties
		div,						// reference to the div that contains iframe 
		oInput,						// current input field
		timer = null,				// timer reference (needed to cancel previous call)
		delay = 500,				// time to wait after last typed char to send request (milliseconds)
		stayVisible = 0,			// div visibility flag
		url = 'redips-autocomplete.php?query=';	// autocomplete url 


	// initialization
	init = function () {
		var body = document.getElementsByTagName('body')[0],		// set reference to the BODY element
			redips_autocomplete = document.createElement('div');	// create autocomplete DIV element
		// set id="redips_autocomplete" to the DIV element
		redips_autocomplete.setAttribute('id', 'redips_autocomplete');
		// append dialog box and shade to the page body
		body.appendChild(redips_autocomplete);
		// set reference to the invisible div (after page is loaded)
		div = document.getElementById('redips_autocomplete');
console.log('hi11');
	};


	// called on keydown event in input field
	autocomplete = function (field, e) {
		// private function called if delete or backspace is pressed
		var newPopup = function () {
			// cancel previous call if there is any
			if (timer !== null) {
				clearTimeout(timer);
			}
			// set new popup call
			timer = setTimeout(function () {
				popup();
			}, REDIPS.autocomplete.delay);
		};
		// set current input field
		oInput = field;
		switch (e.keyCode || window.event.keyCode) {
		// tab, enter, shift, ctrl, alt, pause, caps lock
		case 9:
		case 13:
		case 16:
		case 17:
		case 18:
		case 19:
		case 20:
		// page up, page down, end, home, arrow left, arrow up, arrow right
		case 33:
		case 34:
		case 35:
		case 36:
		case 37:
		case 38:
		case 39:
		// insert, scroll lock
		case 45:
		case 145:
		// F1,F2,F3,F4,F5,F6
		case 112:
		case 113:
		case 114:
		case 115:
		case 116:
		case 117:
		// F7,F8,F9,F10,F11,F12
		case 118:
		case 119:
		case 120:
		case 121:
		case 122:
		case 123: 
			break;
		// escape (hide div element)
		case 27:
			hidePopup();
			break;
		// arrow down (set focus to the multiple select)
		case 40:
			setFocus();
			break;
		// backspace, delete
		case 8:
		case 46:
			newPopup();
			break;
		//  and default
		default:
			newPopup();
			break;
		}
	};


	// div popup
	popup = function () {
		// define oTop, oLeft and box variables  
		var oTop = 0,
			oLeft = 0,  
			box = oInput;
		// if user deletes content from input box, then hide popup and return
		if (oInput.value.length === 0) {
			hidePopup();
			return;
		}
		// find input field position and set popup position  
		do {
			oLeft += box.offsetLeft - box.scrollLeft;
			oTop += box.offsetTop - box.scrollTop;
			box = box.offsetParent;
		}
		while (box && box.nodeName !== 'BODY');
		// set top and left position of DIV element regarding input element
		div.style.top  = (oTop + 22) + 'px';  
		div.style.left = oLeft + 'px';
		// find iframe in div and set src attribute with parameters query and field name
		div.getElementsByTagName('iframe')[0].src = url + oInput.value + '&fname=' + oInput.name;
	};


	// set focus to the multiple select (contentWindow works for IE6 and FF)
	setFocus = function () {
		stayVisible = 1; // set stayVisible flag (needed for onblur event on input field)
		div.firstChild.contentWindow.document.getElementsByTagName('select')[0].focus();
	};


	// hide popup
	hidePopup = function () {
		if (stayVisible === 1) {
			stayVisible = 0;
			return;
		}
		// cancel previous call
		if (timer !== null) {
			clearTimeout(timer);
		}
		// hide div
		div.style.visibility = 'hidden';
	};


	// called on keydown event in multiple select (from iframe)
	keydown = function (oSelect, e) {
		switch (e.keyCode || window.event.keyCode) {
		// escape, backspace (hide popup and set focus to the input field)
		case 27:
		case 8:
			hidePopup();
			oInput.focus();
			break;
		// tab, return (set value to the input field)
		case 9:
		case 13:
			setValue(oSelect);
			break;
		}
	};


	// set value to the input box (used by keydown and ondblclick event)
	setValue = function (oSelect) {
		var idx = oSelect.selectedIndex;
		oInput.value = oSelect.options[idx].text;
		div.style.visibility = 'hidden';
		oInput.focus();
	};

	return {
		/**
		 * Time to wait after last typed char to send request (milliseconds).
		 * @type Integer
		 * @name REDIPS.autocomplete#delay
		 * @default 500
		 */
		delay : delay,
		/**
		 * Autocomplete URL. Server page to query for typed input.
		 * @type String
		 * @name REDIPS.autocomplete#url
		 * @default "redips-autocomplete.php?query="
		 */
		url : url,
		/* public methods (documented in main code) */
		init : init,
		autocomplete : autocomplete
	};
}());

