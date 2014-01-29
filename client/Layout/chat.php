<?php 
	require('./_prepareUI.inc');
?>
<!DOCTYPE HTML>
<html xmlns:og="https://ogp.me/ns#"
      xmlns:fb="https://www.facebook.com/2008/fbml"
      xmlns:addthis="https://www.addthis.com/help/api-spec"
      lang="fr" >
<head prefix="og: http://ogp.me/ns# pathmotion: http://ogp.me/ns/apps/pathmotion#">
	<meta http-equiv="X-UA-Compatible" content="IE=8,9,10" >
    <meta charset="utf-8">
    <title>Live chat - My new live chat is here</title>
    <meta name="description" content="
	My new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is hereMy new live chat is here
">
    <!-- <meta name="viewport" content="width=device-width, initial-scale=1.0"> -->

	<link rel="stylesheet" type="text/css" href="/css/awesome/css/font-awesome.css" />	
	<link rel="stylesheet" type="text/css" href="/css/discussions.css" />	
	<link rel="stylesheet" type="text/css" href="/css/chat/app_ui.css" />	

	<!--[if IE 7]>
	<link rel="stylesheet" href="/css/awesome/css/font-awesome-ie7.min.css">
	<![endif]-->
	<!--[if (gte IE 6)&(lte IE 8)]>
	<script type="text/javascript" src="/js/libs/html5.js"></script> 
	<script type="text/javascript" src="/js/libs/selectivizr.js"></script>
	<![endif]-->
	
  </head>
<body class="chatter" 
	c-identifier="<?php echo $luser['chat_id'].'-'.$luser['discussion_chat_id']  ?>" 
	u-identifier="<?php echo $luser['user_id'].'-'.$luser['securitykey']  ?>"
	u-type="<?php echo $luser['type'] ?>">

<div id="fb-root"></div>
<div id="fb-layout-loader" class="fb-layout-loader opacity"></div>


<div id="signInWrap">
	<center>
		<p id="ConnectingMsgHandler">Connexion en cours...</p>
		<p id="ConnectingMsgHandler2"><img src="/img/blue-loader.gif" /></p>
	</center>
</div>
	
	
<div id="contentWrap" class="chat-container" style="display:none">
		
	<div class="chat-header">
		<img src="/img/recruiters_logo.png" />
		<h2 class="georgia">
			Live chat
			<?php 
			if ($luser['type'] == 'insider'): 
				echo ' - '.sprintf('(%s people online)', '<span id="total_online_users">0</span>');
			endif; 
		?>
		</h2>
		<a href="/index.php?logout" class="button right" >
			<i class="icon-off icon-large"></i> Quitter & fermer	
		</a>
	</div>

	<div class="chat-content">

		<div class="chat-intro">
			<aside id="insiders_online">
				<h4>Ambassadeurs connectés (<span class="counter"><?php echo count($insiders) ?></span>)</h4>
				<ul style="width:455px">
					<?php 
						if (!empty($insiders)): 
							foreach ($insiders AS &$insider):
					?>
					<li id="<?php echo $insider['id'] ?>">
						<a href="#disabled-in-this-demo" target="parent">
							<div class="avatar_container avatar-insider left s">
								<img src="/img/users-st/default50.gif" class="avatar"  alt="" />
							</div>
						</a>
						<p>
							<a href="/app/profile/156449/fb_canvas:true/sharedapp:8" class="branded-color" target="parent">
								<span><?php echo trim($insider['firstname'].' '.$insider['lastname']) ?></span>
							</a>
							<br /><span>The current job title…</span>							
						<p>
						<div class="clear"></div>
					</li>
					<?php 
							endforeach;
						endif; 
					?>
				</ul>
			</aside>
		</div>

		<div id="chatDiscussions" class="chat-discussions">

			<div class="chat-viewer-col col1">
				<ul id="discussions"><?php // JS will here fill the list of discussions/questions asked ?></ul>
				<div class="actions">
					<div class="container">
						<div class="filter">
							<label>Filtrez les discussions ci-dessus:</label>
							<select id="discussions_filter" class="left">
								<option value="all">Tout voir</option>
								<option value="own-by-user">Voir uniquement vos discussions</option>
								<option value="answered">Voir les questions répondues</option>
								<?php if ($luser['type'] == 'insider'): ?>
									<option value="no-thread">Voir les questions non répondues</option>
								<?php endif; ?>
							</select>
						</div>
						<a href="#" id="new_thread_bt" class="bt-blue whenChatEnabled" style="display:none;">
							<i class="icon-plus icon-large"></i> <?php echo $luser['type'] != 'insider' ? 'Posez une question' : 'Envoyez une notification générale' ?>
						</a>
					</div>
				</div>
			</div>

			<div class="chat-viewer-col col2">
				<div class="instructor">
					<h2 class="georgia">Bienvenue dans ce live chat !</h2>
					<h1 class="georgia branded-color">My new live chat is here</h1>
					<p class="georgia whenChatEnabled" style="position:absolute;bottom:5px;left:5px;right:5px;font-size:22px;">
						<i class="icon-arrow-down icon-4x branded-color"></i> 
						<?php if ($luser['type'] != 'insider'): ?>
						<br /><strong class="branded-color">Posez votre questions ci-dessous !</strong>
						<?php endif; ?>
					</p>
				</div>

				<ul id="thread" style="display:none"><?php // where the selected discussion thread will be listed ?></ul>

				<div class="actions">
					<form id="send-message" class="container whenChatEnabled">
						<textarea id="message" placeholder="<?php echo $luser['type'] != 'insider' ? 'Tapez votre question ici…' : 'Tapez votre message de notification générale ici… (Seuls les ambassadeurs peuvent faire ceci)' ?>"></textarea>
						<div class="formButtons">
							<input type="submit" class="bt-blue" value="Poster" />
							<div class="clear"></div>
							<input type="checkbox" id="bindEnterOption" />
							<label for="bindEnterOption">Appuyer sur "Entrée" pour envoyer</label>
						</div>
					</form>
					<div id="endMsg" style="display:none"><p style="padding:10px;">Le chat est maintenant terminé.<br />Soyez libre de rester parcourir les différentes discussions. Sachez que vous pouvez à tout moment poser vos questions à nos Ambassadeurs directement sur <a href="/app/home/fb_canvas:true/sharedapp:8" target="parent">notre appli Carrière</a>.</p></div>
				</div>
			</div>
		</div>
	</div>		
	<div id="sound"></div>
</div>
<div id="popup" style="display:none">
	<div id="popup-wrapper" class="close btn-close to-hide keep-btn-close"></div>
	<div id="popup-box-container">
		<div id="popup-box">
			<div id="popup-box-content">
				<div id="flash_messages_wrapper">
									</div>
			</div>
			<i id="popup-box-header" class="icon-remove-sign icon-2x close btn-close to-hide keep-btn-close" data-content="#popup"></i>
			<div class="clear"></div>
		</div>
	</div>
</div>

<script type="text/javascript" src="/js/libs/mootools-core-1.4.5-full-compat-yc.js?1381949847"></script>
<script type="text/javascript" src="/js/libs/mootools-more-1.4.0.1.js?1381949847"></script>
<script type="text/javascript" src="/js/libs/pmscripts.js?1381949847"></script>
<script type="text/javascript" src="/js/libs/placeholder-min.js?1381949847"></script>
<script type="text/javascript" src="/js/libs/discussions.js?1381949847"></script>
<script type="text/javascript" src="/js/libs/moment.min.js?1381949847"></script>
<script type="text/javascript" src="/js/libs/moment-lang/fr.js?1381949847"></script>
<script type="text/javascript" src="/js/chat/app_ux-0.9.1.js?1381949847"></script>
<?php if ($luser['type'] == 'insider'): ?>
<script type="text/javascript" src="/js/chat/app_admin_ux.js?1381949847"></script>
<?php endif; ?>

<?php // hidden inputs to translate JS strings (PHP generated) ?>
<input type="hidden" name="data[]" id="Connecting…" value="Connexion en cours..."/><input type="hidden" name="data[]" id="Waiting for the server to be ready…" value="En attente du serveur…"/><input type="hidden" name="data[]" id="Sorry, an internal error occurred. Try again." value="Désolé, une erreur s&#039;est produite. Veuillez rééssayer."/><input type="hidden" name="data[]" id="The item has been removed." value="L&#039;élément a été supprimé."/><input type="hidden" name="data[]" id="Type your question here…" value="Tapez votre question ici…"/><input type="hidden" name="data[]" id="Add your message here…" value="Ajoutez votre message ici…"/><input type="hidden" name="data[]" id="Sorry, an internal error occurred. Please reload the chat." value="Désolé, une erreur s&#039;est produite. Veuillez relancer le chat."/><input type="hidden" name="data[]" id="Thank you for your participation" value="Thank you for your participation"/><input type="hidden" name="data[]" id="A connection has already been established between the server and your account. Please wait and try again in 30s." value="Une connexion avec le même compte existe déjà avec le serveur. Merci de patienter et de réessayer dans 30s."/>	
<?php 
	if ($luser['type'] == 'insider'){
			$js_strings_for_translation = array_merge($js_strings_for_translation, array(
				'Are you sure you want to delete?',
				'Sorry, an internal error occurred. Try again.',
				'Delete',
				'Type your message to everyone here… (only Insiders can do that)'
			));
		}
		foreach ($js_strings_for_translation AS &$string){
			echo $this->Form->hidden('', array('id' => $string, 'value' => $string));
		}
?>
<script type="text/javascript">
//<![CDATA[
window.addEvent("domready", function (event) {
	if ( window.self !== window.top ){  
		document.body.set('html', '<center>'
			+'<h1>Le chat ne peut être lancé sous l\'interface de Facebook.<br />Cliquez sur le bouton ci-dessous pour pouvoir le lancer.</h1>'
			+'<a class="bt-blue" href="#openChatWindow" onclick="openChatWindow(\'13\',\'407605429254473\', \'1\', \'18bcaf1faf20cb122aa00ed825239a94\');return false;">'
			+'Rejoignez le chat en cours…</a></center>');
	}	
});
//]]>
</script>
</body>
</html>