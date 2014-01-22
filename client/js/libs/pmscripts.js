function trim(myString) { return myString.replace(/^\s+/g,'').replace(/\s+$/g,''); }
function isIE(){ return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent); }
function isunderIE9(){ return (isIE() && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) < 9); }

/**
	* switchDiv
**/
function switchDiv(div1, div2) {
	var div1 = $(div1);
	var div2 = $(div2);
	if (div1.isVisible() && !div2.isVisible()){
		div1.hide();
			div2.show();	
	} else{
		div2.hide();
		div1.show();
	}
}

/**
	* descendantZIndex
	* Only on IE7, when call on a container, all previous ones in the DOM will be z-indexed
**/
function descendantZIndex(div){	

}

/**
	* crop
	* Do a JS cropping on the image passed as parameter
**/
function crop( div, img) {
	if ($(div) && $(img)){
		$(div).setStyle('background', "transparent url(" + $(img).getAttribute('src') + ") no-repeat 50% 50%" );
		$(div).setStyle('backgroundSize', "cover" );
		$(img).setStyle('display', 'none');
	}
}

function appUri(uri){
	var uri = new URI(uri);
	if ($('fb-root').get('rel')){
		uri.setData({fb_fan_page_id: $('fb-root').get('rel')}, true);
	}
	return uri.toString();
}

function pmRedirect(uri) {
	document.location = appUri(uri).toString();
}

function word_count(text){
	text = text.replace(/\s/g,' '); //removes any kind of space (\n,\t, etc.) by a singular " "
	if (text.length){
		var count_array = text.split(" ");
		for (r=z=0; z<count_array.length; z++) {if (count_array[z].length > 0) r++;}
		return r;
	}
	return 0;
} 

function textareaWordsCounter(textareaClass, cntfieldClass){
	$$('textarea.'+textareaClass).each(function(field){
		var limit = field.get('data-length');
		if (limit){
			var words = word_count(field.value);
			field.getPrevious('.'+cntfieldClass).getFirst('span').innerHTML = words;
			
			field.addEvent('keyup', function(e){
				var words = word_count(field.value);
				field.getPrevious('.'+cntfieldClass).getFirst('span').innerHTML = words;
			});
		}
	});
}
function textareaCharactersCounter(textareaClass, cntfieldClass){
	$$('textarea.'+textareaClass).each(function(field){
		var limit = field.get('data-length');
		if (limit){
			field.getPrevious('.'+cntfieldClass).getFirst('span').innerHTML = limit - field.value.length;
			if ((limit - field.value.length) < 0){
				field.getPrevious('.'+cntfieldClass).getFirst('span').addClass('error');
			} 
			field.addEvent('keyup', function(e){
				field.getPrevious('.'+cntfieldClass).getFirst('span').innerHTML = limit - field.value.length;
				if ((limit - field.value.length) < 0){
					field.getPrevious('.'+cntfieldClass).getFirst('span').addClass('error');
				} else if (field.getPrevious('.'+cntfieldClass).getFirst('span').hasClass('error')){
					field.getPrevious('.'+cntfieldClass).getFirst('span').removeClass('error');
				}
			});
		}
	});
}

function simulate(element, eventName)
{
	function extend(destination, source) {
	    for (var property in source)
	      destination[property] = source[property];
	    return destination;
	}
	var eventMatchers = {
	    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
	    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	}
	var defaultOptions = {
	    pointerX: 0,
	    pointerY: 0,
	    button: 0,
	    ctrlKey: false,
	    altKey: false,
	    shiftKey: false,
	    metaKey: false,
	    bubbles: true,
	    cancelable: true
	}
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

document.addEvent('domready', function() {
	
	/*
		* Generic btn-close class to close the parent div
	*/
	document.addEvent('click:relay(.btn-close)', function(e, button) {
		if (!button.hasClass('keep-btn-close'))
			button.hide();
		e.preventDefault();
		var parent = button.get('data-content');
		if (button.get('data-selected') && button.getParent(parent).getPrevious(button.get('data-selected'))){
			button.getParent(parent).getPrevious(button.get('data-selected')).removeClass('selected');
		}
		if(!parent) {
			parent = 'div';
		}
		if (!button.hasClass('to-hide')) {
			button.getParent(parent).nix(true);
		} else {
			new Fx.Reveal(button.getParent(parent), {duration:500, opacity:.5}).dissolve();
			if (button.hasClass('reload')){
				location.reload();
			}
			else if (button.getParent(parent).getNext('.btn-open')){
				button.getParent(parent).getNext('.btn-open').show();
			}
		}
	});
	/*
		* Generic btn-open class to open the previous div
	*/
	document.addEvent('click:relay(.btn-open)', function(e, button) {
		e.preventDefault();
		if (button.hasClass('to-hide'))
			button.hide();
		if (button.getPrevious('div').getElement('.btn-close'))
			button.getPrevious('div').getElement('.btn-close').show();
		new Fx.Reveal(button.getPrevious('div'), {duration:500, opacity:.5}).reveal();

	});

	
	var ajaxLoaderDiv = new Element('div', {'class': 'ajax-tmp-message'});
	function injectAjaxLoaderDiv(container){
		if (!container.hasClass('noRelative')){
			container.setStyle('position', 'relative');
		}
		ajaxLoaderDiv.inject(container);
	}
	
	/**
		* Found hidden links simulating a form submit
		* show them after hidding the nojs_submit button
	**/
	function js_submit(form){
		if (form.get('js-confirm') && !confirm(form.get('js-confirm'))){
			return;
		}
		
		if (form.get('data-container') == 'popup-box-content'){
			$('popup-box-content').set('html', '');
			new Fx.Reveal($('popup')).reveal();
			if (typeof FB != 'undefined')
				FB.Canvas.scrollTo(0,0);
		}
		
		injectAjaxLoaderDiv(form);
		form.set('action', appUri(form.get('action')));
		if (form.get('data-container') && $(form.get('data-container'))){
			form_updater = new Form.Request(form, $(form.get('data-container')), {
				resetForm: false,
				asynchronous:true, 
				evalScripts:true,
				onSend: function() {
					injectAjaxLoaderDiv($(form.get('data-container')));
				},
				onSuccess: function() {
					if (form.get('next-target'))
						document.location = form.get('next-target');
				},
				OnCancel: function() {
					$(form.get('data-container')).set('html', 'An error occurred.');
				},
				OnError: function() {
					$(form.get('data-container')).set('html', 'An error occurred.');
				}
			});
			form_updater.send.delay(500, form_updater);
		}else{
			form.submit();
		}
		$$('form').each(function(allform){ allform.addClass('opacity'); if (allform != form){allform.disabled=true;} })
	}
	
	function popupAjax(link){
		$('popup-box-content').set('html', '');
		new Fx.Reveal($('popup')).reveal();

		var img_url_pattern = new RegExp("\.(jpe?g|gif|png)[^a-z]?", 'i');
		if (link && img_url_pattern.test(link.get('href'))==true){
			var picture = new Element('img', {'src': link.get('href'), 'style': 'width:100%;'}).inject($('popup-box-content'), 'top');
			// var picture = new Asset.image(link.get('href'), {'style': 'width:100%;'});
		} 
		else{
			var params_url_pattern = new RegExp("([a-z0-9]+\:[a-z0-9]+)+", 'i');
			new Request.HTML({
				url: link.get('href')+(!params_url_pattern.test(link.get('href')) ? '?' : '/')+(new Date().getTime()),
				update: $('popup-box-content'),
				asynchronous:true, evalScripts:true,
				onRequest: function(){
		        	injectAjaxLoaderDiv($('popup-box-content'));
				},
				onFailure: function(){
					$('popup-box-content').set('text', 'Sorry, your request failed.');
				},
				onSuccess: function(){ 
					if (link.hasClass('reload-on-close')){
						$('popup-box-header').addClass('reload');
					}
					if (typeof FB != 'undefined')
						FB.Canvas.scrollTo(0,0);
				}
			}).send();
		}
	}
	
	$$('.js_submit').each(function(link){
		var form = link.getParent('form');
		if (form.getElement('.nojs_submit'))
			form.getElement('.nojs_submit').hide();
		link.show();
	});
	document.addEvent('click:relay(.js_submit)', function(e, link){
		e.preventDefault();
		link.disabled = true;
		if (link.hasClass('reset')){
			if (link.getPrevious('input[type="text"]'))
				link.getPrevious('input[type="text"]').value='';
		}
		js_submit(link.getParent('form'));
		setTimeout(function(){link.disabled = false}, 1000);
	})
	
	var js_submit_onchange_timeout = null;
	$$('.js_submit_onchange').each(function(link){
		var form = link.getParent('form');
		if (form.getElement('.nojs_submit'))
			form.getElement('.nojs_submit').hide();
		link.show();
	})
	document.addEvent('change:relay(.js_submit_onchange)', function(e, link){
		e.stop();
		if (js_submit_onchange_timeout)
			clearTimeout(js_submit_onchange_timeout);
		js_submit_onchange_timeout = setTimeout(function(){js_submit(link.getParent('form'))}, 500);
	})
	
	/**
		* Found form that need a confirmation before being submited (with class "js-confirm")
		* The message should be placed in <form> attribut js-confirm="{message to prompt}"
	**/
	$$('form.js-confirm').each(function(form){
		if (form.get('js-confirm')){
			form.getElements('input[type="submit"]').each(function(button){
				button.addEvent('click', function(e){
					e.preventDefault();
					if (confirm(form.get('js-confirm'))){
						injectAjaxLoaderDiv(form);
						form.submit();
						$$('form').each(function(allform){ allform.addClass('opacity'); if (allform != form){allform.disabled=true;} })
					} 
				})
			})
		}
	})
	
	/**
		* Found links that need a confirmation before being targeted (with class "js-confirm")
		* The message should be placed in <a> attribut js-confirm="{message to prompt}"
	**/	
	document.addEvent('click:relay(a.js-confirm)', function(e, link){
		
		if (link.get('js-confirm') && !confirm(link.get('js-confirm'))){
			e.preventDefault();
			return false;
		}
		if (link.hasClass('popup-ajax')) {
			e.stop();
			return true;
		}

	});

	/**	Found links behind a disabled input to be able to edit it	**/
	$$('.disabled-input-jsenabler').each(function(link){
		if (link.getPrevious('input').disabled == true){
			link.addEvent('click', function(e){
				e.preventDefault();
				link.getPrevious('input').disabled = false;
				link.hide();
			});
			link.show();
		} 
	});
	
	/** Found ajax form **/
	document.addEvent('submit:relay(form.ajax-form)', function(e, form) {
		e.preventDefault();
		js_submit(form);
	});
	document.addEvent('submit:relay(form.ajax-upload-form)', function(e, form) {
		e.preventDefault();
		if (form.get('js-confirm') && !confirm(form.get('js-confirm'))){
			return;
		}
		injectAjaxLoaderDiv(form);
	});
	document.addEvent('mouseup:relay(.next-target)', function(e, button){
		if (button.getParent('form.ajax-form') && button.get('next-target')){
			button.getParent('form.ajax-form').set('next-target', button.get('next-target'));
		}
	});

	
	
	/* bubble box */
	document.addEvent('click:relay(.bubble-box-enabler)', function(e, button) {
			e.preventDefault();
			$$('.bubble-box-enabler.selected').each(function(enabledButton){
				if (enabledButton != button) {
					enabledButton.removeClass('selected');
					enabledButton.getNext('.bubble-box').hide();
				}
			});
			button.getNext('.bubble-box').toggle();
			button.toggleClass('selected');
			if (button.hasClass('bubble-box-highlighter')){
				button.toggleClass('highlighted');
			}else if (button.getParent('.bubble-box-highlighter')){
				button.getParent('.bubble-box-highlighter').toggleClass('highlighted');
			}
	});
	
	/* List actions collapser */ 
	document.addEvent('click:relay(.buttonCollapser)', function(e, button) {
		e.preventDefault();

		var parent = button.getParent(button.get('data-parent'));
		var container = parent.getNext(button.get('data-content'));

		var selectedClass = 'selected';
		if (button.get('selected-class')){
			selectedClass = button.get('selected-class');
		}

		if (!button.hasClass(selectedClass)){
			// open container
			button.addClass(selectedClass);
			container.setStyle('maxWidth', parent.getStyle('width'));
			if (!isunderIE9())
				new Fx.Reveal(container).reveal();
			else
				container.show();
		} else if (button.hasClass(selectedClass)){
			// close container
			button.removeClass(selectedClass);
			if (!isunderIE9())
				new Fx.Reveal(container).dissolve();
			else
				container.hide();
		}
	});
	
	/* Ajax popup */ 
	document.addEvent('click:relay(.popup-ajax, .popup-ajax > a)', function(e, link) {
		e.preventDefault();
		if (link.get('js-confirm') && !confirm(link.get('js-confirm'))){
			return false;
		}
		link = link.get('href') ? link : link.getFirst('a');
		popupAjax(link);
	})
	
	/* Ajax list */ 
	document.addEvent('click:relay(.list-ajax)', function(e, link) {
		e.preventDefault();
		if (!link.get('href'))
			return;
		var container = link.getNext('.items-list');
		
		if (link.hasClass('selected')){
			new Fx.Reveal(container.dissolve());
			link.removeClass('selected')
		} else {
			new Fx.Reveal(container.reveal());
			link.addClass('selected')
			if (!container.get('html')){
				var params_url_pattern = new RegExp("([a-z0-9]+\:[a-z0-9]+)+", 'i');
				new Request.HTML({
					url: link.get('href')+(!params_url_pattern.test(link.get('href')) ? '?' : '/')+(new Date().getTime()),
					update: container,
					asynchronous:true, evalScripts:true,
					onRequest: function(){
			        	container.set('html', '…');
					},
					onFailure: function(){
						container.set('text', 'Sorry, your request failed.');
					},
					onSuccess: function(){ 
					}
				}).send();
			}
		}
	})
	
	function is_touch_device() {
	  return !!('ontouchstart' in window);
	}

	var timerToCloseFilterList;
	function timeoutToCloseFilterList(list){
		clearTimeout(timerToCloseFilterList);
		timerToCloseFilterList = setTimeout(function(){
			list.hide();
			if (list.getParent('ul.filter-list').isVisible()){
				timeoutToCloseFilterList(list.getParent('ul.filter-list'));
			}
		}, 5000);
	}
	// menu sub-list and selector menu
	$$('ul.filter-list').each(function(list){
		list.hide();
		if (is_touch_device()){
			list.getParent().addEvent('click', function(e){
				if (list.isVisible()){
					// list.hide();
					
				}else{
					e.preventDefault();
					list.show();
					timeoutToCloseFilterList(list);
				}
			});
		} else{
			list.getParent().addEvent('mouseover', function(e){
				if(!this.getParent('nav').hasClass('disabled')) {
					list.show()
				}
			});
			list.getParent().addEvent('mouseout', function(e){
				list.hide();
			});
		}
		if (list.getPrevious('.label')){
			list.getPrevious('.label').addEvent('mouseover', function(e){
				if(!this.getParent('nav').hasClass('disabled')) {
					list.show()
				}
			});
			list.getPrevious('.label').addEvent('mouseout', function(e){
				list.hide();
			});
		}

		var select = list.getParent('.filter.select');
		if (select){
			list.getElements('li').each(function(option){
				if (option.get('data-value')){
					if (select.getFirst('input').value == option.get('data-value')){
						select.getFirst('ul li span.label').set('html', option.getFirst('span').get('html'));
						select.set('data-value', option.get('data-value'));
					}
					option.addEvent('click', function(e){
						select.getFirst('ul li span.label').set('html', option.getFirst('span').get('html'));
						select.getFirst('input').set('value', option.get('data-value'));
						select.set('data-value', option.get('data-value'));
					})
				}
			})
		}
	})
	
	// form requirments verification
	function formWithRequirments(form){
		var error = 0;
		form.getElements('.required').each(function(el){
			if (!el.value && !el.get('data-value')){
				el.addClass('formError');
				error++;
			} else if (el.hasClass('formError')){
				el.removeClass('formError')
			}
		})
		if (error){
			return false
		} else{
			js_submit(form);
		}
	}
	// document.addEvent('submit:relay(form.formWithRequirments)', function(e, form) {
	$$('form.formWithRequirments').each(function(form){
		form.addEvent('submit', function(e){
			e.preventDefault();
			if (!formWithRequirments(form)){
				e.stop();
			}
		});
		form.getElements('input[type="submit"]').each(function(bt){
			// prevent double submit in IE 8
			bt.addEvent('click', function(e){
				e.preventDefault();
				if (!formWithRequirments(form)){
					e.stop();
				}
			})
		})
	})
	
	function checkPlaceholder(){
		// Check if the browser does not support Placeholder
		var test = new Element('input'); 
		// if it has 'placeholder' this browser supports it already so you can exit
		if(!('placeholder' in test)) {  
			// for older browsers, get all the inputs and textareas which you have assigned a 'placeholder' attribute to
			new NS.Placeholder({
				elements: $$('input[type=text], textarea'),
				color: '#aaa'
	        });
		}
	}
	checkPlaceholder();
	
	
	// tabs system used in user profile (for insights)
	$$('nav.tabs ul').each(function(tabs){
		tabs.getElements('li a').each(function(tabbt){
			tabbt.addEvent('click', function(e){
				e.stop();
				if (!tabbt.getParent('li').hasClass('selected')){
					tabs.getElements('li.selected').each(function(li){li.removeClass('selected')})
					tabbt.getParent('li').addClass('selected');
					tabs.getParent().getNext('section.tabs').getElements('div.tab').each(function(tab){tab.hide()});
					$(tabbt.get('data-id')).show();
				}
			})
		});
		tabs.getParent().getNext('section.tabs').getElements('a.bt-tab-prev').addEvent('click', function(e){
			e.stop();
			if (tabs.getFirst('li.selected').getPrevious('li a'))
				simulate(tabs.getFirst('li.selected').getPrevious('li a'), 'click');
			else
				simulate(tabs.getLast('li a'), 'click');
		});
		tabs.getParent().getNext('section.tabs').getElements('a.bt-tab-next').addEvent('click', function(e){
			e.stop();
			if (tabs.getFirst('li.selected').getNext('li a'))
				simulate(tabs.getFirst('li.selected').getNext('li a'), 'click');
			else
				simulate(tabs.getFirst('li a'), 'click');
		});
	})
});


