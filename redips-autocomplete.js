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
		show,
		hide,
		focus,
		keydown,
		selected,
		sendURL,
		// properties
		div,						// reference to the div that contains iframe 
		oInput,						// current input field
		timer = null,				// timer reference (needed to cancel previous call)
		stayVisible = 0,			// div visibility flag
		delay = 500,				// time to wait after last typed char to send request (milliseconds)
		url = 'redips-autocomplete.php?query=';	// autocomplete url 


	// initialization
	init = function () {
		var body = document.getElementsByTagName('body')[0],		// set reference to the BODY element
			redips_autocomplete = document.createElement('div');	// create autocomplete DIV element
		// set id, autofocus and style attribures
		redips_autocomplete.setAttribute('id', 'redips_autocomplete');
		redips_autocomplete.setAttribute('onmouseover', 'REDIPS.autocomplete.focus()');
		redips_autocomplete.setAttribute('style', 'position:absolute;width:185px;height:90px;visibility:hidden;background-color:white;');
		// set inner HTML
		redips_autocomplete.innerHTML = '<iframe marginwidth="0" marginheight="0" frameborder="0" width="100%" height="100%" scrolling="no"></iframe>';
		// append dialog box and shade to the page body
		body.appendChild(redips_autocomplete);
		// set reference to the invisible div (after page is loaded)
		div = document.getElementById('redips_autocomplete');
	};


	// show popup
	show = function () {
		div.style.visibility = 'visible';
	};


	// hide popup
	hide = function () {
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


	// set focus to the multiple select (contentWindow works for IE6 and FF)
	focus = function () {
		stayVisible = 1; // set stayVisible flag (needed for onblur event on input field)
		div.firstChild.contentWindow.document.getElementsByTagName('select')[0].focus();
	};


	// called on keydown event in input field and in iframe with shown options
	keydown = function (field, e) {
		// set current input field
		oInput = field;
		// keydown in input field
		if (field.nodeName === 'INPUT') {
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
				hide();
				break;
			// arrow down (set focus to the multiple select)
			case 40:
				focus();
				break;
			// backspace, delete
			case 8:
			case 46:
				sendURL();
				break;
			//  and default
			default:
				sendURL();
				break;
			}
		}
		// call from iframe
		else {
			switch (e.keyCode || window.event.keyCode) {
			// escape, backspace (hide popup and set focus to the input field)
			case 27:
			case 8:
				hide();
				oInput.focus();
				break;
			// tab, return (set value to the input field)
			case 9:
			case 13:
				selected(field);
				break;
			}
		}
	};


	// set value to the input box (used by keydown and ondblclick event)
	selected = function (oSelect) {
		var idx = oSelect.selectedIndex;
		oInput.value = oSelect.options[idx].text;
		div.style.visibility = 'hidden';
		oInput.focus();
	};


	// private function called if delete or backspace is pressed
	sendURL = function () {
		// cancel previous call if there is any
		if (timer !== null) {
			clearTimeout(timer);
		}
		// set new popup call
		timer = setTimeout(function () {
			// define oTop, oLeft and box variables  
			var oTop = 0,
				oLeft = 0,  
				box = oInput;
			// if user deletes content from input box, then hide popup and return
			if (oInput.value.length === 0) {
				hide();
				return;
			}
			// find input field position
			do {
				oLeft += box.offsetLeft;
				oTop += box.offsetTop;
				box = box.offsetParent;
			}
			while (box && box.nodeName !== 'BODY');
			// set top and left position of DIV element regarding to input element
			div.style.top = (oTop + oInput.offsetHeight) + 'px';
			div.style.left = oLeft + 'px';
			// set width to the DIV element the same as width of the input field
			div.style.width = oInput.offsetWidth + 'px';
			// find iframe in DIV and set src attribute with parameters query and field name
			div.getElementsByTagName('iframe')[0].src = url + oInput.value + '&fname=' + oInput.name;
		}, REDIPS.autocomplete.delay);
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
		show : show,
		hide : hide,
		focus : focus,
		keydown : keydown,
		selected : selected
		
	};
}());

