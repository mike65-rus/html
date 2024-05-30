/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min","services/proxyService",
        'kendo-template!templates/labCommentWindow',
        "utils"],
    function(kendo,proxy,editTemplateId,utils) {
        'use strict';
        var kendoWindow;
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            close:function(e) {
                kendoWindow.close();
            },
            showWindow: function(data) {
                if (!data) {
                    return;
                }
                var sTitle=data.pokazName;
                if (data.commentName) {
//                    sTitle=data.commentName;
                }
                viewModel.set("commentHtml",data.commentHtml);
                viewModel.set("srcHtml",data.srcHtml);
                viewModel.set("commentName",data.commentName);

                kendoWindow=$("<div id='labCommentWindow'/>").kendoWindow({
                    title: sTitle,
                    modal:true,
                    width:1000+10,
                    height:650,
                    animation:false,
/*                    animation:{
                        open:{effects:"fade:in",duration:1000*3}
                    }, */
                    content: {
                        template: $("#"+editTemplateId).html()
                    },
                    close: closeWindow
                }).data("kendoWindow");
                kendo.bind("#lab_comment_window",viewModel);
                kendoWindow.open().center();
            }

        });
        var closeWindow=function(e) {
            var selector="#labCommentWindow";
            kendo.unbind("#lab_comment_window");
            kendoWindow.destroy();
            $(selector).remove();
        };
        return viewModel;
    }
);