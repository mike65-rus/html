define(["kendo.all.min",
    'dataSources/ksgUslDataSource',
    'kendo-template!views/ksgUslChooser',
    'utils',
    'services/proxyService'],
    function(kendo,ksgUslDs,viewId,utils,proxy) {
        var ds=ksgUslDs;
        var kendoWindow;
        var ksg;
        var listSelector="#usl-chooser-list";
        var closeWindow=function() {
            var selector="#ksgUslChooserDialog";
            kendo.unbind(selector);
            kendoWindow.destroy();
            $(selector).remove();
        };
        onRowDblClick=function(e) {
          viewModel.doChoose(e);
        };
        var createUslListHtml=function(data) {
            var sHtml;
            var aUslList=data.usl_list;
            sHtml="<table width='99%'  border='1' cellspacing=0 style='border-collapse:collapse;cell-padding:2px;'>";
            var iTotal=ds.total();
            var iCnt=0;
            for (var i=0;i<iTotal;i++) {
                iCnt=iCnt+1;
                var sColor="d0";
                if ((iCnt % 2)==0) {
                    sColor="d1";
                }
                var item=ds._data[i];
                viewModel.set("ksgText",item.ksg_code+" - "+item.ksg_name);
                var sId="chkUsl_"+ i.toString();
                var sName="<input id='"+sId+"' type='checkbox' class='k-checkbox' data-code='"+item.code+"'/>";
                sName=sName+"<label class='k-checkbox-label' for='"+sId+"'>"+item.name+"</label>";
                sHtml=sHtml+"<tr>";
                sHtml=sHtml+"<td width='20%' class='"+sColor+"'>"+item.code+"</td>";
                sHtml=sHtml+"<td width='80%' class='"+sColor+"' data-code='"+item.code+"'>"+sName+"</td>";
                sHtml=sHtml+"</tr>"
            }
            sHtml=sHtml+"</table>";
            $(listSelector).html(sHtml);
            $(listSelector).find("input:checkbox").each(function(i,el) {
                var uslCode = $(el).attr("data-code");
                if (aUslList.indexOf(uslCode) >= 0) {
                    $(el).prop("checked", true);
                }
            });
        };
        var viewModel= new kendo.data.ObservableObject({
            ksgText:"",
            open: function (data) {
                ksg = data.ksg;
                var wndDiv = $("<div id='ksgUslChooserDialog'/>");
                kendoWindow = $(wndDiv).kendoWindow({
                    title: "Выбор услуг/манипуляций",
                    modal: true,
                    content: {
                        template: $("#" + viewId).html()
                    },
                    close: closeWindow
                }).data("kendoWindow");
                kendo.bind($(wndDiv), viewModel);
                kendoWindow.center().open();
                setTimeout(function () {
                    var selector="#ksgUslChooserDialog";
                    kendo.ui.progress($(selector),true);
                    ds.read(data)
                        .then(function() {
                            kendo.ui.progress($(selector),false);
                            createUslListHtml(data);
                        })
                    }
                    , 10);
            },
            doClose: function(e) {
                kendoWindow.close();
            },
            doChoose: function(e) {
                var aUslList=[];
                $(listSelector).find("input:checkbox").each(function(i,el) {
                    if ($(el).prop("checked")) {
                        aUslList.push($(el).attr("data-code"));
                    }
                });
                viewModel.doClose();
                proxy.publish("ksgUslSelected",{ksg:ksg,usl_list:aUslList});
            }
        });
        return viewModel;
    }
);
