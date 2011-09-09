/*
Copyright (c)  2008-2011, www.redips.net  All rights reserved.
Code licensed under the BSD License: http://www.redips.net/license/
http://www.redips.net/javascript/dialog-box/
Version 1.1.0
Sep 05, 2011.
*/
"use strict";var REDIPS=REDIPS||{};REDIPS.autocomplete=(function(){var init,show,hide,focus,keydown,selected,sendURL,div,oInput,timer=null,visible=false,delay=500,height=100,url='redips-autocomplete.php?query=';init=function(){var body=document.getElementsByTagName('body')[0],redips_autocomplete=document.createElement('div');redips_autocomplete.setAttribute('id','redips_autocomplete');redips_autocomplete.setAttribute('onmouseover','REDIPS.autocomplete.focus()');redips_autocomplete.setAttribute('style','position:absolute;visibility:hidden;background-color:white;height:'+REDIPS.autocomplete.height+'px');redips_autocomplete.innerHTML='<iframe marginwidth="0" marginheight="0" frameborder="0" width="100%" height="100%" scrolling="no"></iframe>';body.appendChild(redips_autocomplete);div=document.getElementById('redips_autocomplete');};show=function(){div.style.visibility='visible';};hide=function(){if(visible){visible=false;return;}
if(timer!==null){clearTimeout(timer);}
div.style.visibility='hidden';};focus=function(){visible=true;div.firstChild.contentWindow.document.getElementsByTagName('select')[0].focus();};keydown=function(field,e){if(field.nodeName==='INPUT'){oInput=field;switch(e.keyCode||window.event.keyCode){case 9:case 13:case 16:case 17:case 18:case 19:case 20:case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 45:case 145:case 112:case 113:case 114:case 115:case 116:case 117:case 118:case 119:case 120:case 121:case 122:case 123:break;case 27:hide();break;case 40:focus();break;case 8:case 46:sendURL();break;default:sendURL();break;}}
else{switch(e.keyCode||window.event.keyCode){case 27:case 8:hide();oInput.focus();break;case 9:case 13:selected(field);break;}}};selected=function(oSelect){var idx=oSelect.selectedIndex;oInput.value=oSelect.options[idx].text;div.style.visibility='hidden';oInput.focus();};sendURL=function(){if(timer!==null){clearTimeout(timer);}
timer=setTimeout(function(){var oTop=0,oLeft=0,box=oInput;if(oInput.value.length===0){hide();return;}
do{oLeft+=box.offsetLeft;oTop+=box.offsetTop;box=box.offsetParent;}
while(box&&box.nodeName!=='BODY');div.style.top=(oTop+oInput.offsetHeight)+'px';div.style.left=oLeft+'px';div.style.width=oInput.offsetWidth+'px';div.getElementsByTagName('iframe')[0].src=REDIPS.autocomplete.url+oInput.value+'&fname='+oInput.name;},REDIPS.autocomplete.delay);};return{delay:delay,url:url,height:height,init:init,show:show,hide:hide,focus:focus,keydown:keydown,selected:selected};}());