/**
 * Created by 1 on 14.04.2018.
 */
define(['kendo.all.min','kendo-template!views/results','services/proxyService','utils'],
    function(kendo,viewId,proxy,utils) {
        'use strict';
        var viewModel= new kendo.data.ObservableObject({
            resultHtml:"",
            wordHtml:"",
            wordMode:false,
            isHtmlVisible:true,
            isWordVisible:false,
            switchTitle:"Переключиться в режим выделения таблиц",
            switchHtml:"<span class='k-icon k-i-table k-icon-24'></span>",
            print: function() {
                window.print();
            },
            goBack: function() {
                history.go(-1);
            },
            changeMode: function(e) {
                viewModel.set("wordMode",!(viewModel.wordMode));
            }
        });
        kendo.bind($("#html_div"),viewModel);
        setTimeout(function() {
            utils.setDocHeight($("#html_results"));
        },100);

        var createWordSelectable=function(sHtml) {
            var $labDivs=$(sHtml).filter("div.lab-table-div");
            if ($labDivs.length==0) {
                viewModel.set("wordHtml","");
                return;
            }
            var divDst=$("#tmp-result");
            $(divDst).html(sHtml);
            var $labDivs=$(divDst).find("div.lab-table-div");
            for (var i=0;i<$labDivs.length;i++) {
                var $labTable=$($labDivs[i]).find("table.lab-table").first();
                var $labSubtables=$($labDivs[i]).find("table.subtable");
                for (var j=0; j<$labSubtables.length;j++) {
                    var $labSub=$($labSubtables[j]);
                    $.each($labSub.find("tr"),function(idx,val) {
                            $labTable.find("tr:last").after("<tr>"+$(val).html()+"</tr>");
                        }
                    );
                };
                $($labDivs[i]).find("table.subtable").remove();
                $($labDivs[i]).attr("id",$($labDivs[i]).attr("id")+"-wrd");
                var sId=$($labDivs[i]).attr("id");
                var sHtml="<button ids='"+sId+"' rel='tooltip' title='Выделить таблицу'  class='k-button btn-select' type='button'> <i class='fa fa-table'></i></button>";
                sHtml="<div class='no-print form toolbar pull-left k-content'>"+sHtml+"</div>";
                $($labDivs[i]).before(sHtml);
            };
            //
            viewModel.set("wordHtml",$(divDst).html());
            //
            setTimeout(function() {
                $("#word_results").find(".btn-select").on("click",function(e) {
                    var sId= $(e.target).attr("ids");
                    if (!sId) {
                        // click on <i> tag
                        sId= $(e.target.parentElement).attr("ids");
                    }
                    if (sId) {
                        utils.selectElementContents( $("#"+sId).find("table:first").first().get(0));
                    }
                });

            },10);
        };

        var onVmChange=function(e) {
            if (e.field=="resultHtml") {
                viewModel.set("wordMode",0);
                createWordSelectable(viewModel.resultHtml);
            }
            if (e.field=="wordMode") {
                if (viewModel.wordMode) {
                    viewModel.set("isHtmlVisible",false);
                    viewModel.set("isWordVisible",true);
                    viewModel.set("switchTitle","Переключиться в режим просмотра");
                    viewModel.set("switchHtml","<span class='k-icon k-i-file-bac k-icon-24'></span>");

                }
                else {
                    viewModel.set("isHtmlVisible",true);
                    viewModel.set("isWordVisible",false);
                    viewModel.set("switchTitle","Переключиться в режим выделения таблиц");
                    viewModel.set("switchHtml","<span class='k-icon k-i-table k-icon-24'></span>");
                }
            }
        };
        viewModel.bind("change",onVmChange);

        return viewModel;
    }
);