<?php 
	/* init $dbcon as MySQL connection */ 
	include('./_db.inc'); 
	$dbcon = init_db();

	if (isset($_GET['logout'])){
		/* delete all cookie(s) from the domain */
		$cookiesSet = array_keys($_COOKIE);
		for ($x=0;$x<count($cookiesSet);$x++) setcookie($cookiesSet[$x],"",time()-1);
		header('location:/?byebye');
		exit;
	}

	if (!empty($_COOKIE['Pathmotion'])):
		/* load Chat UI */
		require ('Layout/chat.php');
	elseif (!empty($_POST['data'])):
		/* sign in or create account */
		require('./_account.inc');
	else:
?>
<html>
<head>
	<title>Login</title>
</head>
<body>
	<h1>Enter into the Live Chat demo</h1>
	<form action="./index.php" method="POST">
		<h2>Already an account?</h2>
		<?php if (!empty($error)): ?>
		<h3 style="color:red;"><?php echo $error ?></h3>
	<?php endif; ?>
		<label for="email">email</label><input type="text" id="email" name="data[email]" />
		<label for="password">password</label><input type="text" id="password" name="data[password]" />
		<input type="submit" value="Submit" />
	</form>

	<form action="./index.php?create" method="POST">
		<h2>Create a new account</h2>
		<label for="firstname">firstname</label><input type="text" id="firstname" name="data[firstname]" />
		<label for="lastname">lastname</label><input type="text" id="lastname" name="data[lastname]" /><br />
		<label for="email">email</label><input type="text" id="email" name="data[email]" />
		<label for="password">password</label><input type="text" id="password" name="data[password]" /><br />
		<select name="data[type]">
			<option value="visitor">Visitor</option>
			<option value="insider">Insider</option>
		</select>
		<input type="submit" value="Create" />
	</form>
</body>
</html>
<?php endif; ?>
<?php $dbcon->close(); ?>
