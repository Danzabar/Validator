/*
Validates the form that it is bound to, currently requires you to pass the form element.
Returns boolean
*/
var Validation = function(form) {
        // Get the input elements with 'Required' class.
        var elements = form.find('.required');
        errorFlag = 0;
        // iterate through the elements validating the fields as we go.
        $.each(elements, function() {
            var type = getType($(this));
            if (ValidateField($(this), type) === false) {
                errorFlag++;
            }
        });
        // Now for the required_optional classes, these are dependant on other form elements, as you can see
        // The mobile field is dependant on you ticking the offer checkbox.
        var dependants = form.find('.required_optional');
        // Now we can proceed in a similar way to the required class.
        $.each(dependants, function() {
            var dependancy = $('[name=' + $(this).data('dependant') + ']');
            d_type = getType(dependancy);
            dependancy_type = $(this).data('dtype');
            type = getType($(this));
            if (typeof(dependancy_type) !== 'undefined') {
                type = inheritType(dependancy, d_type);
            }
            if (ValidateField(dependancy, d_type, true) === true && ValidateField($(this), type) === false) {
                errorFlag++;
            }
        });
        if (errorFlag > 0) {
            return false;
        }
    }
/*
Gets the type of element, if it has a data-etype attribute set it will take that, failing that it puts them into basic groups
returns string
*/
var getType = function(element) {
        // Set the type as text
        var type = 'text';
        // check for data attributes first
        if (typeof(element.data('etype')) !== 'undefined') {
            if (element.data('etype').length > 0) {
                return element.data('etype');
            }
        }
        var tagName = element.prop('tagName');
        switch (tagName) {
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
var inheritType = function(element, type) {
        switch (type) {
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
var ValidateField = function(element, type) {
        var value = element.val();
        errors = true;
        if (arguments[2]) {
            errors = false;
        }
        // Basic test for inputs
        if (type == 'text' || type == 'email' || type == 'int' || type == 'phone' || type == 'select' || type == 'custom') {
            if (value.length == 0 || typeof(value) === 'undefined') {
                if (errors === true) {
                }
                return false;
            }
        }
        switch (type) {
        case 'email':
            if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value) === false) {
                return false;
            }
            break;
        case 'phone':
            if (/[0-9]{10}/.test(value) === false) {
                return false;
            }
            break;
        case 'int':
            if ($.isNumeric(value) === false) {
                return false;
            }
            break;
        case 'checkbox':
            if ($("input[name=" + element.attr('name') + "]").is(':checked') === false) {
                return false;
            }
            break;
        case 'radio':
            if ($("input[name=" + element.attr('name') + "]").is(':checked') === false) {
                return false;
            }
            break;
        case 'custom':
            // Specific custom validation, currently only supports regex.
            if (typeof(element.data('rules')) !== 'undefined') {
                // We have a value to match
                var reg = new RegExp(element.data('rules'));
                if (reg.test(value) === false) {
                    return false;
                }
            }
            break;
        }
        return true;
    }
