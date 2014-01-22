// © 2013 - PathMotion - Career Inspiration Chat
// app_admin_ux.js - Manage the interactions with the user interface and administration tasks

// ----------------------- ONLOAD -----------------------
document.addEvent('domready', function() {
	
	function buildEditingingLink(item_id){
		var button = new Element('a.button.right.editor', {href: '#delete-'+item_id, title: __t('Delete')});
		button.set('html', '<i class="icon-remove"></i>');
		return button;
	}

	var editorTimeout;
	document.addEvent('mouseover:relay(.thread-item)', function(e, item){
		if (!item.hasClass('editor_enabled')){
			buildEditingingLink(item.get('data-content')).inject(item.getFirst('p.content'), 'bottom');
			item.addClass('editor_enabled');
		}
		if (item.getFirst('p.content') && item.getFirst('p.content').getFirst('.editor'))
			item.getFirst('p.content').getFirst('.editor').show();
	});
	
	document.addEvent('mouseout:relay(.thread-item)', function(e, item){
		if (item.getFirst('p.content') && item.getFirst('p.content').getFirst('.editor')){
			item.getFirst('p.content').getFirst('.editor').hide();
		}
	})
	
	document.addEvent('click:relay(a.editor)', function(e, item){
		e.preventDefault();
		if (confirm(__t('Are you sure you want to delete?'))){
			socket.emit('delete-request', item.getParent('.thread-item').get('data-content'), function(data){
				if (!data){
					alert(__t('Sorry, an internal error occurred. Try again.'))
				}
			})
		}
	})
	
	// End button
	if ($('endChat')){
		$('endChat').addEvent('click', function(e){
			e.preventDefault();
			  if (confirm($('endChat').get('alert-data'))) {
				socket.emit('endchat', true);
				$('endChat').hide();
				$('closeChat').show();
			  }
		});
	}
	
	/*
	function ajaxifyPopupItems(){
		$('popup-box-content').getElements('a').each(function(item){ item.addClass('popup-ajax'); console.log("addClass('popup-ajax')")})
		$('popup-box-content').getElements('form').each(function(item){ item.addClass('ajax-form'); console.log("addClass('ajax-form')")})
	}
	document.addEvent('click:relay(.editor a)', function(e, item){
		setTimeout(function(){
			if ($('popup-box-content') && $('popup-box-content').get('html')){
				ajaxifyPopupItems();
				console.log('ajaxifyPopupItems')
			}
		}, 2000);
	})
	*/
});