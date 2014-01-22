// © 2013 - PathMotion - Career Inspiration Chat - v0.9
// app_ux.js - Manage the interactions with the node.js server
 
var socket = null;
function __t(string){
	if ($(string)){
		return $(string).value;
	}
	return string;
}

// ----------------------- ONLOAD -----------------------
$(document).addEvent('domready', function() {

	// ----------------------------------------------------------------
	// global vars
	var currentUserId = null;
	var currentChatId = null;
	var currentRole = null
	var currentUserSkey = null;
	var currentCID = null;
	var signInForm = $('setUserId');
	var ConnectingMsgHandler = $('ConnectingMsgHandler');
	var userIdBox = $('user_id');
	var messageForm = $('send-message');
	var messageBox = $('message');
	var bindEnterOption = $('bindEnterOption');
	var discussionsBox = $('discussions');
	var threadBox = $('thread');
	var instructionBox = threadBox.getPrevious('.instructor');
	var newThreadButton = $('new_thread_bt');
	var discussionsFilter = $('discussions_filter');
	var IOconnectTimeout = null;
	var ioscript = [
		{
			/* via ProxyReverse compatible with Firewall or Company proxy */
			'server': '//'+window.location.hostname+'/socket.io/',
			'lib': '//'+window.location.hostname+'/socket.io/socket.io.js' 
		},

		{
			/* direct */
			'server': 'http://'+window.location.hostname+':843/',
			'lib': 'http://'+window.location.hostname+':843/socket.io/socket.io.js'
		}
	];
	var ioscript_used;
	var scrollTimeout;
	var timerInterval;
	
	// Set the max moment to now (because server time can be different from client time)
	moment().max( new Date().getTime() );
	
	// ----------------------------------------------------------------
	// Init server load
	
	// if ( window.self === window.top )
	{   
		appendScript( ioscript[0]['lib'] );
		initIO( 0, true ); 
	}
	
	// ----------------------------------------------------------------
	// functions
	
	function appendScript(pathToScript) {
	    var head = document.getElementsByTagName("head")[0];
	    var js = document.createElement("script");
	    js.type = "text/javascript";
	    js.src = pathToScript;
		js.id = 'iojsloader';
	    head.appendChild(js);
	}
	
	function initIO( ioscript_previously_tested, firstAttempt ){
		setTimeout(function(){
			if (typeof io != 'undefined'){
				ioscript_used = ioscript_previously_tested;
				ConnectingMsgHandler.set('html', __t('Connecting…'));
				setTimeout(function(){
						socket = io.connect(ioscript[0]['server'], {
							// 'connect timeout': 30000,
							'sync disconnect on unload': true
						});
						initChatEvent();
					
				}, 1000);

			} else {
				ConnectingMsgHandler.set('html', __t('Waiting for the server to be ready…'));
				$('iojsloader').destroy();
				appendScript( ioscript[ (firstAttempt || ioscript_previously_tested ? 0 : 1) ]['lib'] );
				setTimeout(function(){ initIO( (ioscript_previously_tested ? 0 : 1), false ); }, 5000);
			}	
		}, 5000);
	}
	
	function close_chat(){
		if ($('contentWrap').isVisible()){
			$('contentWrap').hide();
		}
		setTimeout(	function(){ 
			alert(__t('Sorry, the connection to the chat has been closed.'));
			window.close(); 
		}, 4000 ); // timeout prevent to close the window when a refresh has been made
		return false;
	}

	function restart(){
		if ($('contentWrap').isVisible()){
			$('contentWrap').hide();
			$('signInWrap').show();
			$('ConnectingMsgHandler2').set('text', __t('Waiting for the server to be ready…'));
			location.reload();
		}
		return false;
	}
	
	function cidCheck(data){
		if (!data || data.cid == undefined || data.cid == null || data.cid != currentCID){
			if (data == 'server_start' || (data.cid && data.cid != currentCID && data.chat && data.chat == currentChatId)){
				// Client became a zombie after a server reboot. Force the chat restart…
				return restart();
			}
			if (data === false){
				// alert(__t('Sorry, an internal error occurred. Try again.'));
			}
			return false;
		} 		
		return true;
	}
	
	function populateDiscussionsList( data ){
		discussionsBox.set('html', '');
		if (data != null && Object.prototype.toString.call( data ) === '[object Array]' && data.length){
			data.forEach(function(element){
				if (element){
					getDiscussionItemHtml( element, false ).inject(discussionsBox, 'bottom');
					cropProfilePictures();
				}
			});
		}
	}
	
	function formatPictureUri(uri, user_id){
		uri = (uri != undefined && uri && user_id ? 
			 '/users/picture/'+user_id+'/s/' : '/img/users-st/default50.gif'
		);
		return uri;
	}
	
	function getProfilePictureHtml(element, img_src, container_class, counter){
		if (typeof counter == 'undefined' || counter != true) counter = false;
		var prefix = (counter ? 'discussion' : 'thread')+'_';
		var img_id = prefix+'userImg'+element['id'];
		var container_id = prefix+'userImgContainer'+element['id'];
		
		return '<div id="'+container_id+'" class="avatar_container'+(container_class ? ' '+container_class : '' )+'">'
			+'<img src="'+img_src+'" class="avatar" id="'+img_id+'" alt="" />'
			+(counter ? '<div id="counter' + element['id'] + '" class="thread_counter'+(element['thread_count'] ? ' branded-bg' : ' branded-bg')+'">' + element['thread_count'] + '</div>' : '')
		+'</div>';
	}
	
	function getDiscussionItemHtml( element, effect ){
		if (effect == null || effect == undefined)
			effect = true;
		if ($('q'+element['id']))
			return '';
		
		var li = new Element('li#q'+element['id']
			+'.discussion-item'
			+(!element['thread_count'] ? '.no-thread' : '')
			+(currentUserId.split('-')[0] == element['user_id'] ? '.own-by-user' : ''),
			{'data-content': element['id'], style: (effect ? 'display:none' : '')}
		);
		var profile_picture_class = (element['user_role'] != 'insider' ? 'avatar-visitor' : 'avatar-insider') + ' left s'
			+(currentUserId.split('-')[0] == element['user_id'] ? ' branded-border' : '');

		var d = new Date(element['modified']).toISOString();
		li.set('html', '<a href="#" class="clicker">'
			+ getProfilePictureHtml(element, formatPictureUri( element['picture'], element['user_id'] ), profile_picture_class, true)
			+(moment(d).isValid() ? '<div class="date date-fromNow" data="' + d + '">' + moment( d ).fromNow() + '</div>' : '')
			+'<p><strong>' + element['full_name'] + '</strong> <span class="georgia">' + element['body'] + '</span></p>'
			+'<div class="clear"></div></a>'
		);		

		return $(li);
	}
	
	function getThreadItemHtml( element, effect ){
		if (effect == null || effect == undefined)
			effect = true;
		if ($('r'+element['id']))
			return '';
		
		var profile_picture_class = (element['user_role'] != 'insider' ? 'avatar-visitor' : 'avatar-insider') + ' left s'
			+(currentUserId.split('-')[0] == element['user_id'] ? ' branded-border' : '');
			
		var d = new Date(element['created']).toISOString();
		var li = new Element('li#r'+element['id']+'.thread-item', {'data-content': element['id'], style: (effect ? 'display:none' : '')});	
		li.set('html', ''
			+ getProfilePictureHtml(element, formatPictureUri( element['picture'], element['user_id'] ), profile_picture_class, false)
			+(moment(d).isValid() ? '<div class="date date-fromNow" data="' + d + '">' + moment( d ).fromNow() + '</div>' : '')
			+(element['user_role'] == 'insider' ? 
				'<h2 class="branded-color">' + element['full_name'] + '</h2>' 
				: 
				'<h4>' + element['full_name'] + '</h4>'
			)
			+'<p class="content">' + element['body'].replace(/\n/g, "<br />") + '</p>'
		);
		return $(li);
	}

	function selectDiscussionItem( item ){
		var thread_id = $(item).get('data-content');
		var thread_counter = $('counter' + thread_id)
		$$('.discussion-item').each(function(el){ if (el.hasClass('selected')) el.removeClass('selected') });
		item.addClass('selected');
		if (thread_counter && thread_counter.hasClass('branded-bg')){
			// Disable unread highlight
			thread_counter.removeClass('branded-bg');
		}
		socket.emit('get discussion thread', thread_id, function(data){
			if (cidCheck(data)){
				showDiscussionThread( thread_id, data.content );
				var item_thread = $('r'+thread_id).getParent('ul');
				item_thread.scrollTop = 0;
				clearTimeout(scrollTimeout);
				scrollTimeout = setTimeout(function(){ 
					new Fx.Scroll($(item_thread), { offset: {
						x: 0, 
						y: item_thread.scrollHeight
					} }).toTop();
				}, 1000);
				messageForm.getFirst('textarea').focus();
			}
		});
	}
	
	function showDiscussionThread( thread_id, elements ){
		if (instructionBox.isVisible()) { 
			instructionBox.hide(); 
			instructionBox.getFirst('h1').hide(); 
			if (instructionBox.getFirst('h2')) instructionBox.getFirst('h2').hide(); 
		}
		if (!threadBox.isVisible()) threadBox.show();
		
		threadBox.set('html', '');
		if (newThreadButton && !newThreadButton.isVisible()){
			newThreadButton.show('inline-block');
		}
		if (elements != undefined && Object.prototype.toString.call( elements ) === '[object Array]' && elements.length){
			// Populate each post into the viewer
			elements.forEach(function(element){
				if (element){
					$(getThreadItemHtml( element, false )).inject(threadBox, 'top');
					cropProfilePictures();
				}
			});
			// Linked the reply form to the thread, and adapt UI
			if (messageForm && messageForm.getFirst('textarea') && messageForm.getParent('.actions')){
				messageForm.getFirst('textarea').set('value', '').set('thread', thread_id).set('placeholder', __t('Add your message here…'));
				messageForm.getParent('.actions').getFirst('h5').set('html', __t('Add to this thread'));
				messageForm.getParent('.actions').removeClass('newQuestion');
			}
		}
		$('actionLoader').hide();
	}
	
	function discussionItemAppearingEffect( element ){
		if (!element.isVisible()){
			/*
			new Fx.Reveal($(element), {
			    duration: 'long',
			    transition: 'bounce:out',
				mode: 'vertical'
			}).reveal();
			*/
			$(element).show();
		}
	}
	
	function moveDiscussionItemToTop( element ){
		// existing left discussion item that received a reply and needs to be moved at the top of the list
		/*
		new Fx.Reveal($(element), {
		    duration: 'long',
		    transition: 'bounce:out',
			mode: 'horizontal',
			onComplete: function(){
				
				new Fx.Reveal($(element), {
				    duration: 'long',
				    transition: 'bounce:out',
					mode: 'horizontal'
				}).reveal();
			}
		}).dissolve();
*/
		$(element).hide();
		setTimeout(function(){ $(element).inject(discussionsBox, 'top'); $(element).show(); }, 100);
		
		// update the modification date to now
		var date_info = element.getFirst('.date');
		if (date_info){
			date_info.set('data', moment().format() );
			date_info.set('html', moment( date_info.get('data') ).fromNow() );
		}
	}

	function discussionsItemsSelector(){
		var discussionsFilterValue = $(discussionsFilter).get('value');
		if (discussionsFilterValue != 'all' && discussionsFilterValue != 'answered'){
			// show own discussions or unanswered ones
			$$('.discussion-item').each(function(element){ 
				if (element.hasClass( discussionsFilterValue )){
					discussionItemAppearingEffect( element );
				} 
				else element.hide();
			});
		} else if (discussionsFilterValue == 'answered'){
			// show answered ones
			$$('.discussion-item').each(function(element){ 
				if (!element.hasClass( 'no-thread' )){
					discussionItemAppearingEffect( element );
				} 
				else element.hide();
			});
		} else{
			// show all discussions
			$$('.discussion-item').each(function(element){ discussionItemAppearingEffect(element) });
		}
	}
	
	function highlightItem( element ){
		if (element == undefined)
			return;
				
		// only for left column (discussions list)
		if (element.hasClass('discussion-item')){
			if (element.getParent('ul').getElements('.discussion-item')[0] != element){
				// move if not yet on the top of the list
				moveDiscussionItemToTop( element );	
			}
		}
		
		if (!$(element).get('tween-init')){
			new Fx.Tween($(element), {
			    duration: 'long',
			    transition: 'bounce:out'
			});
			$(element).set('tween-init', true);
		}
		
		// Highligthing with a green right border effect
		element.set('style', 'border-right:0 solid #78ba91');
		element.tween('border-right-width', [0, 10]);
		setTimeout(function(){ 
			element.tween('border-right-width', [10, 0]) 
		}, 2500);
	}
	
	function playSound(type){   
		var filename = '/public/insiders-fbapp/chat-root/sound/'+type;
		$('sound').set('html', '<audio autoplay="autoplay">'
			+'<source src="' + filename + '.mp3" type="audio/mpeg" />'
			+'<source src="' + filename + '.ogg" type="audio/ogg" />'
			+'<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3" />'
		+'</audio>');
	}
	
	function cropProfilePictures(){
		$$('#contentWrap .avatar_container').each(function(pict){
			if (!pict.hasClass('js_cropped')){
				if (pict.getFirst('img.avatar')){
					crop(
						pict.get('id'), 
						pict.getFirst('img.avatar').get('id')
					);
				}
				pict.addClass('js_cropped');
			}
		})
	}
	
	// ----------------------------------------------------------------
	// Events 
	
	function initChatEvent(){
		
		// sign-in onload
		currentUserId = $(document.body).get('u-identifier');
		currentChatId = $(document.body).get('c-identifier');
		currentRole = $(document.body).get('u-type');
		
		if (currentUserId.trim() && currentChatId.trim()){
			socket.emit('new user', [currentUserId, currentChatId, ioscript_used], function(data){
				if (typeof data.cid != "undefined"){ currentCID = data.cid }
				if(data != -1 && cidCheck(data)){
					$('signInWrap').hide();
					populateDiscussionsList( data.content );
					$('contentWrap').show();
					
					setTimeout(function(){

						if ($('insiders_online') && currentRole == 'insider'){
							socket.emit('insiders-online', $('insiders_online').get('html'));
						}
						playSound('welcome');
					}, 500)
					

				} else{
					ConnectingMsgHandler.set('html', '<span class="error">'
						+(data != -1 ? __t('Sorry, an internal error occurred. Try again.') 
							: __t('A connection has already been established between the server and your account. Please wait and try again in 30s.'))
					+'</span>');
					$('ConnectingMsgHandler2').set('text', __t('Waiting for the server to be ready…'));

					clearInterval(timerInterval);
					var restartTimout = 30;
					setTimeout(function(){ initIO( ioscript_used, true ); }, (restartTimout*1000))
					setTimeout(function(){
						timerInterval = setInterval(function(){ 
							$('ConnectingMsgHandler2').set('text', (restartTimout--)+'s'); 
							if (restartTimout == 0){
								clearInterval(timerInterval);
							}
						}, 1000);
					}, 3000);
				}
			});
		}
		
		
		// insiders list update
		socket.on('insiders-online-update', function(data){
			if(cidCheck(data)){
				$('insiders_online').set('html', data.content);
			}
		});
		
		// Quit button
		if ($('closeChat')){
			$('closeChat').addEvent('click', function(e){
				e.preventDefault();
				  if (confirm($('closeChat').get('alert-data'))) {
					window.close();
					$('contentWrap').destroy();
					socket.emit('disconnect', true);
				  }
			});
		}
	
		// message submiting form
		if (messageForm){
			
			var submitMessageForm = function(e){
				e.preventDefault();
				$('actionLoader').show();
				if (!messageBox.get('value').trim()){
					return;
				}
				socket.emit('new post sent', { 
					'msg': messageBox.get('value').trim(), 
					'thread': (messageBox.get('thread') ? messageBox.get('thread') : null) 
				}, function(data){
					// play a post sound
					if (cidCheck(data) && data.content){
						playSound('post');
					}
					$('actionLoader').hide();
				});
				messageBox.set('value', '');
			}
			
			// bind the "enter" key to post the message when option enabled
			bindEnterOption.addEvent('change', function(e){
				if (bindEnterOption.checked){
					messageForm.addEvent('keydown:relay(textarea):keys(enter)', submitMessageForm);
				} else {
					messageForm.removeEvent('keydown:relay(textarea):keys(enter)', submitMessageForm)
				}
				
			});

			// always bind the ctrl-enter to post the message
			messageForm.addEvent('keydown', function(e){
				if (e.control && e.key == 'enter'){ submitMessageForm(e) }
			})

			// bind the form normal submit
			messageForm.addEvent('submit', submitMessageForm);
		}
	
		// post to remove from the dom
		socket.on('remove-item', function(data){
			if (cidCheck(data) && Object.prototype.toString.call( data ) === '[object Object]'){
				data.content.forEach(function(item){
					if ($('r'+item['id'])) {
						$('r'+item['id']).getFirst('p.content').set('html', '<span class="error">'
							+__t('The item has been removed.')
						+'</span>');
					}
					if ($('q'+item['id'])) $('q'+item['id']).destroy();

					var discussion_listed_item_counter = $('counter'+item['parent_discussion_reply_id']);
					if (discussion_listed_item_counter){
						// decrement discussion replies counter
						var new_counter_value = parseInt(discussion_listed_item_counter.get('html'))-1;
						discussion_listed_item_counter.set('html', new_counter_value);
						// add class indicating there was not yet an answer if needed
						if (!new_counter_value){
							discussion_listed_item.addClass('no-thread');
						}
					}

				})
			}
		});
		
		// receiving a general notification by the chat host(s)
		socket.on('notification', function(data){
			if (cidCheck(data) /* && data.content['user_id'] != currentUserId.split('-')[0] */){
				$('popup-box-content').set('html', '<h1>&nbsp;</h1><ul>' 
					+$(getThreadItemHtml( data.content, false )).get('html') 
				+'</ul>');
				new Fx.Reveal($('popup')).reveal();
				playSound('message');
				cropProfilePictures();
			}
		});
		
		// receiving a notification about the end of the chat
		socket.on('endchat', function(data){
			if (cidCheck(data) /* && data.content['user_id'] != currentUserId.split('-')[0] */){
				var endMsg = $('endMsg').get('html');
				$('popup-box-content').set('html', '<h1>'+__t('Thank you for your participation')+'</h1>' +endMsg);
				new Fx.Reveal($('popup')).reveal();
				playSound('message');
				$$('.whenChatEnabled').each(function(item){ item.destroy(); });
				$('endMsg').getParent('.actions').removeClass('newQuestion');
				$('endMsg').getParent('.actions').getPrevious('.instructor').addClass('chatEnded');
				$('endMsg').show();
				setTimeout(function(){
					return close_chat();
				}, 30000)
			}
		});

		// updating the online users count
		socket.on('total online users', function(data){
			if ($('total_online_users') && cidCheck(data)){
				$('total_online_users').set('html', data.content);
			}
		});
	
		
		// new discussion received
		socket.on('new discussion received', function( data ){
			if (cidCheck(data)){
				var item = getDiscussionItemHtml( data.content );
				$(item).inject(discussionsBox, 'top');
				setTimeout(function(){ 
					cropProfilePictures();
					highlightItem( item ); 
					if (data.content['user_id'] != currentUserId.split('-')[0]){
						playSound('message');
					} else {
						selectDiscussionItem( item );
					}
				}, 1750);
			}
		});
	
		// new discussion thread uniq post received
		socket.on('new thread post received', function(data){
			if (cidCheck(data)){
				data = data.content;
				// update the right container if discussion selected
				// + update the left column (discussions list)
				
				var discussion_listed_item = $('q'+data['parent_discussion_reply_id']);
				var discussion_listed_item_counter = $('counter'+data['parent_discussion_reply_id']);
				if (discussion_listed_item){

					// Visually and sound highlight for the item
					highlightItem( discussion_listed_item );
					if (data['user_id'] != currentUserId.split('-')[0]){
						playSound('message');
					}
					// remove class indicating there was not yet an answer in the discussion
					if (discussion_listed_item.hasClass('no-thread')){
						discussion_listed_item.removeClass('no-thread');
					}
					// increment discussion replies counter
					discussion_listed_item_counter.set('html', 
						parseInt(discussion_listed_item_counter.get('html'))+1
					);
					// Disable the counter highlight if thread already selected
					if (discussion_listed_item.hasClass('selected')){
						discussion_listed_item_counter.removeClass('branded-bg');
					} else {
						discussion_listed_item_counter.addClass('branded-bg');
					}
					current_thread_id = (messageBox.get('thread') ? messageBox.get('thread') : null);
					if (current_thread_id == data['parent_discussion_reply_id']){
						var el = $(getThreadItemHtml( data )).inject(threadBox, 'bottom');
						cropProfilePictures();
						setTimeout(function(){ 
							new Fx.Scroll(el.getParent('ul'), { offset: {
								x: 0, 
								y: el.getParent('ul').scrollHeight
							} }).toTop();
							setTimeout(function(){ highlightItem( el ); }, 500)
						}, 1000);	
					}
				}
			}
		});

		// all previous discussions received after signed-in
		socket.on('previous discussions', function(data){
			if (cidCheck(data)){
				populateDiscussionsList( data.content );
			}
		});
	
	
		// Event clicking on a discussion (right column)
		$(document).addEvent('click:relay( a.clicker )', function(e, item){
			$('actionLoader').show();
			selectDiscussionItem( item.getParent('.discussion-item') );
		})

		// Event when clicking on the "Ask a new question" button
		if (newThreadButton){
			newThreadButton.addEvent('click', function(e){
				if (!instructionBox.isVisible()) instructionBox.show();
				newThreadButton.hide();
				// Linked the reply form to the thread, and adapt UI
				if (currentRole == 'insider'){
					messageForm.getFirst('textarea').set('value', '').set('thread', '').set('placeholder', __t('Type your message to everyone here… (only Insiders can do that)'));
					messageForm.getParent('.actions').getFirst('h5').set('html', __t('Type your message to everyone here… (only Insiders can do that)'));
				} else {
					messageForm.getFirst('textarea').set('value', '').set('thread', '').set('placeholder', __t('Type your question here…'));
					messageForm.getParent('.actions').getFirst('h5').set('html', __t('Post your question here'));
				}
				messageForm.getParent('.actions').addClass('newQuestion');
				$$('.discussion-item').each(function(el){ if (el.hasClass('selected')) el.removeClass('selected') });
				messageForm.getFirst('textarea').focus();
			});
		}

		// Refresh all visible dates to their value from now
		setInterval(function(){
			$$('.date-fromNow').each(function(thedate){
				var d = $(thedate).get('data');
				$(thedate).set('html', moment( d ).fromNow() );
			});
		}, 60000);
		
		// make an effect to make appear new discussion items
		setInterval(function(){
			discussionsItemsSelector();
			$$('.thread-item').each(function(element){ discussionItemAppearingEffect(element) });
		}, 1000);

		// discussions filter
		$(discussionsFilter).addEvent('change', function(e){
			e.preventDefault();
			discussionsItemsSelector();
		});
		
		// receiving the fact that the server restart
		setTimeout(function(){
			socket.on('server_start', function(data){
				restart();
			});
		}, 5000);
		
		// socket has been closed
		// setTimeout(function(){
			socket.on('disconnect', function () {
				return close_chat();
			})
		// }, 2000);

		socket.on('connect_failed', function () { restart(); }) 
		socket.on('error', function () { restart(); })
		socket.on('reconnect_failed', function () { restart(); })
	}
});