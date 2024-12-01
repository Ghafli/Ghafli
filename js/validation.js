'use strict';
const ValidationScript = {
// Regular expressions for validation
patterns: {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  currency: /^\d+(\.\d{1,2})?$/,
  name: /^[\u0600-\u06FFa-zA-Z\s]{2,30}$/,  // Supports Arabic and English names
},

// Required fields
mandatoryFields: [
  "Email",
  "Name_First",
  "Name_Last",
  "SingleLine",
  "MultiLine",
  "Currency"
],

// Validation messages
messages: {
  required: "هذا الحقل مطلوب",
  email: "البريد الإلكتروني غير صحيح",
  phone: "رقم الهاتف غير صحيح",
  currency: "الرجاء إدخال قيمة صحيحة",
  name: "الاسم غير صحيح",
  minWords: "الرجاء إدخال 10 كلمات على الأقل"
},

// Validate single field
validateField: function(field) {
  const value = field.value.trim();
  const fieldType = field.getAttribute('fieldType');
  const name = field.name;
  const formId = field.closest('form').id;

  // Check if field is required
  if (this.mandatoryFields.includes(name) && !value) {
    this.showError(field, this.messages.required);
    return false;
  }

  // Validate based on field type
  switch(fieldType) {
    case '9': // Email
      if (!this.patterns.email.test(value)) {
        this.showError(field, this.messages.email);
        return false;
      }
      break;

    case '11': // Phone
      if (value && !this.patterns.phone.test(value)) {
        this.showError(field, this.messages.phone);
        return false;
      }
      break;

    case '7': // Name
      if (!this.patterns.name.test(value)) {
        this.showError(field, this.messages.name);
        return false;
      }
      break;
  }

  // Special validation for MultiLine (message)
  if (name === 'MultiLine') {
    const wordCount = value.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 10) {
      this.showError(field, this.messages.minWords);
      return false;
    }
  }

  // Special validation for Currency
  if (name === 'Currency') {
    if (!this.patterns.currency.test(value)) {
      this.showError(field, this.messages.currency);
      return false;
    }
  }

  this.clearError(field);
  return true;
},

// Show error message with form-specific error IDs
showError: function(field, message) {
  const formId = field.closest('form').id;
  const errorId = formId === 'contactForm' 
    ? `contact_${field.name}_error`  // Contact form errors
    : `${field.name}_error`;         // Share idea form errors

  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  field.classList.add('error');
},

// Clear error message with form-specific error IDs
clearError: function(field) {
  const formId = field.closest('form').id;
  const errorId = formId === 'contactForm' 
    ? `contact_${field.name}_error`  // Contact form errors
    : `${field.name}_error`;         // Share idea form errors

  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  field.classList.remove('error');
},

// Validate entire form
validateForm: function(formId) {
  const form = document.getElementById(formId);
  let isValid = true;

  form.querySelectorAll('input, textarea').forEach(field => {
    if (!this.validateField(field)) {
      isValid = false;
    }
  });

  return isValid;
}
};

// Add event listeners for real-time validation
document.addEventListener('DOMContentLoaded', function() {
const forms = ['contactForm', 'form'];

forms.forEach(formId => {
  const form = document.getElementById(formId);
  if (form) {
    // Add validation on form submission
    form.addEventListener('submit', function(e) {
      if (!ValidationScript.validateForm(formId)) {
        e.preventDefault();
      }
    });

    // Add real-time validation for fields
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('blur', function() {
        ValidationScript.validateField(this);
      });

      field.addEventListener('input', function() {
        if (this.classList.contains('error')) {
          ValidationScript.validateField(this);
        }
      });
    });
  }
});
});

// Zoho Forms specific variables
var zf_DateRegex = new RegExp("^(([0][1-9])|([1-2][0-9])|([3][0-1]))[-](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[-](?:(?:19|20)[0-9]{2})$");
var zf_MonthYearRegex = new RegExp("^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[-](?:(?:19|20)[0-9]{2})$");
var zf_MandArray = ["Email", "Name_First", "SingleLine", "MultiLine", "Currency"]; 
var zf_FieldArray = ["Email", "Name_First", "Name_Last", "SingleLine", "MultiLine", "Currency"]; 
var isSalesIQIntegrationEnabled = false;
var salesIQFieldsArray = [];

// Replace the existing Zoho validation function
var zf_ValidateAndSubmit = function() {
return ValidationScript.validateForm(event.target.id);
};
