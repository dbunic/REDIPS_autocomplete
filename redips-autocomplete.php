<html>
<body onload="javascript:top.REDIPS.autocomplete.show()">
<select multiple 
ondblclick = "javascript:top.REDIPS.autocomplete.value(this)"
onkeydown  = "javascript:top.keydown(this,event)"
onblur     = "javascript:top.REDIPS.autocomplete.hide()"
style      = "width:100%; height:100%">

<?php
// create options for select like <option>answer1</option> <option>answer2</option> ...
$query = $_REQUEST['query']; // query
$fname = $_REQUEST['fname']; // field name
for ($i = 0; $i < rand(3, 10); $i++) {
	print "<option>$fname$query$i$i$i</option>"; 
}
?>

</select>
</body>
</html>
