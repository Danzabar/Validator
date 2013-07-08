/*
 * Validation script that lets you set required elements dynamically 
 * without javascript 
 * 
 * Author --Daniel Cox
 */
var Validator = function(form) {	
	var errors = GatherRequired(form);
	
	return errors.length == 0;
}

var GatherRequired = function(form) {
	
	var elems = form.find('.required');
		errors = new Array();
		i = 0;
		
	$.each(elems, function(){		
		var type = getType($(this));
		
		if(ValidateField($(this), type) == false){
				reportError($(this), type);
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
	var type = getType(field);
	
	return ValidateField(field, type);
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


/*
 * Error Reporting.
 * 
 */
var reportError = function(field, type){
	var error = '';
	
	if(hasError(field) === false){			
		placeError(field, errorLib(type));
		bindListener(field);
	}
	
	return false;
}

var errorLib = function(type) {
	// make an ajax request to the errors.json file
	$.getJSON("errorConfig.json", function(data) {
		return data[''+type+''];
		console.log(data[''+type+'']);	
	});
}

var hasError = function(field) {
	if(field.parent().find('.error').length > 0){
		return true;
	}
	return false;
}

var placeError = function(field, error) {
	field.parent().prepend('<span class="error">' + error + '</span>');
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
 
