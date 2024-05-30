define(["jquery", "kendo.all.min",'text!views/mobile/index.html','viewModels/mobile/appVm','protoExtenderMobile'],
    function ($, kendo,view,viewModel,protoExtender) {
    kendo.culture("ru-RU");
    var existingView;
    existingView=$("#mobile-layout");
        if (!(existingView.length)) {
            $(view).appendTo("body");
        }
        /*
    existingView=$("#index-view");
    if (!(existingView.length)) {
        $(view).appendTo("body");
    }
    existingView=$("settings-view");
    if (!(existingView.length)) {
        $(view).appendTo("body");
    }
    existingView=$("mypatients-view");
    if (!(existingView.length)) {
        $(view).appendTo("body");
    }
    */
    window.layoutInit=function() {
        var location=window.location;
        var sUrl=/*location.origin+location.pathname+*/"?action=LogOut";
//        $("#exit-link").attr("href",sUrl);
    };
    window.myPatients=function() {
        return viewModel.myPatients();
    };
    window.myPatientsShow=function() {
        return viewModel.myPatientsShow();
    };
    window.isPatientAvailable=function() {
        return (viewModel && viewModel.get("selectedIb"));
    };
    window.patientBeforeShow=function(e) {
        var view=e.sender;
        var viewParams=view.params;
        if (!isPatientAvailable()) {
            e.preventDefault();
            try {
                window._kendoApplication.navigate("#index-view");
            }
            catch (ex) {}
            return false;
        }
        kendo.bind($("#patient-div"),viewModel);
    };
    window.kdlBeforeShow=function(e) {
        if (!isPatientAvailable()) {
            e.preventDefault();
            try {
                window._kendoApplication.navigate("#index-view");
            }
            catch (ex) {}
            return false;
        }
        return viewModel.readKdl();
    };
    window.ldoBeforeShow=function(e) {
        if (!isPatientAvailable()) {
            e.preventDefault();
            try {
                window._kendoApplication.navigate("#index-view");
            }
            catch (ex) {}
            return false;
        }
        return viewModel.readLdo();
    };
    window.docsBeforeShow=function(e) {
        if (!isPatientAvailable()) {
            e.preventDefault();
            try {
                window._kendoApplication.navigate("#index-view");
            }
            catch (ex) {}
            return false;
        }
        return viewModel.readDocs();
    };
    window.docBeforeShow=function(e) {
        if (!isPatientAvailable()) {
            e.preventDefault();
            window._kendoApplication.navigate("#index-view");
            return false;
        }
        return viewModel.readDoc();
    };
    window.onBeforeUnload=function(e) {
//        e.returnValue='Вы действительно хотите выйти?';
//        return e.returnValue;
    };
    return {
        initialize: function () {
            kendo.bind($("#index-view"),viewModel);
            kendo.bind($("#settings-view"),viewModel);
            kendo.bind($("#mypatients-view"),viewModel);
            window.backButtonClickCont=0;
            window.serviceWorkerRegistered=localStorage.getItem("serviceWorkerRegistered");
            /*
            window.history.pushState(null,null,"#exit-view");
            window.history.pushState(null,null,"#index-view");
            */
            window.addEventListener("beforeunload",onBeforeUnload);
            window._kendoApplication = new kendo.mobile.Application(document.body,
                { transition: "slide",
                    skin:viewModel.get("currentSkin")  });
//            window._kendoApplication.navigate("#index-view");
            /*
            document.addEventListener("backbutton", function (e) {
                if (!window.backButtonClickCont) {
                    kendo.confirm("Нажмите 'backButton' еще раз чтобы выйти из приложения!").then(function(){
                        window.backButtonClickCont++;
                    },function() {
                        window.backButtonClickCont=0;
                    });
                    e.preventDefault();
                    return false;
                }
            }, false );
            */
        }
    }
});