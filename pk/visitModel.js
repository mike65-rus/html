function VisitModel() {

    // public
    this.visitData={
        // данные посещения
        isDnSt:false,
        isDateEnabled:true,
        dateLabel: "Дата посещения:",
        date:new Date(),
        paymentType:null,
        visitType:null,
        isVisitTypeEnabled:true,
        initiallySelectedSelector:"#idVisitDate",
        labelVisitTypeSelector:"#labelVisitType"
    };
    //
    this.onSaveVisitClick=function(e) {
        e.preventDefault();
        visitDataValidator.hideMessages();
        if (!(visitDataValidator.validate())) {
            return false;
        }
        else {
            alertify.alert("form validate Ok");
            return true;
        }
    };
    //
    this.mode="";
    this.readOnly=true;
    this.dataSources={
        tabStrips: [],
        paymentTypes:[
            {id:1,name:"1.ОМС",isVisitType:true},
            {id:4,name:"4.Платные",isVisitType:true},
            {id:21,name:"21.ВД/Профосмотр по ОМС",isVisitType:false},
            {id:22,name:"22.Сотрудники.Профосмотр",isVisitType:false},
            {id:23,name:"23.Профосмотр.Платные",isVisitType:false},
            {id:31,name:"31.Дневной стационар",isVisitType:false}
            ],
        visitTypes: [
            {id:1,name:"1.Первичное по заболеванию"},
            {id:2,name:"2.Повторное по заболеванию"},
            {id:3,name:"3.На дому по заболеванию"},
            {id:4,name:"4.Диспансерное наблюдение"},
            {id:5,name:"5.Консультативное"},
            {id:6,name:"6.Профилактическое"},
            {id:7,name:"7.Прочее"},
            {id:8,name:"8.Неотложная помощь в поликлинике"},
            {id:9,name:"9.Неотложная помощь на дому"},
            {id:12,name:"12.Патронаж на дому"}
        ]
    };
    //
    var that=kendo.observable(this);
    //
    // privates
    var settings= {
        daysLeft:60,
        daysRight:0
    };
    var widgets={
        // ui widgets
        visitWindow: {selector:"#visit-window", widget:null},
        newVisitWindow:{selector:"#new-visit-window", widget:null},
        visitWindowTabStrip:{selector:"#visit-tab-strip",widget:null}
    };
    var validatorRules={
        visitDateRule: function(input) {
            if (input.is("[field=visitDate]")) {
                var curDate=kendo.parseDate($(input).val(),"dd.MM.yyyy");
                if (!curDate) {
                    return false;
                }
            }
            return true;
        },
        visitDateRuleMax: function(input) {
            if (input.is("[field=visitDate]")) {
                var curDate=kendo.parseDate($(input).val(),"dd.MM.yyyy");
                if (curDate && (curDate>(addDays(new Date(),settings.daysRight)))) {
                    return false;
                }
            }
            return true;
        },
        visitDateRuleMin: function(input) {
            if (input.is("[field=visitDate]")) {
                var curDate=kendo.parseDate($(input).val(),"dd.MM.yyyy");
                if (curDate && (curDate<(addDays(new Date(),- settings.daysLeft)))) {
                    return false;
                }
            }
            return true;
        },
        visitTypeRule: function(input) {
            if (input.is("[field=visitType]")) {
                var paymentType=that.get("visitData.paymentType");
                var visitType=that.get("visitData.visitType");
                if (paymentType) {
                    if (paymentType.isVisitType) {
                        if (!visitType) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
    };
    var validatorMessages={
        visitDateRule: function(input) {
            var val=$(input).val();
            if (val) {
                return "{0}: "+$(input).val()+ " - неверная дата";
            }
            else {
                return "{0}: - реквизит должен быть заполнен существующей датой";
            }
        },
        visitDateRuleMax: function(input) {
            return "{0}: "+$(input).val()+ " - дата не может быть больше "+kendo.toString(addDays(new Date(),settings.daysRight),"dd.MM.yyyy");
        },
        visitDateRuleMin: function(input) {
            return "{0}: "+$(input).val()+ " - дата не может быть меньше "+kendo.toString(addDays(new Date(),- settings.daysLeft),"dd.MM.yyyy");
        },
        visitTypeRule: function(input) {
            var paymentType=that.get("visitData.paymentType");
            return "{0}: должен быть выбран для типа оплаты "+paymentType.name;
        }
    };
    var visitDataValidator=$(widgets.newVisitWindow.selector).find("form").first().kendoValidator({
        validateOnBlur: false,
        rules: {
            visitDate:validatorRules.visitDateRule,
            visitDateRuleMax: validatorRules.visitDateRuleMax,
            visitDateRuleMin: validatorRules.visitDateRuleMin,
            visitTypeRule:validatorRules.visitTypeRule
        },
        messages: {
            visitDateRule: validatorMessages.visitDateRule,
            visitDateRuleMax: validatorMessages.visitDateRuleMax,
            visitDateRuleMin: validatorMessages.visitDateRuleMin,
            visitTypeRule:validatorMessages.visitTypeRule
        }
    }).data("kendoValidator");

    var createTabStripsDataSource=function() {
        var content="<div class='visit-tab-content' style='font-weight:bold'>";
        var aNames=["Посещение","Услуги","Направления"];
        var aContents=["template-visit-main","template-visit-services","template-visit-schedules"];
        var aRet=[];
        for (var i=0;i<aNames.length;i++) {
            aRet.push({name:aNames[i],content:$("#"+aContents[i]).html()});
        }
        return aRet;
    };
    var onOpenVisit=function(data) {
        var that=this;
        this.set("selectedPerson",data.selectedPerson);
        this.set("selectedPersonType",data.selectedPersonType);
        this.set("mode",data.mode);

        var windowHeight=$(window).height()-60;
        var windowWidth=$(window).width()-60;
        widgets.visitWindow.widget.setOptions({width:windowWidth,height:windowHeight});
        widgets.visitWindow.widget.open().center();
        widgets.visitWindowTabStrip.widget.select(0);
        setTimeout(function() {
            var height=widgets.visitWindow.widget.options.height;
            $(widgets.visitWindow.selector+" .visit-tab-content").css("height",height-(100-16));
            if (that.get("mode")==="new") {
                that.set("visitData.paymentType",that.dataSources.paymentTypes[0]);
                widgets.newVisitWindow.widget.setOptions({width:800,height:600});
                widgets.newVisitWindow.widget.open().center();
            }
        },50);
    };
    var onNewVisitWindowActivate=function(e,window) {
        var selector=$(that.visitData.initiallySelectedSelector);
        $(selector).select();
        try {
            $(selector).focus();
        }
        catch(ex) {

        }
    };
    var onFieldChange=function(e) {
        var wnd=widgets.newVisitWindow.widget;
        if (e.field==="visitData.date") {
            if (!(wnd.element.is(":hidden"))) {
                visitDataValidator.validateInput("input[field=visitDate]");
            }
        }
        if (e.field==="visitData.isDnSt") {
            if (that.visitData.isDnSt) {
                that.set("visitData.dateLabel","Дата осмотра:");
            }
            else {
                that.set("visitData.dateLabel","Дата посещения:");
            }
        }
        if (e.field==="visitData.paymentType") {
            if (!that.visitData.paymentType) {
                that.set("visitData.isVisitTypeEnabled",false);
            }
            else {
                that.set("visitData.isVisitTypeEnabled",that.visitData.paymentType.isVisitType);
                if (!that.get("visitData.isVisitTypeEnabled")) {
                    that.set("visitData.visitType",null);
                    $(that.visitData.labelVisitTypeSelector).removeClass("label-required");
                }
                else {
                    $(that.visitData.labelVisitTypeSelector).removeClass("label-required").addClass(("label-required"));
                }
            }
            that.set("visitData.isDnSt",(that.visitData.paymentType.id==31));
            if (!(wnd.element.is(":hidden"))) {
                visitDataValidator.validateInput("input[field=visitType]");
            }
        }
        if (e.field==="visitData.visitType") {
            if (!(wnd.element.is(":hidden"))) {
                visitDataValidator.validateInput("input[field=visitType]");
            }
        }
    };
    var initControls=function() {
        widgets.visitWindow.widget=$(widgets.visitWindow.selector).kendoWindow({
            modal:true,
            animation:false
        }).data("kendoWindow");
        kendo.bind($(widgets.visitWindow.selector),that);
        widgets.newVisitWindow.widget=$(widgets.newVisitWindow.selector).kendoWindow({
            modal:true,
            animation:false,
            activate: function(e) {
                onNewVisitWindowActivate(e,this);
            }
        }).data("kendoWindow");
        //
        that.dataSources.tabStrips=createTabStripsDataSource();
        widgets.visitWindowTabStrip.widget=$(widgets.visitWindowTabStrip.selector).kendoTabStrip({
            animation: {
                open: {
                    effects: "none"
                }
            },
            dataTextField: "name",
            dataContentField: "content",
            dataSource: that.dataSources.tabStrips
        }).data("kendoTabStrip");
        kendo.bind($(widgets.newVisitWindow.selector).find("form").first(),that);
    }();

    that.bind("change",function(e) {
        onFieldChange(e);
    });
    // returns
    amplify.subscribe("openVisit",that,onOpenVisit);
    return that;
}
var visitModel=new VisitModel();

