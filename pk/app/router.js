/**
 * Created by STAR_06 on 18.11.2015.
 */
define(['kendo.all.min','services/proxyService'],function(kendo,proxy) {
    'use strict';
    var extData=null;
    var kendoView=null;
    var onHideView=function(e) {
        // console.log("View hide called");
        try {
            e.sender.destroy();
        }
        catch (ev) {}
    };
    var showHeaderAndFooter=function() {
        var header=$("#headerInfo");
        var footer=$("#simplefooter");
        $(header).removeClass("div-invisible");
        $(footer).removeClass("div-invisible");
    };
    var loadView = function(viewModel, view, container,delegate) {
        if (kendoView) {
//            proxy.publish("bofere")
        }
        kendoView = new kendo.View(view, { model: viewModel, hide: onHideView });
        if (container==undefined || (!container)) {
            container="#content";
        }
        layout.showIn(container, kendoView);
        if (delegate != undefined)
            delegate();
    };
    var onRouteMissing = function (e) {
        require(['text!views/pageNotFound.html'], function (view) {
            loadView(null, view, "", function () {
                $("#pageNotFound").html(e.url);
            });
        });
    };
    //
    var router = new kendo.Router({routeMissing: onRouteMissing});
    var layout = new kendo.Layout("<section id='content'></section>");
    layout.render($("#app"));
    var contentSelector="#content";
    //
    var onNavigateCommand= function(data) {
        if (typeof(data)=="string") {
            router.navigate(data);
        }
        else {
            var sPath=data.path;
            try {
                extData=data.data;
            }
            catch (ex) {
                extData=null;
            }
            router.navigate(sPath);
        }
    };
    var slashNavigationCommand =function() {
        showHeaderAndFooter();
        require(['viewModels/patientCardVm', 'text!views/patientCard.html'], function(viewModel,view) {
            loadView(viewModel, view, contentSelector,function() {
                proxy.publish("navigationToPatientCard",{id:null,page:null});
            });
        });
    };
    router.route("/show_results",function() {
        require(['viewModels/resultsVm', 'text!views/results.html'], function(viewModel,view) {
            loadView(viewModel, view, contentSelector,function() {
                var header=$("#headerInfo");
                var footer=$("#simplefooter");
                $(header).addClass("div-invisible").addClass("no-print");
                $(footer).addClass("div-invisible").addClass("no-print");
                viewModel.set("resultHtml","<div>Результаты не получены! "+new Date().toString()+"</div>");
                viewModel.set("resultHtml",extData);
            });
        });
    });
    router.route("/", function() {
        showHeaderAndFooter();
        slashNavigationCommand();
    });
    router.route("/about", function() {
        showHeaderAndFooter();
        require(['viewModels/aboutVm', 'text!views/about.html'], function(viewModel,view) {
            loadView(viewModel, view, contentSelector,function() {
                kendo.bind($("#about"),viewModel);
            });
        });
    });
    router.route("/patient_card(/:id)(/:page)(/*suffix)", function(id,page,suffix) {
        showHeaderAndFooter();
        require(['viewModels/patientCardVm', 'text!views/patientCard.html'], function(viewModel,view) {
            loadView(viewModel, view, contentSelector,function() {
                proxy.publish("navigationToPatientCard",{id:id,page:page,suffix:suffix});
            });
        });
    });


    proxy.subscribe("navigateCommand",onNavigateCommand);
    //
    return   router;
});