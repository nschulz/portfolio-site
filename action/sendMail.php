<?php
	$name = $_REQUEST['name'];
	$email = $_REQUEST['email'];
	$timestamp = time();
	$message = $_REQUEST['message']."\n\n (From $name on ".date("l\, F dS Y \a\\t h:i:s A T", $timestamp).")";
	
	mail( "nate@nateschulz.com", "Email Form (NateSchulz.com)", $message, "From: $email" );
	echo "success";
	
?>