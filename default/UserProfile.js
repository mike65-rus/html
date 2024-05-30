		// Initialize the Kendo UI Validator on your "form" container
		// (NOTE: Does NOT have to be a HTML form tag)
		var validator0 = $("#form0").kendoValidator().data("kendoValidator");

		// Validate the input when the Save button is clicked
		$("#submit0").on("click", function() {
			if (validator0.validate()) {
				// If the form is valid, the Validator will return true
				$("#form0").submit;
			}
		});		
		var validator1 = $("#form1").kendoValidator().data("kendoValidator");

		// Validate the input when the Save button is clicked
		$("#submit1").on("click", function() {
			if (validator1.validate()) {
				// If the form is valid, the Validator will return true
				$("#form1").submit;
			}
		});		
		$("#form1").kendoValidator({
			rules: {
			  customRule2: function(input) {
				  if (input.is("[name=pass2]")) {
					return input.val() === $("#pass1").val();
				  }
				  return true;
			  }
			},
			messages: {
				customRule2: "Данные в обоих полях должны совпадать"
			}
		});
