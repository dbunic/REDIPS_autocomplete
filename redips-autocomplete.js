/*
Copyright (c)  2008-2011, www.redips.net  All rights reserved.
Code licensed under the BSD License: http://www.redips.net/license/
http://www.redips.net/javascript/dialog-box/
Version 1.2.0
Sep 05, 2011.
*/

/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false */

/* enable strict mode */
"use strict";

// create REDIPS namespace (if is not already defined in another REDIPS package)
var REDIPS = REDIPS || {};

/**
 * @namespace
 * @description REDIPS.autocomplete is a simple JavaScript library with autocomplete functionallity.
 * @name REDIPS.autocomplete
 * @author Darko Bunic
 * @see
 * <a href="http://www.redips.net/javascript/autocomplete/">Autocomplete without AJAX</a>
 * @version 1.2.0
 */
REDIPS.autocomplete = (function () {
		// method declaration
	var	init,
		show,
		hide,
		focus,
		keydown,
		selected,
		sendURL,
		initXMLHttpClient,
		// properties
		request,					// XMLHttp request object
		div,						// reference to the div that contains iframe 
		oInput,						// current input field
		timer = null,				// timer reference (needed to cancel previous call)
		visible = false,			// div visibility flag
		// public properties
		delay = 500,				// time to wait after last typed char to send request (milliseconds)
		height = 100,				// default height of popup
		url = 'redips-autocomplete.php?query=';	// autocomplete url 


	/**
	 * REDIPS.autocomplete initialization. DIV element with id="redips_autocomplete" is appended to the page (needed for iframe to show options below input field).
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#init
	 */
	init = function () {
		var body = document.getElementsByTagName('body')[0],		// set reference to the BODY element
			redips_autocomplete = document.createElement('div');	// create autocomplete DIV element
		// set id, onmouseover and style attributes
		redips_autocomplete.setAttribute('id', 'redips_autocomplete');
		redips_autocomplete.setAttribute('onmouseover', 'REDIPS.autocomplete.focus()');
		redips_autocomplete.setAttribute('style', 'position:absolute;visibility:hidden;background-color:white;z-index:999;height:' + REDIPS.autocomplete.height + 'px');
		// set inner HTML
		redips_autocomplete.innerHTML = '<iframe marginwidth="0" marginheight="0" frameborder="0" width="100%" height="100%" scrolling="no"></iframe>';
		// append dialog box and shade to the page body
		body.appendChild(redips_autocomplete);
		// set reference to the invisible div (after page is loaded)
		div = document.getElementById('redips_autocomplete');
		// initiate XMLHttp request object
		request = initXMLHttpClient();
	};


	// XMLHttp request object
	initXMLHttpClient = function () {
		var XMLHTTP_IDS,
			xmlhttp,
			success = false,
			i;
		// Mozilla/Chrome/Safari/IE7/IE8 (normal browsers)
		try {
			xmlhttp = new XMLHttpRequest(); 
		}
		// IE (?!)
		catch (e1) {
			XMLHTTP_IDS = [ 'MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0',
							'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP' ];
			for (i = 0; i < XMLHTTP_IDS.length && !success; i++) {
				try {
					success = true;
					xmlhttp = new ActiveXObject(XMLHTTP_IDS[i]);
				}
				catch (e2) {}
			}
			if (!success) {
				throw new Error('Unable to create XMLHttpRequest!');
			}
		}
		return xmlhttp;
	};


	/**
	 * Method shows popup (autocomplete DIV) in a moment when iframe is loaded. Only iframe calls this function from "onload" event.
	 * Popup hieght is defined with REDIPS.autocomplete.height public property.
	 * @see <a href="#height">REDIPS.autocomplete.height</a>
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#show
	 */
	show = function () {
		div.style.visibility = 'visible';
	};


	/**
	 * Method hides popup in a moment when user presses ESCAPE key or popup looses focus.
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#hide
	 */
	hide = function () {
		if (visible) {
			visible = false;
			return;
		}
		// cancel previous call
		if (timer !== null) {
			clearTimeout(timer);
		}
		// hide div
		div.style.visibility = 'hidden';
	};


	/**
	 * Method sets focus to the popup shown below input field. It is called from keydown and from onmouseover event of popup.
	 * DIV popup is created in init().
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#focus
	 */
	focus = function () {
		visible = true; 
		div.getElementsByTagName('select')[0].focus();
	};


	/**
	 * 
	 * keydown() method is called on every key down in input field and popup.
	 * In a moment when popup is shown below input field, it's possible to
	 * change focus to popup with "arrow down" key.
	 * Arrow down and arrow up will change highlighting of current item.
	 * Pressing TAB/ENTER will copy current item to the input box.
	 * Pressing ESCAPE will close popup and return focus to the input field.
	 * @param {HTMLElement} field Input element or "select multiple" element.
	 * @param {Event} e Event information.
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#keydown
	 */
	keydown = function (field, e) {
		// keydown in input field
		if (field.nodeName === 'INPUT') {
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
				hide();
				break;
			// arrow down (set focus to popup)
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
			// tab, enter (set value to the input field)
			case 9:
			case 13:
				selected(field);
				break;
			}
		}
	};


	/**
	 * Method copies the current item from multiple select to the input field.
	 * Input parameter is reference to the multiple select.
	 * This method is called from iframe on dblclick event or from keydown() method if ENTER or TAB key was pressed.
	 * @param {HTMLElement} oSelect Multiple select element.
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#selected
	 */
	selected = function (oSelect) {
		var idx = oSelect.selectedIndex;
		oInput.value = oSelect.options[idx].text;
		div.style.visibility = 'hidden';
		oInput.focus();
	};


	// private function called if delete or backspace is pressed
	/**
	 * sendURL() is a private method called on every text change in input field.
	 * After every character input, timer is restarted (default timeout is set to 500ms).
	 * When timer finishes, sendURL will send URL to query reply from the server.
	 * Reply from server will be displayed to the popup below input field.
	 * Timer value can be modified with REDIPS.autocomplete.delay property.
	 * @see <a href="#delay">REDIPS.autocomplete.delay</a>
	 * @private
	 * @memberOf REDIPS.autocomplete#
	 */
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
				oLeft += box.offsetLeft - box.scrollLeft;
				oTop += box.offsetTop - box.scrollTop;
				box = box.offsetParent;
			}
			while (box);
			// set top and left position of DIV element regarding to input element
			div.style.top = (oTop + oInput.offsetHeight) + 'px';
			div.style.left = oLeft + 'px';
			// set width to the DIV element the same as width of the input field
			div.style.width = oInput.offsetWidth + 'px';
			// open asynchronus request
			request.open('GET', REDIPS.autocomplete.url + oInput.value + '&fname=' + oInput.name, true);
			// the onreadystatechange event is triggered every time the readyState changes
			request.onreadystatechange = function () {
				var output;
				// request finished and response is ready
				if (request.readyState === 4) {
					if (request.status === 200) {
						output = '<select multiple ondblclick="REDIPS.autocomplete.selected(this)" ' +
								'onkeydown = "REDIPS.autocomplete.keydown(this, event)" ' +
								'onblur = "REDIPS.autocomplete.hide()" ' +
								'style = "width:100%; height:100%">';
						output = output + request.responseText;
						div.innerHTML = output + '</select>';
						show();
					}
					// if request status isn't OK
					else {
						div.innerHTML = 'Error: [' + request.status + '] ' + request.statusText;
					}
			    }
			};
			request.send(null); // send request
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
		/**
		 * Popup height (px).
		 * @type Integer
		 * @name REDIPS.autocomplete#height
		 * @default 100
		 */
		height : height,
		/* public methods are documented in main code */
		init : init,
		show : show,
		hide : hide,
		focus : focus,
		keydown : keydown,
		selected : selected
		
	};
}());

