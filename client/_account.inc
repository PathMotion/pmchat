<?php 
$data = $_POST['data'];
if (isset($_GET['create'])){
	/* account creation */
	$sql = 'INSERT INTO users '
	.'(firstname, lastname, email, password, securitykey, created, modified) '
	.'VALUES ( "'.addslashes(trim($data['firstname'])).'", "'.addslashes(trim($data['lastname'])).'", "'.addslashes(trim($data['email'])).'", "'.md5(addslashes(trim($data['password']))).'", "'.md5(uniqid(rand())).'", NOW(), NOW() )';
	if (!$dbcon->query( $sql )){
		die('Could not enter data: ' . $dbcon->error);
	} else {
		$result = $dbcon->query('SELECT id	from users WHERE email = "'.addslashes(trim($data['email'])).'" AND password="'.md5(addslashes(trim($data['password']))).'" LIMIT 1');
		if ($result->num_rows){
			while ($row = $result->fetch_row()) {
				$dbcon->query(
					'INSERT INTO fbpages_discussions_chats_users '
					.'(discussion_chat_id, user_id, type, created) '
					.'VALUES ( 1, "'.$row[0].'", "'.trim($data['type']).'", NOW() )'
					);
			}
		}
		echo '<h1>Created!</h1>';
		echo '<h2> <a href="./">back to sign in using your new credentials</a></h2>';
	}
}else{
	/* sign in process */
	$result = $dbcon->query('SELECT id, securitykey, firstname, lastname from users WHERE email = "'.trim($data['email']).'" AND password="'.md5(trim($data['password'])).'" LIMIT 1');
	if ($result->num_rows){
		while ($row = $result->fetch_row()) {
			/* create a fake cookie that will be checked by the chat server - and use to instantiate the chat UI */
			setcookie("Pathmotion", serialize(array(
				'user_id' => $row[0], 
				'securitykey' => $row[1],
				'full_name' => trim($row[2].' '.$row[3])
			)));
			/* reset the potential previous disconnect_date in database */
			$dbcon->query('
					UPDATE fbpages_discussions_chats_users SET disconnect_date = NULL 
					WHERE discussion_chat_id = 1 AND user_id = "'.$row[0].'"'
					);
			header('location:/index.php?hello'); /* reload: as the cookie now exit, the chat will be loaded */
			exit;
		}
	} else{
		header('location:/index.php?error=User-not-found'); /* reload: as the cookie now exit, the chat will be loaded */
		exit;
	}
}
?>