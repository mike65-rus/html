function VisitsModel() {
    //publics
    this.modelName="visitsModel";
    //
    this.selectedPerson=null;
    this.selectedPersonType="";
    //
    this.dataSources={
        patientVisits: new kendo.data.DataSource({
            data:[],
            schema: {
                model: dataModels.Visit
            }
        })
    };
    //
    this.newVisit=function() {
        amplify.publish("openVisit",{
            mode:"new",
            user_id:Number(localStorage.last_user),
            selectedPerson: this.get("selectedPerson"),
            selectedPersonType:this.get("selectedPersonType")
        });
    };



    //
    var that=kendo.observable(this);
    // privates
    var queryPatientVisits=function(sPatientId) {
//        this.dataSources.patientVisits.read({patient_id:sPatientId,user_id:Number(localStorage.last_user)});
    };
    var onFieldChange=function(e) {

    };
    that.bind("change",function(e) {
        onFieldChange(e);
    });

    var onMyTabActivated=function(data) {
        var el=data.content;
        if ($(el).data("model-name")===that.modelName) {
            var tab=el;
            var divHeight=Number.parseInt($(tab).css("height"));
            var splitter=$(tab).find(".k-splitter").first();
            $(splitter).css("height",divHeight-5);
//            kendo.resize($(data.content));
            kendo.resize($(splitter));
            /*
            setTimeout(function(){
                $(el).find(".k-splitter").each(function(idx,el) {
                    $(this).css("width","100%");
                    $(this).css("height",divHeight-5);
                    var splitter=$(this).data("kendoSplitter");
                    var size=splitter.size(".k-pane:first");
                    splitter.size(".k-pane:first",size);
                });
            },100);
            */
        }
    };
    var onPatientChanged=function(data) {
        that.set("selectedPerson",data.selectedPerson);
        that.set("selectedPersonType",data.selectedPersonType);
        queryPatientVisits(that.selectedPerson.pin);
    };
    var visitsGrid=null;
    var initControls=function() {
        visitsGrid=$("#visits-grid").kendoGrid({
            dataSource: that.dataSources.patientVisits,
            toolbar: kendo.template($("#template-visits-toolbar").html()),
            scrollable: true,
            pageable: false,
            selectable: "row",
            columns: [
                {field:"id", title:"id"}
            ]
        }).data("kendoGrid");
        kendo.bind($("#visits-grid-toolbar"),that);
        //
        $("#visits-list-view").kendoSplitter({
            orientation: "vertical",
            panes:[
                { collapsible:false,size:"70%",scrollable:false},
                { collapsible:false,scrollable:false}
            ]
        });

        kendo.bind($("#visits-list-view"),that);

    }();

    amplify.subscribe("patientChanged",that,onPatientChanged);
    amplify.subscribe("examsTabActivated",that,onMyTabActivated);
    return that;
}
var visitsModel=new VisitsModel();

