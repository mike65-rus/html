define(['kendo.all.min','utils'],
    function(kendo,utils) {
        var options= {
            daysLeft:60,
            daysRight:0
        };
        var validator={
            create: function(data) {
                var validator = $(data.form).kendoValidator({
                    validateOnBlur:false,
                    rules: {
                        datepickerRequired: function(input) {
                            if ((input.is("[data-role=datepicker]") && (input.prop("required")))) {
                                return (input.data("kendoDatePicker").value());
                            } else {
                                return true;
                            }
                        },
                        datepickerMax: function(input) {
                            if (input.is("[field=visitDate]")) {
                                var curDate=kendo.parseDate($(input).val(),"dd.MM.yyyy");
                                if (curDate && (curDate>(utils.addDays(new Date(),options.daysRight)))) {
                                    return false;
                                }
                            }
                            return true;
                        },
                        datepickerMin:function(input) {
                            if (input.is("[field=visitDate]")) {
                                var curDate = kendo.parseDate($(input).val(), "dd.MM.yyyy");
                                if (curDate && (curDate < (utils.addDays(new Date(), 0 - options.daysLeft)))) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    },
                    messages: {
                        datepickerRequired: "{0} Неверная дата!",
                        datepickerMax: function(input) {
                            return "{0}: "+$(input).val()+
                                " - дата не может быть больше "+kendo.toString(utils.addDays(new Date(),options.daysRight),"dd.MM.yyyy");
                        },
                        datepickerMin: function(input) {
                            return "{0}: "+$(input).val()+
                                " - дата не может быть меньше "+kendo.toString(utils.addDays(new Date(),0-options.daysLeft),"dd.MM.yyyy");
                        }
                    }
                }).data("kendoValidator");
                return validator;
            }    
        };
        return validator;                
    });
