<?php 
if (empty($_COOKIE['Pathmotion'])){
	header('location:/?logout');
	exit;
}

/* init $dbcon as MySQL connection */ 
require('./_db.inc'); 
$dbcon = init_db();

/* read cookie and instantiate UI */
$cookie = unserialize($_COOKIE['Pathmotion']);

if (empty($cookie) || empty($cookie['user_id']) || empty($cookie['securitykey'])){
	echo 'Error with cookie data';
	print_r($cookie);
	exit;
}

/* grab the type of the user (visitor or insider) */

$result = $dbcon->query('
	SELECT type 
	FROM fbpages_discussions_chats_users 
	WHERE discussion_chat_id = 1 
	AND user_id = "'.addslashes($cookie['user_id']).'" LIMIT 1'
);
if ($result->num_rows){
	while ($row = $result->fetch_row()) {
		$user_type = $row[0];
	}
} 
if (empty($user_type)){
	$user_type = 'visitor';
	$dbcon->query(
		'INSERT INTO fbpages_discussions_chats_users '
		.'(discussion_chat_id, user_id, type, created) '
		.'VALUES ( 1, "'.addslashes($cookie['user_id']).'", "'.$user_type.'" NOW() )'
		);
}

/* luser: object that will be used in the UI */
$luser = array(
	'chat_id' => 1,
	'discussion_chat_id' => 1,
	'user_id' => $cookie['user_id'],
	'full_name' => $cookie['full_name'],
	'securitykey' => $cookie['securitykey'],
	'type' => $user_type
	);

/* instantiate the insiders list */
$insiders = array();
$result = $dbcon->query('
	SELECT users.id, users.firstname, users.lastname 
	FROM users 
	INNER JOIN fbpages_discussions_chats_users AS chat_users ON (
		chat_users.user_id = users.id AND chat_users.type = "insider" AND disconnect_date IS NULL
		)
	WHERE chat_users.discussion_chat_id = 1'
);

if ($result->num_rows){

	while ($row = $result->fetch_row()) {
		$insiders[] = array(
			'id' => $row[0],
			'firstname' => $row[1],
			'lastname' => $row[2]
		);
	}
}
?> 