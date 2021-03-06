/*
Copyright (c)  2008-2020, www.redips.net  All rights reserved.
Code licensed under the BSD License: http://www.redips.net/license/
http://www.redips.net/javascript/autocomplete/
Version 1.3.0
Mar 25, 2020.
*/

/* eslint-env browser */
/* eslint
   semi: ["error", "always"],
   indent: [2, "tab"],
   no-tabs: 0,
   no-multiple-empty-lines: ["error", {"max": 2, "maxEOF": 1}],
   one-var: ["error", "always"] */

/* enable strict mode */
'use strict';

/**
 * @name REDIPS
 * @description create REDIPS namespace (if is not already defined in another REDIPS package)
 */
var REDIPS = REDIPS || {}; // eslint-disable-line no-use-before-define

/**
 * @namespace
 * @description REDIPS.autocomplete is simple JavaScript library with autocomplete functionality
 * @name REDIPS.autocomplete
 * @author Darko Bunic
 * @see
 * <a href="http://www.redips.net/javascript/autocomplete/">JavaScript autocomplete</a>
 * @version 1.3.0
 */
REDIPS.autocomplete = (function () {
	// methods declaration
	var	init,
		show,
		hide,
		focus,
		keydown,
		selected,
		sendURL,
		// properties
		xhr,				// XMLHttpRequest object
		div,				// reference to the div that contains iframe
		oInput,				// current input field
		timer = null,		// timer reference (needed to cancel previous call)
		firstBlur = false,	// do not hide popup on first blur
		// public properties
		delay = 500,		// time to wait after last typed char to send request (milliseconds)
		height = 120,		// default height of popup
		url = 'redips-autocomplete.php?query=';	// autocomplete url


	/**
	 * REDIPS.autocomplete initialization. DIV element with id="redips-autocomplete" is appended to the page (needed to display autocomplete options).
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#init
	 */
	init = function () {
		// set reference to the BODY element
		let body = document.getElementsByTagName('body')[0];
		// create autocomplete DIV element
		div = document.createElement('div');
		// set id of DIV element
		div.setAttribute('id', 'redips-autocomplete');
		// set onmouseover event handler
		div.onmouseover = REDIPS.autocomplete.focus;
		// set styles
		div.style.cssText = 'position:absolute;visibility:hidden;background-color:white;z-index:999;height:' + REDIPS.autocomplete.height + 'px';
		// append DIV element (dialog box to document body)
		body.appendChild(div);
		// initiate XML Http request object
		xhr = new XMLHttpRequest();
		// hide popup if clicked anywhere on the page
		// IE needs to stop event bubbling if clicking to the item in multiple select: onclick = "window.event.cancelBubble = true"
		REDIPS.event.add(document, 'click', REDIPS.autocomplete.hide);
	};


	/**
	 * Method shows popup (autocomplete DIV) in a moment when AJAX request is finished and response is ready.
	 * Popup height is defined with REDIPS.autocomplete.height public property.
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
		// if DIV element is visible then don't close popup on first blur
		if (firstBlur) {
			firstBlur = false;
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
	 * DIV element for a popup is created in init() method.
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#focus
	 */
	focus = function () {
		firstBlur = true;
		div.getElementsByTagName('select')[0].focus();
	};


	/**
	 * keydown() method is called on every keydown event in input field and popup.
	 * In a moment when popup is shown below input field, it's possible to
	 * change focus to popup with "arrow down" key.
	 * Arrow down and arrow up will change highlighting of the current item.
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
				break;
			// page up, page down, end, home, arrow left, arrow up, arrow right
			case 33:
			case 34:
			case 35:
			case 36:
			case 37:
			case 38:
			case 39:
				break;
			// insert, scroll lock
			case 45:
			case 145:
				break;
			// F1,F2,F3,F4,F5,F6
			case 112:
			case 113:
			case 114:
			case 115:
			case 116:
			case 117:
				break;
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
	 * Method copies highlighted item from multiple select in popup to upper input field.
	 * Input parameter is reference of multiple select.
	 * This method is called from popup on dblclick event or from keydown() method if ENTER or TAB key was pressed.
	 * @param {HTMLElement} oSelect Multiple select element.
	 * @public
	 * @function
	 * @name REDIPS.autocomplete#selected
	 */
	selected = function (oSelect) {
		let idx = oSelect.selectedIndex;
		oInput.value = oSelect.options[idx].text;
		div.style.visibility = 'hidden';
		oInput.focus();
	};


	/**
	 * sendURL() is private method called on every text change in input field.
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
			let oTop = 0,
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
			while (box);
			// set top and left position of DIV element regarding to input element
			div.style.top = (oTop + oInput.offsetHeight) + 'px';
			div.style.left = oLeft + 'px';
			// set width to the DIV element the same as width of the input field
			div.style.width = oInput.offsetWidth + 'px';
			// open asynchronus request
			xhr.open('GET', REDIPS.autocomplete.url + oInput.value + '&fname=' + oInput.name, true);
			// set callback handler
			xhr.onreadystatechange = function () {
				let output;
				// if operation is completed (readyState === 4)
				if (xhr.readyState === XMLHttpRequest.DONE) {
					// if the HTTP status is OK
					if (xhr.status === 200) {
						output = '<select multiple ondblclick="REDIPS.autocomplete.selected(this)" ' +
							'onkeydown = "REDIPS.autocomplete.keydown(this, event)" ' +
							'onblur = "REDIPS.autocomplete.hide()" ' +
							'onclick = "window.event.cancelBubble = true" ' +
							'style = "width:100%; height:100%">';
						output = output + xhr.responseText;
						div.innerHTML = output + '</select>';
						show();
					}
					// if request status is not OK then display error in dialog
					else {
						div.innerHTML = 'Error: [' + xhr.status + '] ' + xhr.statusText;
					}
				}
			};
			// in a good manners, set 'X-Requested-With' HTTP header
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			// send request
			xhr.send(null);
		}, REDIPS.autocomplete.delay);
	};


	return {
		/**
		 * Time to wait (in milliseconds) after last typed char before sending request to the server.
		 * @type Integer
		 * @name REDIPS.autocomplete#delay
		 * @default 500
		 */
		delay: delay,
		/**
		 * Queried URL for typed text in input field.
		 * @type String
		 * @name REDIPS.autocomplete#url
		 * @default "./redips-autocomplete.php?query="
		 */
		url: url,
		/**
		 * Popup height (px).
		 * @type Integer
		 * @name REDIPS.autocomplete#height
		 * @default 120
		 */
		height: height,
		/* public methods are documented in main code */
		init: init,
		show: show,
		hide: hide,
		focus: focus,
		keydown: keydown,
		selected: selected

	};
}());


// if REDIPS.event isn't already defined (from other REDIPS file)
if (!REDIPS.event) {
	REDIPS.event = (function () {
		var add,	// add event listener
			remove;	// remove event listener

		// http://msdn.microsoft.com/en-us/scriptjunkie/ff728624
		// http://www.javascriptrules.com/2009/07/22/cross-browser-event-listener-with-design-patterns/
		// http://www.quirksmode.org/js/events_order.html

		// add event listener
		add = function (obj, eventName, handler) {
			if (obj.addEventListener) {
				// (false) register event in bubble phase (event propagates from from target element up to the DOM root)
				obj.addEventListener(eventName, handler, false);
			}
			else if (obj.attachEvent) {
				obj.attachEvent('on' + eventName, handler);
			}
			else {
				obj['on' + eventName] = handler;
			}
		};

		// remove event listener
		remove = function (obj, eventName, handler) {
			if (obj.removeEventListener) {
				obj.removeEventListener(eventName, handler, false);
			}
			else if (obj.detachEvent) {
				obj.detachEvent('on' + eventName, handler);
			}
			else {
				obj['on' + eventName] = null;
			}
		};

		return {
			add: add,
			remove: remove
		}; // end of public (return statement)
	}());
}
