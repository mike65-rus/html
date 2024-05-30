define(["kendo.all.min",
    'dataSources/mkbSokrDataSource',
    'kendo-template!views/mkbSokrChooser',
    'utils',
    'services/proxyService',
    'jqprint'],
    function(kendo,mkbSokrDs,viewId,utils,proxy,jqprint) {
        var ds=mkbSokrDs;
        var kendoWindow;
        var gridSelector="#sokr-chooser-grid";
        var closeWindow=function() {
            var selector="#mkbSokrChooserDialog";
            kendo.unbind(selector);
            kendoWindow.destroy();
            $(selector).remove();
        };
        onRowDblClick=function(e) {
          viewModel.doChoose(e);
        };
        var viewModel= new kendo.data.ObservableObject({
            dataSource:ds,
            open: function (data) {
                viewModel.dataSource.filter({});
                var wndDiv = $("<div id='mkbSokrChooserDialog'/>");
                kendoWindow = $(wndDiv).kendoWindow({
                    title: "Выбор сокращения",
                    modal: true,
                    content: {
                        template: $("#" + viewId).html()
                    },
                    close: closeWindow
                }).data("kendoWindow");
                kendo.bind($(wndDiv), viewModel);
                kendoWindow.center().open();
                setTimeout(function() {
                    var grid=$(gridSelector).data("kendoGrid");
                    if (grid) {
                        grid.tbody.on('dblclick',"tr",onRowDblClick);
                    }
                },10);
            },
            doClose: function(e) {
                kendoWindow.close();
            },
            doChoose: function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                var rows=grid.select();
                if (rows && rows.length) {
                    var selectedItem=grid.dataItem(rows[0]);
                    viewModel.doClose();
                    proxy.publish("mkbSokrSelected",{sokr:selectedItem.sokr});
                }
            },
            doPrint: function(e) {
                var grid=$(gridSelector).data("kendoGrid");
                grid.dataSource.filter({});
                var pDiv=$("#sokr-chooser-print");
                pDiv.html("");
                var ds=grid.dataSource;
                var sHtml="<TABLE BORDER='1' CELLSPACING=0 style='width:100%;table-layout:fixed;border-collapse: collapse;'>";
                sHtml=sHtml+"<col width='85%'/>";
                sHtml=sHtml+"<col width='15%'/>";
                var data=ds.data();
                for (var i=0;i<data.length;i++) {
                    sHtml=sHtml+"<tr>";
                    sHtml=sHtml+"<td style='padding:4px;'>"+data[i].name+"</td>";
                    sHtml=sHtml+"<td style='padding:4px;'>"+data[i].sokr+"</td>";
                    sHtml=sHtml+"</tr>";
                }
                sHtml=sHtml+"</TABLE>";
                pDiv.html(sHtml);
                pDiv.jqprint();
            }
        });
        return viewModel;
    }
);
