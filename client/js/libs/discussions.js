function getOffset( el ) {
    var _x = 0,
    _y = 0;
    while( el && el.tagName.toLowerCase() != 'body' && !isNaN( el.offsetLeft ) && !isNaN(el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
function d_trim(myString) { if (myString == undefined) return false; return myString.replace(/^\s+/g,'').replace(/\s+$/g,''); }
function d_charCounter(textareaClass, cntfieldClass, decreasing){
	if (!decreasing || decreasing != true){
		decreasing = false;
	}
	$$('.'+textareaClass).each(function(field){
		var limit = field.get('maxlength');
		if (limit){
			var chars = d_trim(field.value).length;
			field.getNext('.'+cntfieldClass).getFirst('span').innerHTML = (!decreasing ? chars : (limit - chars));
			
			field.addEvent('keyup', function(e){
				var chars = d_trim(field.value).length;
				field.getNext('.'+cntfieldClass).getFirst('span').innerHTML = (!decreasing ? chars : (limit - chars));
			});
		}
	});
}
function d_popupAjax(link){
	$('popup-box-content').set('html', '');
	new Fx.Reveal($('popup')).reveal();

	var img_url_pattern = new RegExp("\.(jpe?g|gif|png)[^a-z]", 'i');
	if (img_url_pattern.test(link.get('href'))==true){
		var picture = new Element('img', {'src': link.get('href'), 'style': 'width:100%;'});
		picture.inject($('popup-box-content'));
	} 
	else{
		var params_url_pattern = new RegExp("([a-z0-9]+\:[a-z0-9]+)+", 'i');
		new Request.HTML({
			url: link.get('href')+(!params_url_pattern.test(link.get('href')) ? '?' : '/')+(new Date().getTime()),
			update: $('popup-box-content'),
			asynchronous:'true', evalScripts:'true',
			onRequest: function(){
				if (typeof FB != 'undefined')
					FB.Canvas.scrollTo(0,0);
			},
			onFailure: function(){
				$('popup-box-content').set('text', 'Sorry, your request failed.');
			},
			onSuccess: function(){ 
				if (link.hasClass('reload-on-close')){
					$('popup-box-header').addClass('reload');
				}
			}
		}).send();
	}
}

function openChatWindow(chatid, fbpageid, u, k){
	window.open(
		'//'+window.location.hostname+'/app/discussions/chat/access/'+chatid+'?fb_fan_page_id='+fbpageid+'&u='+u+'&k='+k,
		'pmchat'+chatid,
		'width='+screen.availWidth+',height='+screen.availHeight+',directories=no,'
		+'titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes'
	);
}

// ***************************************************************************************** //

function d_init_js(){
	// $$('.sub-replies').each(function(subReplies){subReplies.hide()});
	// if ($$('.sub-replies')[0]) $$('.sub-replies')[0].show();

	$$('.reactions-toggler').each(function(link){
		link.addEvent('click', function(e){
			e.preventDefault();
			new Fx.Reveal(link.getParent().getNext('.sub-replies'), {
				onComplete: function(){
					/*
					if (link.getParent().getNext('.sub-replies').isVisible()
						&& !link.getParent().getNext('.reply-form').isVisible()){
							link.getParent().getFirst('.reply-toggler').click();
					}
					*/
				}
			}).toggle();
			link.toggleClass('on');
			link.getParent().getNext('.sub-replies').getElements('.reactions-toggler').each(function(sublink){sublink.click()})
		});
	})

	$$('.reply-toggler').each(function(link){
		link.addEvent('click', function(e){
			e.preventDefault();
			new Fx.Reveal(link.getParent().getNext('.reply-form'), {
				onComplete: function(){
					if (link.getParent().getNext('.reply-form').isVisible()){
						link.getParent().getNext('.reply-form').getElement('textarea').focus();
					} else{
						link.getParent().getNext('.reply-form').getElement('textarea').blur();
					}
				}
			}).toggle();
		})
	})

	$$('.d-form-question.collapsed .d-inputs .d-i-title').each(function(input){
		input.addEvent('focus', function(e){
			input.getParent('.d-form-question').removeClass('collapsed');
			input.set('placeholder', input.get('focus-placeholder'));
			if (input.getNext('.d-i-title-counter')) input.getNext('.d-i-title-counter').show();
		})
		input.addEvent('blur', function(e){
			input.value = d_trim(input.value);
			if (!input.value){
				input.getParent('.d-form-question').addClass('collapsed');
				input.set('placeholder', input.get('blur-placeholder'));
			}
			if (input.getNext('.d-i-title-counter')) input.getNext('.d-i-title-counter').hide();
		})
	})
	
	// adding a class with the number of radio groups present (1, 2 or 3) being able to style the max-width
	if ($$('.d-form-question .d-radio-group').length >= 3){
		$$('.d-form-question .d-radio-group').each(function(radio_group){
				radio_group.addClass('ter');
		});
	}
	
	// targeting form (see question-form.ctp)
	$$('.d-form-question .d-targeting').each(function(target_area) {
		
		var radios = target_area.getElements('input[type=radio]');
		
		// init the radios
		var first = true;
		radios.each(function(radio) {
			radio.set('checked', first);
			var nav = radio.getNext('nav.filter');
			if(nav) {
				if(first) {
					nav.removeClass('disabled').getFirst('input').set('disabled', false);
				} else {
					nav.addClass('disabled').getFirst('input').set('disabled', true);
				}
			}
			first = false;
		});
		
		// radios don't share the same name, but still need to be mutually exclusive
		radios.addEvent('change', function(event) {
			
			if(this.get('checked')) {
				var checked_radio = this;
			} else {
				return;
			}
			
			radios.each(function(radio) {
				var checked = checked_radio == radio;
				radio.set('checked', checked);
				var nav = radio.getNext('nav.filter');
				if(nav) {
					if(checked) {
						nav.removeClass('disabled').getFirst('input').set('disabled', false);
					} else {
						nav.addClass('disabled').getFirst('input').set('disabled', true);
					}
				}
				
			});
			
		});
		
		target_area.getElements('.filter').addEvent('click', function() {
			var radio = $(this).getPrevious('input[type=radio]');
			if(radio && !radio.get('checked')) {
				radio.set('checked', true);
				$(this).removeClass('disabled');
				radio.fireEvent('change');
			}
		});
		
		// reflect the stylised selects(nav.filter) into the real (and hidden) selects
		//target_area.getElements('.filter').each(function(filter) {
		//	
		//	var select = filter.getElement('select');
		//	var label = filter.getElement('label');
		//	
		//	filter.addEvent('click:relay(.filter-list li)', function(event, element) {
		//		
		//		var value = element.get('data-value');
		//		
		//		var option = select.getElement('option[value=' + value + ']');
		//		if(option) {
		//			option.set('selected', true);
		//		}
		//		
		//		label.set('text', element.get('text'));
		//		
		//	});
		//	
		//}); 
		
	});
		

	if(window.location.hash) {
		var url_hash = window.location.hash;
		window.location.hash = '';
		$$(url_hash).each(function(el){
			setTimeout(function(){
				var myFx = new Fx.Tween(el, {duration:3000});
			
				var _y = getOffset( el ).top;
				if (typeof FB != 'undefined' && window.location != window.parent.location){
					FB.Canvas.scrollTo(0, _y);

				} else {
					var myScroll = new Fx.Scroll(window, {
						wait: true,
						duration:2500, 
						transition: Fx.Transitions.Quad.easeInOut
					});
					myScroll.toElementCenter(el);
				}

				var origColor = el.getStyle('backgroundColor'); 
				while(el.getParent()){ 
					// if sub reply is hidden under a thread, then show it via all its DOM parents
					el.getParent().show(); 
					if (origColor == 'transparent' || origColor == '')
						origColor = el.getParent().getStyle('backgroundColor');
					
					el = el.getParent(); 
				}

				myFx.start('background-color', origColor, '#FCF494');
				setTimeout(function(){ myFx.start('background-color', '#FCF494', origColor); }, 5000);
		
			}, 500);
		});
	}
}

document.addEvent('domready', function() {

	/* Ajax popup */ 
	document.addEvent('click:relay(.d-popup-ajax, .d-popup-ajax > a)', function(e, link) {
		if (!link.get('href'))
			return;
		e.preventDefault();
		if (link.get('js-confirm') && !confirm(link.get('js-confirm'))){
			return false;
		}
		link = link.get('href') ? link : link.getFirst('a');
		d_popupAjax(link);
	})

	function discussionSubmitButtonValue(checkbox){
		var mode = 'modeNormal';
		if (checkbox.checked){
			mode = 'modeAnon';
		}
		$('d-submit-'+checkbox.get('id')).value = $('d-submit-'+checkbox.get('id')).get('data-'+mode);
	}

	$$('.d-anonymous').each(function(checkbox){
		discussionSubmitButtonValue(checkbox);
		checkbox.addEvent('change', function(e){
			discussionSubmitButtonValue(checkbox);
		});
	})

	d_init_js();
})