/*
Copyright (c)  2008-2011, www.redips.net  All rights reserved.
Code licensed under the BSD License: http://www.redips.net/license/
http://www.redips.net/javascript/dialog-box/
Version 1.2.1
Sep 20, 2011.
*/
"use strict";var REDIPS=REDIPS||{};REDIPS.autocomplete=(function(){var init,show,hide,focus,keydown,selected,sendURL,initXMLHttpClient,request,div,oInput,timer=null,firstBlur=false,delay=500,height=100,url='redips-autocomplete.php?query=';init=function(){var body=document.getElementsByTagName('body')[0];div=document.createElement('div');div.setAttribute('id','redips_autocomplete');div.onmouseover=REDIPS.autocomplete.focus;div.style.cssText='position:absolute;visibility:hidden;background-color:white;z-index:999;height:'+REDIPS.autocomplete.height+'px';body.appendChild(div);request=initXMLHttpClient();REDIPS.event.add(document,'click',REDIPS.autocomplete.hide);};initXMLHttpClient=function(){var XMLHTTP_IDS,xmlhttp,success=false,i;try{xmlhttp=new XMLHttpRequest();}
catch(e1){XMLHTTP_IDS=['MSXML2.XMLHTTP.5.0','MSXML2.XMLHTTP.4.0','MSXML2.XMLHTTP.3.0','MSXML2.XMLHTTP','Microsoft.XMLHTTP'];for(i=0;i<XMLHTTP_IDS.length&&!success;i++){try{success=true;xmlhttp=new ActiveXObject(XMLHTTP_IDS[i]);}
catch(e2){}}
if(!success){throw new Error('Unable to create XMLHttpRequest!');}}
return xmlhttp;};show=function(){div.style.visibility='visible';};hide=function(){if(firstBlur){firstBlur=false;return;}
if(timer!==null){clearTimeout(timer);}
div.style.visibility='hidden';};focus=function(){firstBlur=true;div.getElementsByTagName('select')[0].focus();};keydown=function(field,e){if(field.nodeName==='INPUT'){oInput=field;switch(e.keyCode||window.event.keyCode){case 9:case 13:case 16:case 17:case 18:case 19:case 20:case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 45:case 145:case 112:case 113:case 114:case 115:case 116:case 117:case 118:case 119:case 120:case 121:case 122:case 123:break;case 27:hide();break;case 40:focus();break;case 8:case 46:sendURL();break;default:sendURL();break;}}
else{switch(e.keyCode||window.event.keyCode){case 27:case 8:hide();oInput.focus();break;case 9:case 13:selected(field);break;}}};selected=function(oSelect){var idx=oSelect.selectedIndex;oInput.value=oSelect.options[idx].text;div.style.visibility='hidden';oInput.focus();};sendURL=function(){if(timer!==null){clearTimeout(timer);}
timer=setTimeout(function(){var oTop=0,oLeft=0,box=oInput;if(oInput.value.length===0){hide();return;}
do{oLeft+=box.offsetLeft;oTop+=box.offsetTop;box=box.offsetParent;}
while(box);div.style.top=(oTop+oInput.offsetHeight)+'px';div.style.left=oLeft+'px';div.style.width=oInput.offsetWidth+'px';request.open('GET',REDIPS.autocomplete.url+oInput.value+'&fname='+oInput.name,true);request.onreadystatechange=function(){var output;if(request.readyState===4){if(request.status===200){output='<select multiple ondblclick="REDIPS.autocomplete.selected(this)" '+'onkeydown = "REDIPS.autocomplete.keydown(this, event)" '+'onblur = "REDIPS.autocomplete.hide()" '+'onclick = "window.event.cancelBubble = true" '+'style = "width:100%; height:100%">';output=output+request.responseText;div.innerHTML=output+'</select>';show();}
else{div.innerHTML='Error: ['+request.status+'] '+request.statusText;}}};request.send(null);},REDIPS.autocomplete.delay);};return{delay:delay,url:url,height:height,init:init,show:show,hide:hide,focus:focus,keydown:keydown,selected:selected};}());if(!REDIPS.event){REDIPS.event=(function(){var add,remove;add=function(obj,eventName,handler){if(obj.addEventListener){obj.addEventListener(eventName,handler,false);}
else if(obj.attachEvent){obj.attachEvent('on'+eventName,handler);}
else{obj['on'+eventName]=handler;}};remove=function(obj,eventName,handler){if(obj.removeEventListener){obj.removeEventListener(eventName,handler,false);}
else if(obj.detachEvent){obj.detachEvent('on'+eventName,handler);}
else{obj['on'+eventName]=null;}};return{add:add,remove:remove};}());}