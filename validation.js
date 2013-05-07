	
	/*
		Validates the form that it is bound to, currently requires you to pass the form element.
		Returns boolean 
	*/
	var Validation = function(form){		
		var errorFlag = 0;
		
			errorFlag = (checkRequired(form) + checkDependancies(form));	
		
		if(errorFlag > 0){			
			return false;
		} 
	}
	
	/*
		Gets the type of element, if it has a data-etype attribute set it will take that, failing that it puts them into basic groups
		returns string
	*/
	var getType = function(element){
		// Set the type as text
		var type = 'text';
		// check for data attributes first
		if(typeof(element.data('etype')) !== 'undefined'){
			if(element.data('etype').length > 0){
				return element.data('etype');
			}
		}
		
		var tagName = element.prop('tagName');
		
		switch(tagName){
			case 'INPUT':
				type = element.attr('type');
				break;
			case 'SELECT':
				type = 'select';
				break;
			case 'TEXTAREA':
				type = 'text';
				break;
		}		
		return type;
	}
	
	/*
		will check the parent element of a dependant input and return their new type based on this
		returns string
	*/
	var inheritType = function(element, type){
		switch(type){
			case 'select':
				return element.find(":selected").data('inherit');
				break;
			case 'radio':
				return element.filter(':checked').data('inherit');
				break;
			case 'checkbox':
				return element.filter(':checked').data('inherit');
				break;
		}
		
		return element.data('inherit');
	}
	
	/*
		Validates fields based on type
		returns boolean
	*/
	var ValidateField = function(element, type){
		var value = element.val();	
			regex = '';
		
		// Basic test for inputs
		if(type == 'text' || type == 'email' || type == 'int' || type == 'phone' || type == 'select'){
			if(value.length == 0 || typeof(value) === 'undefined'){								
				return false;
			}			
		}
		
		if(type == 'phone' || type == 'email' || type == 'custom'){			
			if(typeof(element.data('rules')) !== 'undefined'){
				regex = element.data('rules');
			}
			return checkRegex(value, type, regex);
		}
		
		switch(type){			
			case 'int':
				return $.isNumeric(value);			
				break;
			case 'checkbox':
				return $("input[name="+ element.attr('name') +"]").is(':checked');				
				break;
			case 'radio':
				return $("input[name="+ element.attr('name') +"]").is(':checked');					
				break;			
		}			
		return true;
	}	
	
	/*
		Deals with regex validation
	*/
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
		Validates group of elements with required class.
	*/
	var checkRequired = function(form){
	
		var elements = form.find('.required');		
			errorFlag = 0;
		
		$.each(elements, function(){	
		
			var type = getType($(this));	
			
			if(ValidateField($(this), type) === false){
				errorFlag++;
			}			
			
		});
		
		return errorFlag;
	}
	
	/*
		Checks elements that are required when another element is active or checked. 
	*/
	var checkDependancies = function(form){		
	
		var dependants = form.find('.required_optional');			
		
		$.each(dependants, function(){
						
			var dependancy = $('[name='+ $(this).data('dependant') +']');
				d_type = getType(dependancy);
				dependancy_type = $(this).data('dtype');
				type = getType($(this));
				
			if(typeof(dependancy_type) !== 'undefined'){
				type = inheritType(dependancy, d_type);
			}
			
			if(ValidateField(dependancy, d_type, true) === true && ValidateField($(this), type) === false){
				errorFlag++;
			}
		});
		
		return errorFlag;
	}
	