/**
 * Created by 1 on 03.01.2015.
 */
function startApp() {
    /*
    $.ytLoad({startPercentage: 50,
            startDuration: 3000,
            completeDuration: 500,
            fadeDelay: 100,
            fadeDuration: 100
    });
    */
    examsModel.initControls();
    setTimeout(function() {
        examsModel.set("selectedPerson","");
        examsModel.set("selectedPerson",null);
    },1000);

    return;

    casesModel.changeUser(Number(localStorage['last_user']));
    casesModel.tabs=$("#my_cases").kendoTabStrip({animation:false,navigatable:false,activate:casesModel.onTabActivate}).data("kendoTabStrip");
    visitTypesDS.read({date:new Date().toISOString(), active:0});
    setTimeout(function(){
        casesModel.tabs.select("li:first");
    },1000);

}
var visitTypesDS=new kendo.data.DataSource({
    transport: {
        read: {
            url: "default.aspx?action=pk/CASES_AJAX&action2=get_visit_types",
            dataType: "json"
        }
    },
    schema: {
        data: "visit_types.rows",
        total: "records",
        errors: "error",
        model: ModelVisitTypes
    },
    change: function(e) {
    },
    error: function(e) {
        ajax_error(e);
    }

});
