<?php
// input parameters sent from sendURL method
$query = $_REQUEST['query']; // query
$fname = $_REQUEST['fname']; // field name
// random loop
for ($i = 0; $i < rand(6, 9); $i++) {
	print "<option>$fname$query$i$i$i</option>"; 
}
?>