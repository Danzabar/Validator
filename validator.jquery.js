(function( $ ) {
 
  $.fn.Validator = function( options ) {
	
	// Setup default option values
	var defaults = {		
		errors : {
		"text": "This field is required",
		"email": "Please provide a valid email address",
		"int": "Please provide a valid number",
		"custom": "This field is required",
		"phone": "Please provide a valid phone number",
		"select": "This field is required",
		"radio": "This field is required",
		"checkbox": "This field is required" },
		errorElement : 'span',
		errorClass : 'error'
	};
	
	
	var settings = $.extend( {}, defaults, options );
	
	$(this).on('submit', function(){
		var errors = GatherRequired($(this));
		
		if(errors == 0) {
			if (settings.submitHandler) {
				settings.submitHandler($(this));
				return false;
			}
			return true
		}	
		return false;
	});
	
	var GatherRequired = function(form) {
	
		var elems = form.find('.required');
			errors = new Array();
			i = 0;
			
		$.each(elems, function(){		
			var type = getType($(this));
			
			if(ValidateField($(this), type) == false){
					if(settings.errorHandler){
						settings.errorHandler(settings.errors[type]);
					} else {
						reportError($(this), type);
					}
					errors[i] = $(this);
			}		
			i++;
		});	
		return errors;
	}

	var getType = function(field){
		// check to see if it has a custom data type already set
		if(typeof(field.data('expect')) !== 'undefined'){
			if(field.data('expect').length > 0){
				return field.data('expect');
			}
		}
		
		switch(field.prop('tagName')){
			case 'INPUT':
				return field.attr('type');
				break;
			case 'SELECT':
				return 'select';
				break;
			case 'TEXTAREA':
				return 'text';
				break;
		}	
		
		return 'text';
	}

	var ValidateField = function(field, type, report) {
		var value = field.val();
			regex = '';
			
		if(typeof(field.data('dependant')) !== 'undefined' && field.data('dependant').length > 0){
			if(checkDependant($("#"+field.data('dependant'))) === false){
				return true;
			}
		}
		
		if(type == 'text' || type == 'email' || type == 'int' || type == 'phone' || type == 'select'){
			if(value.length == 0 || typeof(value) === 'undefined'){								
				return false;
			}			
		}
		
		if(type == 'phone' || type == 'email' || type == 'custom'){			
			if(typeof(field.data('rules')) !== 'undefined'){
				regex = field.data('rules');
			}
			return checkRegex(value, type, regex);
		}
		
		switch(type){			
			case 'int':
				return $.isNumeric(value);
				break;
			case ('checkbox' || 'radio'):
				return $("input[name="+ field.attr('name') +"]").is(':checked');
				break;		
		}				
		
		return true;
	}

	var checkDependant = function(field) {	
		return ValidateField(field, getType(field));
	}
		
	var checkRegex = function(value, type, regex){
		switch(type){
			case 'email':
					var reg = /[^\s@]+@[^\s@]+\.[^\s@]+/;
				break;
			case 'phone':
					var reg = /[0-9]{10}/;
				break;
			case 'custom':
					var reg = new RegExp(regex);
				break;
		}
		return reg.test(value);
	}

	var reportError = function(field, type){
		var error = '';
		
		if(hasError(field) === false){			
			placeError(field, settings.errors[type]);
			bindListener(field);
		}
		
		return false;
	}	

	var hasError = function(field) {
		if(field.parent().find('.'+settings.errorClass+'').length > 0){
			return true;
		}
		return false;
	}

	var placeError = function(field, error) {
		if(settings.errorWrapper){
			error = wrapError(settings.errorWrapper, error);
		}
		field.parent().append('<'+settings.errorElement+' class="'+settings.errorClass+'">' + error + '</'+settings.errorElement+'>');
	}
	
	var wrapError = function(wrapper, error){
		switch(wrapper){
			case 'p':
				return '<p>'+ error +'</p>';
			break;
			case 'span':
				return '<span>'+ error +'</span>';
			break;
			case 'li':
				return '<li>'+ error +'</li>';
			break;
		}
	}

	var resetError = function(field) {
		field.parent().find('.error').remove();
	}

	var bindListener = function(field) {
		$(field).on("change", function(){
			if(ValidateField(field, getType(field), true) === true){
				resetError(field);
			}
		});
	}
 
}
 
})( jQuery );
