/**
 * Created by STAR_06 on 18.11.2015.
 */
require.config({
    baseUrl: "html/StacDoct_main/app/",
    paths: {
/*        'main': 'main-build', */
        //packages
        'jquery': 'libs/jquery.min',
        'kendo.all.min': 'libs/kendo/js/kendo.all.min',
        'kendoCulture': 'libs/kendo/js/cultures/kendo.culture.ru-RU.min',
        'kendoMessages': 'libs/kendo/js/messages/kendo.messages.ru-RU.min',
        'kendo-template': 'libs/kendo-template',
        'text': 'libs/text',
        'domReady': 'libs/domReady',
        'amplify': 'libs/amplify.min',
        'Math.uuid':'libs/Math.uuid',
        'underscore':'libs/underscore'
    },
    shim: {
        'amplify': {deps: ['jquery'], exports: 'amplify'},
        'kendoCulture': {deps:['kendo.all.min']},
        'kendoMessages': {deps:['kendo.all.min']},
        'Math.uuid': {exports:'Math.uuid'}
        /*
        'myDatePicker':{deps:['kendo']}

        'kendo/kendo.culture.ru-RU.min': {deps: ['kendo']},
        'kendo/kendo.messages.ru_RU.min': {deps: ['kendo']} */
    },
    priority: ['jquery','bootstrap','text', 'kendo.all.min', 'amplify','app-mobile'],
//    jquery: '2.0.3',
    waitSeconds: 30
});

var app;
require([
    'app-mobile','jquery','kendo.all.min','underscore','amplify'
], function(application,jquery,kendo,underscore,amplify) {
    app=application;
    app.initialize();
});