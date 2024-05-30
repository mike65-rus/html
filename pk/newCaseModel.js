/**
 * Created by 1 on 03.01.2015.
 */
function NewCaseModel() {
    this.sPin='';
    this.searchString='';
    this.oPac=null;
    this.selectedPerson=null;
    this.selectedDate=null;
    this.datePart=null;
    this.timePart=null;
    this.maxDate=null;
    this.minDate=null;
    this.timeInterval=10;
    this.searchPacDS=new kendo.data.DataSource({
        transport: {
            read: {
                url: "default.aspx?action=pk/CASES_AJAX&action2=find_persons",
                dataType: "json"
            }
        },
        requestStart: _onRequestStart,
        requestEnd: _onRequestEnd,
        schema: {
            data: "persons.rows",
            total: "records",
            errors: "error",
            model: {
                fields: {
                    pin: {type: "string"},
                    fam: {type: "string"},
                    ima: {type: "string"},
                    otch: {type:"string"},
                    sex: {type: "string"},
                    birt: {type: "date"},
                    fio: {type: "string"}
                }
            }
        },
        change: function(e) {
            if (e.items.length==1) {
                that.set("selectedPerson", e.items[0]);
            }
        },
        error: function(e) {
            ajax_error(e);
        }

    });
    this.setDates=function() {
        this.selectedDate=roundMinutes(new Date(),this.timeInterval);
        this.maxDate=this.selectedDate;
        this.minDate=addDays(this.selectedDate,-10);
    };
    this.isSearchEnabled= function() {
        return (this.get("searchString").length>=2);
    };
    this.getPacData= function() {
        var sHtml="";
        var selPers=this.get("selectedPerson");
        if (!selPers) {
            return sHtml;
        }
        sHtml=selPers.fio+","+selPers.pin+","
        if (selPers.birt) {
            sHtml=sHtml+selPers.birt.toLocaleString().substr(0,10);
        }
        return sHtml;
    };
    this.doFindPersons= function() {
        this.set("searchString",this.searchString.trim());
        if (!(this.isSearchEnabled())) {
            return;
        }
        this.set("selectedPerson",null);
        toggleButtons();
        if (isPin(this.searchString.trim().toUpperCase())) {
            this.searchPacDS.read({
                pin: this.searchString.trim().toUpperCase(),
                fio: ""
            });
        }
        else {
            var sFio=this.searchString.trim().capitalize(true);
            this.searchPacDS.read({
                pin: "",
                fio: sFio
            });
        }
    };
    this.selectPerson=function(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        that.set("selectedPerson",dataItem);
    };
    this.newCaseDialog= function(oCaller) {
        caller=oCaller;

        var $newCaseWindow = $("#new_case_window");

        that.set('searchString',"");
        $("#new_case_window_save").prop("disabled",true);
        this.set("selectedPerson",null);
        this.setDates();
        $newCaseWindow.find(".pac-data").first().text("");

        that.searchPacDS.data([]);
        var $newCaseDate = $("#new_case_date");
        $newCaseDate.mask("99.99.9999",{placeholder:"дд.мм.гггг"});
        $newCaseDate.attr("readonly","readonly");
        var datePart=$newCaseDate.data("kendoDatePicker");
//        datePart.setOptions({interval:that.get("timeInterval"),timeFormat:"HH:mm",format:"dd.MM.yyyy HH:mm"});
        datePart.max(that.maxDate);
        datePart.min(that.minDate);
        datePart.value(that.selectedDate);
        //
        var $newCaseTime = $("#new_case_time");
        $newCaseTime.mask("99:99",{placeholder:"чч:мм"});
        $newCaseTime.attr("readonly","readonly");
        var timePart=$newCaseTime.data("kendoTimePicker");
        timePart.setOptions({interval:that.get("timeInterval"),timeFormat:"HH:mm",format:"HH:mm"});
        timePart.min(new Date(2015,0,1,7,0,0));
        timePart.max(new Date(2015,0,1,19,0,0));
        timePart.value(that.selectedDate);

        $newCaseWindow.kendoWindow();
        var dialog=$newCaseWindow.data("kendoWindow");
        dialog.title("Создание нового случая");
        dialog.open().center();
        var $newCasePin = $("#new_case_pin");
        $newCasePin.unbind('input');
        $("#new_case_search_button").attr("disabled","true");
        $newCasePin.bind('input',function(){
            toggleButtons();
        });
        setTimeout(function(){$("#new_case_pin").focus()},1000)
    };
    this.doClose=function() {
        $("#new_case_window").data("kendoWindow").close();
    };
    this.doSave=function() {
        if (!this.selectedPerson) {
            alertify.error("Невзможно открыть случай!");
            return;
        }
        caller.tryAddCase(this);
        this.doClose();
    };
    // privates
    var that=kendo.observable(this);
    that.bind("set",function(e){
        if(e.field=="selectedPerson") {
            $("#new_case_window_save").prop("disabled",(e.value==null));
            if ((e.value) && (!(e.value.pin==""))) {
            }
            else {
                e.preventDefault();
            }
        }
        if ((e.field=="datePart") || (e.field=="timePart")) {
            var datePart=$("#new_case_date").data("kendoDatePicker").value();
            var timePart=$("#new_case_time").data("kendoTimePicker").value();
            this.selectedDate=constructDate(datePart,timePart);
        }
    });
    var caller=null;
    //
    var toggleButtons=function() {
        that.set('searchString',$("#new_case_pin").val());
        if (that.isSearchEnabled()) {
            $("#new_case_search_button").removeAttr("disabled");
        }
        else  {
            $("#new_case_search_button").attr("disabled","true");
        }
        /*
        if (that.selectedPerson) {
            $("#new_case_window_save").removeAttr("disabled");
        }
        else  {
            $("#new_case_window_save").attr("disabled","true");
        }
        */
    };
    // end of privates
    return that;
};

var newCaseModel=new NewCaseModel();
//var newCaseModel2=new NewCaseModel();

$("#new_case_grid").kendoGrid({
    height: 300,
    autoBind: false,
    dataSource: newCaseModel.searchPacDS,
    scrollable: {
        virtual: true
    },
    resizable: true,
    sortable: {
        mode: "multiple"
    },
    selectable: "row",
    groupable: false,
    filterable: true,
    navigatable: true,
    columns: [
        { command: { text: "Выбрать", click: newCaseModel.selectPerson }, title: " ", width: "100px" },
        {field: "fio", title: "ФИО"},
        {field: "pin", title: "ПИН"},
        {field: "birt", title: "Д/рожд", format: "{0:dd.MM.yyyy}"}
    ]
});

kendo.bind($("#new_case_window"), newCaseModel);

$("#new_case_grid").delegate("tbody>tr", "dblclick", function(e){
    e.preventDefault();
    var dataItem = $("#new_case_grid").data("kendoGrid").dataItem($(e.currentTarget));
    newCaseModel.set("selectedPerson",dataItem);
});
