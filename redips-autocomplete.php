<html>
<body onload="top.REDIPS.autocomplete.show()">
<select multiple 
ondblclick = "top.REDIPS.autocomplete.selected(this)"
onkeydown  = "top.REDIPS.autocomplete.keydown(this, event)"
onblur     = "top.REDIPS.autocomplete.hide()"
style      = "width:100%; height:100%">

<?php
	// input parameters sent from sendURL method
	$query = $_REQUEST['query']; // query
	$fname = $_REQUEST['fname']; // field name
	// random loop
	for ($i = 0; $i < rand(6, 9); $i++) {
		print "<option>$fname$query$i$i$i</option>"; 
	}
?>

</select>
</body>
</html>
