<?php 
function init_db(){
	$db = array(
		'user' => "", 
		'password' => "", 
		'database' => "pmchat",
		'host' => "localhost"
	);
	$mysqli = new mysqli($db['host'], $db['user'], $db['password'], $db['database']);
	/* Vérification de la connexion */
	if ($mysqli->connect_errno) {
 	   printf("Cannot connect to database: %s\n", $mysqli->connect_error);
	    exit();
	}
	return $mysqli;
}
?>