/**
 * Created by 1 on 06.12.2015.
 */
define(["kendo.all.min",
        'viewModels/medicamOstatReportVm',
        'viewModels/linksWindowVm',
        'viewModels/dictofon',
        'viewModels/mkbKsgChooserVm',
        'viewModels/pacsWindowVm',
        'services/cadesService'
    ],
    function(kendo,medicamOstatReport,linksWindow,dictofon,mkbKsgChooser,pacsWindow,cadesService) {
        'use strict';
        var viewModel;
        viewModel= new kendo.data.ObservableObject({
            openPacs: function(e) {
                pacsWindow.open();
                e.preventDefault();
            },
            medicamOstatReport: function(e) {
                medicamOstatReport.open();
                e.preventDefault();
            },
            openLinks: function(e) {
                linksWindow.open();
                e.preventDefault();
            },
            openDictofon: function(e) {
                dictofon.open();
                e.preventDefault();
            },
            openMkbKsgChooser: function(e) {
                mkbKsgChooser.open({dnst:-1,otd:""});
                e.preventDefault();
            },
            openSignTest: function(e) {
                cadesService.test();
                e.preventDefault();
            }
        });
        return viewModel;
    }
);