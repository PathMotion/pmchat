/**
** PM CHAT for Career Inspiration app - v0.10
** nassim@pathmotion.com - 2013-2014
**
** TODOs
	- check if multiple chats can be managed using io namespsaces (see: https://groups.google.com/forum/#!searchin/socket_io/namespace/socket_io/dqpWtO8ZoAU/gGBIf-155msJ)
	- Disconnect or block all clients to prevent them to do SQL queries while it is disconnected (on handleDisconnect() failure)
	- analyse if could be better to identify user with session - example: http://howtonode.org/socket-io-auth
	- √ does not store user data into the socket (allowing to retrieve their data if the reconnect on a new socket) - DONE (now stored in var users={})
**/

var config = require('./config'),
	io = require('socket.io').listen( config.port, { 
		'log': false,
		'heartbeat timeout': 30,
		'heartbeat interval': 25,
		'close timeout': 25,
		'browser client minification': true,
		'browser client etag': true,
		'browser client gzip': true,
		'match origin protocol': true,
		'transports': ['xhr-polling']
	} ),
	cookie = require("cookie"),
	mysql = require("mysql"),
	moment = require('moment'),
	cheerio = require('cheerio'),
	users = {}, users_ids = {},
	discussionsList = {},
	discussionsThreadList = [],
	myCheerioDom = null,
	serverLaunchTime = new Date().getTime()
	adminLock = false;

io.setMaxListeners(0);
io.sockets.setMaxListeners(0);

function handleDisconnect() {

	connection = mysql.createConnection( config.database ); 

	connection.connect(function(err) { 
		if(err) {
			console.log('!!! Error when connecting to db:', err);
			// TODO: disconnect or block all clients to prevent them to do SQL queries while it is disconnected
			setTimeout(handleDisconnect, 2000);
		}
	});

	connection.on('error', function(err) {
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
			handleDisconnect();
		} else {
			console.log('!!! DB error', err);
			throw err;
		}
	});
}
handleDisconnect();

function _log(str, sessionID){
	var connected_user_nb = '?';
	if (typeof users[ sessionID ] != "undefined" && typeof users[ sessionID ].chatDiscussionId != "undefined")
		connected_user_nb = Object.keys(users_ids[ users[ sessionID ].chatDiscussionId ]).length;
	console.log(moment().format('YYYY-M-D H:mm:ss') 
		+(users[ sessionID ] && users[ sessionID ].socket ? "\tsocket#" + users[ sessionID ].socket.id : '') 
		+ (typeof sessionID != "undefined" ? "\tsession#" + sessionID : '')
		+ "\t"+(users[ sessionID ] && users[ sessionID ].kinfOfAccess != "undefined" ? users[ sessionID ].kinfOfAccess : 'unknown_io')
		+(users[ sessionID ] && users[ sessionID ].chatId ? "-chat#" + users[ sessionID ].chatId : '') 
		+"-nb_user("+connected_user_nb+")"
		+(users[ sessionID ] && users[ sessionID ].user_id ? "\tuser#" + users[ sessionID ].user_id 
			+ '-('+users[ sessionID ].user['full_name']+')' : '') 
		+ "\t" + str
	);
}

function getQueryVariable(uri, variable){
	if (uri){
       var vars = uri.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
	}
	return(false);
}

function getPmCookie(handshakeData){
	var complement = '';
	if (handshakeData.headers.cookie) {
		handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
		var simulatedUser = getQueryVariable(handshakeData.headers.referer, 'simulatedUser');
		if (simulatedUser){
			complement = '-'+simulatedUser;
		}
		if (handshakeData.cookie[ config.cookieName ]){
		    return handshakeData.cookie[ config.cookieName ]+complement;
		} 
  } 
  return false;
}

function is_numeric (mixed_var) {
  return (typeof mixed_var === 'number' || typeof mixed_var === 'string') && mixed_var !== '' && !isNaN(mixed_var);
}

Array.prototype.swapToTop = function(old_index) {
    if (0 >= this.length) {
        var k = 0 - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(0, 0, this.splice(old_index, 1)[0]);
};

function checkChatDiscussion(_chatId, _chatDiscussionId){

	if (discussionsList[ _chatDiscussionId ] == null){
		
		// Query the database to grab previous discussions for the specified chat
		connection.query('SELECT CONCAT(User.firstname," ",SUBSTR(User.lastname, 1, 1),".") AS full_name, '
				+' User.picture, DiscussionsChatsUser.type AS user_role, '
				+' DiscussionsReply.id, DiscussionsReply.discussion_id, DiscussionsReply.parent_discussion_reply_id, '
				+' DiscussionsReply.body, DiscussionsReply.user_id, DiscussionsReply.thread_count, '
				+' DiscussionsReply.modified, DiscussionsReply.created '
			+' FROM fbpages_discussions_replies AS DiscussionsReply '
			+' INNER JOIN users AS User ON DiscussionsReply.user_id = User.id '
			+' INNER JOIN fbpages_discussions_chats_users AS DiscussionsChatsUser ON '
				+' (DiscussionsChatsUser.user_id = User.id AND DiscussionsChatsUser.discussion_chat_id = '+_chatId+') '
			+' WHERE status IN ("ham","clean") '
				+' AND DiscussionsReply.parent_discussion_reply_id IS NULL '
				+' AND DiscussionsReply.discussion_id = '+_chatDiscussionId
			+' ORDER BY DiscussionsReply.modified DESC', function (error, rows, fields) { 
				if (error) { console.log(error); return; }
				discussionsList[ _chatDiscussionId ] = rows;
				
				rows = null; delete rows;

				console.log('*** Chat(s) currently opened: '+Object.keys(discussionsList).length+' ***');
				return true;
		});
		
		if (users_ids[ _chatDiscussionId ] == null){
			// init the visitors container for this chat
			users_ids[ _chatDiscussionId ] = {};
		}
		return false;
	}
	return true;
}

function removeItemsFromCache(deleted_items, sessionID){
	// deleted_items = {id, parent_discussion_reply_id}
	if (deleted_items){
		deleted_items.forEach(function(item){
		
			// if initial deleted item is a first level discussion, delete the all cache stacks linked.
			if (Object.prototype.toString.call( discussionsThreadList[ item['id'] ] ) === '[object Array]'){
				_log('Deleting first level discussion item ('+item['id']+')', sessionID);
				discussionsThreadList[ item['id'] ] = null; delete discussionsThreadList[ item['id'] ];
				discussionsList[ users[ sessionID ].chatDiscussionId ].forEach(function(item_cached, index, theArray){
					if (item_cached['id'] == item['id']){
						discussionsList[ users[ sessionID ].chatDiscussionId ][index] = null;
						delete discussionsList[ users[ sessionID ].chatDiscussionId ][index];
					}
				});
			}
			
			// if initial deleted item is just a sub-reply, search it in cache to remove it
			if (Object.prototype.toString.call( discussionsThreadList[ item['parent_discussion_reply_id'] ] ) === '[object Array]'){
				_log('Deleting sub-reply item ('+item['id']+') from the cache stack ('+item['parent_discussion_reply_id']+').', sessionID);
				discussionsThreadList[ item['parent_discussion_reply_id'] ].forEach(function(item_cached, index, theArray){
					if (item_cached['id'] == item['id']){
						discussionsThreadList[ item['parent_discussion_reply_id'] ][index] = null;
						delete discussionsThreadList[ item['parent_discussion_reply_id'] ][index];
					}
				});

				// and then update the root discussion thread count
				for (var i=0; discussionsList[ users[ sessionID ].chatDiscussionId ][i]; i++)
					discussionsList[ users[ sessionID ].chatDiscussionId ].forEach(function(item_cached, index, theArray){
					if (item_cached['id'] == item['parent_discussion_reply_id']){
						discussionsList[ users[ sessionID ].chatDiscussionId ][index]['thread_count'] -= 1;
					}
				});
			}
		});
		deleted_items = null; delete deleted_items;
	}
}

function garbadgeChat( chat_id ){
	console.log('*** Processing the chat garbadge collect... ***');
	if (Object.prototype.toString.call( discussionsList[ chat_id ] ) === '[object Array]'){
		discussionsList[ chat_id ].forEach(function( discussion ){
			if (Object.prototype.toString.call( discussionsThreadList[ discussion['id'] ] ) === '[object Array]')
				discussionsThreadList[ discussion['id'] ] = null; delete discussionsThreadList[ discussion['id'] ];
				// _log('Deleting thread link to discussion #'+discussion['id'] , sessionID);
		});
	}
	discussionsList[ chat_id ] = null; delete discussionsList[ chat_id ];
	console.log('Chat(s) still cached: ' + Object.keys( discussionsList ).length);
	console.log('Chat(s) thread still cached: ' + Object.keys( discussionsThreadList ).length)
	console.log('*** The chat garbadge collect completed. ***');
}

var server_start = true;
if (server_start){
	// emit a global signal to potential connected client that the server re(start)
	io.sockets.emit('server_start', true);
	server_start = false;
	// 
	connection.query('UPDATE fbpages_discussions_chats_users '
		+' SET disconnect_date = NOW() '
		+' WHERE connect_date IS NOT NULL AND disconnect_date IS NULL', [], function(err, info) {}
	);
}	

io.sockets.on('connection', function(socket){	

	// a user here will be identified as uniq throw their session identifier
	var sessionID = getPmCookie( socket.handshake );
	_log('New connection identified with the session', sessionID);

	// check if previous data linked to this sessionID
	if (users[ sessionID ] && users[ sessionID ].chatId &&  users[ sessionID ].chatDiscussionId){
			if (users[ sessionID ] && users[ sessionID ].socket && users[ sessionID ].socket.id !== socket.id){
				// a previous socket was used for the same user, so close it before linking the new one.
				_log('alive (on a new socket)', sessionID);
				users[ sessionID ].socket.disconnect();
				
				// linking the socket to the user
				users[ sessionID ].socket = socket;
			 
				checkChatDiscussion(users[ sessionID ].chatId, users[ sessionID ].chatDiscussionId);
				if (typeof users_ids[ users[ sessionID ].chatDiscussionId ][ sessionID ] == "undefined"){
					// user might have been unexpectedly disconnected
					// so increment the connect attempt counter and set the disconnect date to null in database
						connection.query('UPDATE fbpages_discussions_chats_users '
							+' SET disconnect_date = NULL, connect_attempted = (connect_attempted + 1) '
							+' WHERE discussion_chat_id = ? AND user_id = ?', 
							[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {}
						);
				}
				users_ids[ users[ sessionID ].chatDiscussionId ][ sessionID ] = true;
				// update the users count for every clients connected			
				var connected_user_nb = Object.keys(users_ids[ users[ sessionID ].chatDiscussionId ]).length;
				io.sockets.emit('total online users', signEmitData( connected_user_nb ));
				//_log('Number of users currently connected to the chat: '+connected_user_nb);	

				check_online_insiders();
			}
	}
	/*
	if (users[ sessionID ] && users[ sessionID ].socket){
		// a previous socket was used for the same user, so close it before linking the new one.
//		_log('Closing previous socket opened for this session', sessionID);
//		users[ sessionID ].socket.disconnect();
		if (users[ sessionID ].chatId && users[ sessionID ].chatDiscussionId){
			checkChatDiscussion( users[ sessionID ].chatId, users[ sessionID ].chatDiscussionId );
		}
	}
	*/


	// linking the socket to the user
	if (typeof users[ sessionID ] == "undefined"){
		users[ sessionID ] = {};
	}
	users[ sessionID ].socket = socket;

	// ********** // ********** // ********** // ********** //
	// ************  REQUESTS USEFUL FUNCTIONS ************ //
	// ********** // ********** // ********** // ********** //

	function simulateMsgObject( msg, insertId, thread_id ){
		return {
			'id': insertId ? insertId : '', 
			'discussion_id': users[ sessionID ].chatDiscussionId,
			'parent_discussion_reply_id': thread_id ? thread_id : '',
			'user_id': users[ sessionID ].user_id,
			'user_role': users[ sessionID ].user_role,
			'full_name': users[ sessionID ].user['full_name'], 
			'picture': users[ sessionID ].user['picture'], 
			'thread_count': 0, 
			'created': moment().format('YYYY-M-D H:mm:ss'),
			'modified': moment().format('YYYY-M-D H:mm:ss'),
			'body': msg
		};
	}
	
	function signEmitData(data){
		// the cid is here to let the client know if a message is for him or not.
		// because when many different chats are running at the same time, everyones will receive emit()
		return {
			chat: users[ sessionID ].chatId+'-'+users[ sessionID ].chatDiscussionId,
			cid: (serverLaunchTime * users[ sessionID ].chatDiscussionId),
			content: data
		};
	}
	
	function checkSocketIntegrity(callback){
		if (users[ sessionID ] && !users[ sessionID ].user_id){
			_log('Zombie detected.', sessionID);
			if (typeof callback === 'function'){
				callback('server_start');
			}
			// io.sockets.emit('server_start', true ); 
			return false;
		}
		if (users[ sessionID ].chatId && users[ sessionID ].chatDiscussionId){
			checkChatDiscussion( users[ sessionID ].chatId, users[ sessionID ].chatDiscussionId );
		}
		check_online_insiders();
		return true;
	}

	function check_online_insiders(){
		// updating insiders list if this user was an insider
		if (typeof users[ sessionID ].insider_html_identity != "undefined" 
			&& myCheerioDom && !myCheerioDom('#'+users[ sessionID ].user_id).html())
		{
			_log('Updating online insiders (+1 - reconnect)...');
			myCheerioDom('ul').append( users[ sessionID ].insider_html_identity );
			myCheerioDom('span.counter').html( parseInt( myCheerioDom('span.counter').html() )+1 );
			io.sockets.emit('insiders-online-update', signEmitData( myCheerioDom.html() ));		
			// log the connection datetime
			connection.query('UPDATE fbpages_discussions_chats_users '
				+' SET disconnect_date = NULL '
				+' WHERE discussion_chat_id = ? AND user_id =  ?', 
				[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {});
		}
	}

	// ********** // ********** // ********** // ********** //
	// ************ GENERAL REQUESTS AVAILABLE ************ //
	// ********** // ********** // ********** // ********** //
	
	
	// When a new user connection has been received
	socket.on('new user', function(user_data, callback){
		/*
		handshake = socket.handshake
		address   = handshake.address.address
		referer   = handshake.headers.referer
		userAgent = handshake.headers['user-agent']
		
		console.log(
			"\n --------------------------- \n"
			+'New user atempts with: ' + sessionID
			+"\n"+user_data[0]+' | '+user_data[1]
			+"\nreferer: "+referer
			+"\naddress: "+address
			+"\nuserAgent: "+userAgent
			+"\n --------------------------- \n"
		);
		*/
		var user_identifer = user_data[0].split('-'); /* {user_id}-{securitykey} => if does not match to DB = corrupt call */
		var chat_identifier = user_data[1].split('-'); /* {chat_id}-{discussion_id} => if does not match to DB = corrupt call */
		users[ sessionID ].kinfOfAccess = (user_data[2] == 0 ? 'direct_io' : 'proxy_io');
		if (user_identifer.length != 2 || chat_identifier.length != 2) {
			callback( false ); return;
		}
		var user_id = user_identifer[0].trim();
		var user_securitykey = user_identifer[1].trim();
		
		checkChatDiscussion( chat_identifier[0], chat_identifier[1] )
				
		if (!is_numeric(user_id) || user_id in users_ids[ chat_identifier[1] ] ){
			callback( (user_id in users_ids[ chat_identifier[1] ] ? -1 : false) );
			_log('New user log request failed: '+user_identifer[0]+' / '+user_identifer[1], sessionID);
			return;
		} else {
			connection.query('SELECT User.id, CONCAT(User.firstname," ",SUBSTR(User.lastname, 1, 1),".") AS full_name, '
					+' User.picture, DiscussionsChatsUser.type AS user_role '
				+' FROM users AS User '
				+' INNER JOIN fbpages_discussions_chats_users AS DiscussionsChatsUser ON DiscussionsChatsUser.user_id = User.id '
				+' WHERE DiscussionsChatsUser.discussion_chat_id = ' + chat_identifier[0] 
					+' AND User.id = ' + user_id
					/*+' AND User.securitykey = "' + user_securitykey + '"'*/, function (error, rows, fields) { 
					
					if (error || !rows[0]) { callback( false ); _log('QUERY ERROR:'+"\n"
					+'SELECT User.id, CONCAT(User.firstname," ",SUBSTR(User.lastname, 1, 1),".") AS full_name, '
							+' User.picture, DiscussionsChatsUser.type AS user_role '
						+' FROM users AS User '
						+' INNER JOIN fbpages_discussions_chats_users AS DiscussionsChatsUser ON DiscussionsChatsUser.user_id = User.id '
						+' WHERE DiscussionsChatsUser.discussion_chat_id = ' + chat_identifier[0] 
							+' AND User.id = ' + user_id
							/*+' AND User.securitykey = "' + user_securitykey + '"'*/
					+"\n", sessionID); return; }

					users[ sessionID ].user_id = user_id;
					users[ sessionID ].chatId = chat_identifier[0];
					users[ sessionID ].chatDiscussionId = chat_identifier[1];
					users[ sessionID ].user = rows[0];
					users[ sessionID ].user_role = rows[0]['user_role'];
					users_ids[ users[ sessionID ].chatDiscussionId ][ sessionID ] = true;
					rows = null; delete rows;
					// send the discussionsList to the new user
					callback( signEmitData(discussionsList[ users[ sessionID ].chatDiscussionId ]) );	
					
					// update the users count for every clients connected
					io.sockets.emit('total online users', signEmitData(Object.keys(users_ids[ users[ sessionID ].chatDiscussionId ]).length));
					
					_log('New user log succeed: #'+users[ sessionID ].user_id+' ('+users[ sessionID ].user['full_name']+' - '+users[ sessionID ].user_role+')', sessionID);
					// log the connection datetime
					connection.query('UPDATE fbpages_discussions_chats_users '
						+' SET connect_date = NOW(), disconnect_date = NULL '
						+' WHERE connect_date IS NULL AND discussion_chat_id = ? AND user_id =  ?', 
						[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {}
					);
					// increment the connect attempt counter
					connection.query('UPDATE fbpages_discussions_chats_users '
						+' SET disconnect_date = NULL, connect_attempted = (connect_attempted + 1) '
						+' WHERE discussion_chat_id = ? AND user_id = ?', 
						[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {}
					);
						
			});
		}
	});

	// When a new post (= an insider notification, a user question or a thread's reply) has been sent
	socket.on('new post sent', function(data, callback){
		
		if (!checkSocketIntegrity(callback))
			return;
		
		var msg = data['msg'].trim();
		var thread_id = is_numeric(data['thread']) && data['thread'] != 0 ? data['thread'] : '';
		if (!msg || (!thread_id && msg.length < 5) || (thread_id && msg.length < 2)){
			callback( false ); return;
		}
		
		// insider notification to broadcast to everybody
		if (!thread_id && users[ sessionID ].user_role == 'insider'){
			io.sockets.emit('notification', signEmitData( simulateMsgObject( msg ) ));
			callback( true ); return;
		}
		
		// Saving in database: if no thread_id { first level post } else { sub-reply }
		connection.query(''
			+' INSERT INTO fbpages_discussions_replies (discussion_id, '
				+(thread_id ? 'parent_discussion_reply_id, ' : '')
				+'body, user_id, modified, created) '
			+' VALUES (?, '+(thread_id ? '?, ' : '')+'?, ?, NOW(), NOW())', 
			(thread_id ? [users[ sessionID ].chatDiscussionId, thread_id, msg, users[ sessionID ].user_id] : [users[ sessionID ].chatDiscussionId, msg, users[ sessionID ].user_id]), 
			function(err, info) {
				if (err) { callback( false ); return; }

				_log('New post from #'+users[ sessionID ].user_id+' ('+users[ sessionID ].user['full_name']+') saved as #'+info.insertId, sessionID);
				callback( signEmitData(thread_id ? thread_id : info.insertId) )
			
				// update the root discussion thread_count
				connection.query('UPDATE fbpages_discussions '
					+' SET thread_count = (thread_count + 1), modified=NOW() '
					+' WHERE id = ?', 
					[users[ sessionID ].chatDiscussionId], function(err, info){}
				);

				var tmp = simulateMsgObject( msg, info.insertId, thread_id );

				if (!is_numeric(thread_id) || thread_id == 0){
					// new discussion (= first level post)
					discussionsList[ users[ sessionID ].chatDiscussionId ].splice(0,0,tmp);
					io.sockets.emit('new discussion received', signEmitData(tmp));
					// increment the discussions posted counter
					connection.query('UPDATE fbpages_discussions_chats_users '
						+' SET discussions_posted = (discussions_posted + 1) '
						+' WHERE discussion_chat_id = ? AND user_id = ?', 
						[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {});
				} 
				else{
					// new post into an existing discussion (= sub-reply)
					if (discussionsThreadList[ thread_id ] == null || discussionsThreadList[ thread_id ] == undefined){
						_log(thread_id +' does not exist yet in the cache.', sessionID);
						discussionsThreadList[ thread_id ] = new Array();
					} 
					discussionsThreadList[ thread_id ].unshift(tmp);
					io.sockets.emit('new thread post received', signEmitData(tmp));

										
					// Update the discussionsList order by putting this item on top
					for (var i = 0; discussionsList[ users[ sessionID ].chatDiscussionId ][i]; i++){
						if (discussionsList[ users[ sessionID ].chatDiscussionId ][i]['id'] == thread_id){
							discussionsList[ users[ sessionID ].chatDiscussionId ][i]['modified'] = moment().format('YYYY-M-D H:mm:ss');
							discussionsList[ users[ sessionID ].chatDiscussionId ].swapToTop(i);
							break;
						}
					}
					
					// update the root discussion_reply thread_count
					connection.query('UPDATE fbpages_discussions_replies '
						+' SET thread_count = (thread_count + 1), modified=NOW() '
						+' WHERE id = ?', 
						[thread_id], function(err, info){}
					);
					// increment the replies posted counter
					connection.query('UPDATE fbpages_discussions_chats_users '
						+' SET replies_posted = (replies_posted + 1) '
						+' WHERE discussion_chat_id = ? AND user_id = ?', 
						[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {}
					);
					// and then update the root discussion thread count in the cache
					for (var i=0; discussionsList[ users[ sessionID ].chatDiscussionId ][i]; i++){
						if (discussionsList[ users[ sessionID ].chatDiscussionId ][i]['id'] == thread_id){
							discussionsList[ users[ sessionID ].chatDiscussionId ][i]['thread_count'] += 1;
						}
					}
				}
				tmp = null; delete tmp;
		  });

	});
	
	// When a discussion has been clicked to show the thread
	socket.on('get discussion thread', function(data, callback){
		
		if (!checkSocketIntegrity(callback))
			return;
			
		var discussion_reply_id = data.trim();
		if (!is_numeric(discussion_reply_id)) { callback( false ); return; }
		
		_log('Discussion #'+discussion_reply_id+' opened by #'+users[ sessionID ].user_id+' ('+users[ sessionID ].user['full_name']+').', sessionID)		
		
		if (discussion_reply_id in discussionsThreadList){
			// already cached
			callback( signEmitData(discussionsThreadList[ discussion_reply_id ]) );
		} 
		else {
			// Not cached, so grab content in database and then store it
			connection.query('SELECT CONCAT(User.firstname," ",SUBSTR(User.lastname, 1, 1),".") AS full_name, '
					+' User.picture, DiscussionsChatsUser.type AS user_role, '
					+' DiscussionsReply.id, DiscussionsReply.body, DiscussionsReply.user_id, '
					+' DiscussionsReply.thread_count, DiscussionsReply.created '
				+' FROM fbpages_discussions_replies AS DiscussionsReply '
				+' INNER JOIN users AS User ON DiscussionsReply.user_id = User.id '
				+' INNER JOIN fbpages_discussions_chats_users AS DiscussionsChatsUser '
					+' ON (DiscussionsChatsUser.user_id = User.id AND DiscussionsChatsUser.discussion_chat_id = ' + users[ sessionID ].chatId+') '
				+' WHERE status IN ("ham","clean") '
					+' AND DiscussionsReply.discussion_id = '+users[ sessionID ].chatDiscussionId
					+' AND ( '
						+' DiscussionsReply.id = '+discussion_reply_id
						+' OR DiscussionsReply.parent_discussion_reply_id = '+discussion_reply_id
					+' )'
				+' ORDER BY DiscussionsReply.created DESC', function (error, rows, fields) { 

					if (error) { callback( false ); return; }
					callback( signEmitData(rows) );
					discussionsThreadList[ discussion_reply_id ] = rows;
					rows = null; delete rows;
			});
		}
		
		// increment the discussions opened counter
		connection.query('UPDATE fbpages_discussions_chats_users '
			+' SET discussions_opened = (discussions_opened + 1) '
			+' WHERE discussion_chat_id = ? AND user_id = ?', 
			[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {});
	});
	
	// Update insiders list
	socket.on('insiders-online', function(data){
		_log('Updating online insiders (+1)...');
		myCheerioDom = cheerio.load(data);
		io.sockets.emit('insiders-online-update', signEmitData( myCheerioDom.html() ));
	});
	
	// When a client disconnect
	
	socket.on('disconnect', function(data){
		if(!users[ sessionID ].user_id) {
			_log('Disconnect from anon socket !!!', sessionID);
			socket = null; delete socket;
			return;
		}
		_log('Disconnect #'+users[ sessionID ].user_id+' ('+users[ sessionID ].user['full_name']+' - '+users[ sessionID ].user_role+')', sessionID);
		
		// if insider update online list
		if (users[ sessionID ].user_role == 'insider'){
			// insidersOnline.removeChild(insidersOnline.getElementById(users[ sessionID ].user_id));
			if (myCheerioDom && myCheerioDom('#'+users[ sessionID ].user_id)) {
				users[ sessionID ].insider_html_identity = myCheerioDom('#'+users[ sessionID ].user_id);
				myCheerioDom('#'+users[ sessionID ].user_id).remove();
				myCheerioDom('span.counter').html( parseInt( myCheerioDom('span.counter').html() )-1 );

				_log('Updating online insiders (-1)...');
				io.sockets.emit('insiders-online-update', signEmitData( myCheerioDom.html() ));
			}
		}
		
		// log the connection datetime
		connection.query('UPDATE fbpages_discussions_chats_users '
			+' SET disconnect_date = NOW() '
			+' WHERE discussion_chat_id = ? AND user_id =  ?', 
			[users[ sessionID ].chatId, users[ sessionID ].user_id], function(err, info) {});
		
		// update the online users counter
		delete users_ids[ users[ sessionID ].chatDiscussionId ][ sessionID ];
		
		var connected_user_nb = Object.keys(users_ids[ users[ sessionID ].chatDiscussionId ]).length;
		io.sockets.emit('total online users', signEmitData( connected_user_nb ));
		//_log('Number of users currently connected to the chat: '+connected_user_nb, sessionID);
		
		// garbadge the chat if no user connected into a chat
		if (!connected_user_nb){			
			garbadgeChat( users[ sessionID ].chatDiscussionId );
		}
		
		socket = null; delete socket;
	});
	
	
	// ********** // ********** // ********** // ********** // ********** //
	// ********** ADMINISTRATION REQUEST AVAILABLE FOR HOST(s) ********** //
	// ********** // ********** // ********** // ********** // ********** //
	
	socket.on('endchat', function(data, callback){
		if (!checkSocketIntegrity(callback) || adminLock === true)
			return;

		adminLock = true;
		_log('*** End chat request ***', sessionID);	
		if (users[ sessionID ].user_role != 'insider'){
			callback( false ); return;
		}
		connection.query('UPDATE fbpages_discussions_chats '
			+' SET end_date=DATE_SUB(NOW(), INTERVAL 1 HOUR) '
			+' WHERE id = '+users[ sessionID ].chatId, 
			function (error, rows, fields) {
				if (error) { callback( false ); return; }
				io.sockets.emit('endchat', signEmitData(true));
			})
		setTimeout(function(){ adminLock = false; }, 2000);
	});
	
	// request to delete a post
	socket.on('delete-request', function(item_id, callback){

		if (!checkSocketIntegrity(callback) || adminLock === true)
			return;
		
		adminLock = true;
		if (users[ sessionID ].user_role != 'insider'){
			callback( false ); return;
		}
		connection.query('SELECT DiscussionsReply.id, DiscussionsReply.parent_discussion_reply_id'
			+' FROM fbpages_discussions_replies AS DiscussionsReply '
			+' WHERE status IN ("ham","clean") '
			+' AND DiscussionsReply.discussion_id = '+users[ sessionID ].chatDiscussionId
			+' AND ( DiscussionsReply.id = '+item_id+' OR DiscussionsReply.parent_discussion_reply_id = '+item_id+' )', 
			function (error, deleted_items, fields) { 

				if (error || !deleted_items.length) { callback( false ); return; }
				
				connection.query('UPDATE fbpages_discussions_replies '
					+' SET status="deleted" '
					+' WHERE status IN ("ham","clean") '
					+' AND discussion_id = '+users[ sessionID ].chatDiscussionId
					+' AND ( id = '+item_id+' OR parent_discussion_reply_id = '+item_id+' )', 
					function (error, rows, fields) {

						if (error) { callback( false ); return; }
						
						removeItemsFromCache( deleted_items, sessionID );
						io.sockets.emit('remove-item', signEmitData(deleted_items));
						
						// update the root discussion thread_count
						connection.query('UPDATE fbpages_discussions '
							+' SET thread_count = (thread_count - ' + deleted_items.length + '), modified=NOW() '
							+' WHERE id = ?', 
							[users[ sessionID ].chatDiscussionId], function(err, info){}
						);
						if (deleted_items.length == 1 && deleted_items[0]['parent_discussion_reply_id']){
							// update the parent discussion reply thread_count
							connection.query('UPDATE fbpages_discussions_replies '
								+' SET thread_count = (thread_count - 1), modified=NOW() '
								+' WHERE id = ?', 
								[deleted_items[0]['parent_discussion_reply_id']
								], function(err, info){}
							);
						}
					}
				);
		});
		setTimeout(function(){ callback( true ); adminLock = false; }, 2000);
	})
});