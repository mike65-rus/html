/**
 * Created by STAR_06 on 18.11.2015.
 */
require.config({
    baseUrl: "html/pk/app/",
    paths: {
/*        'main': 'main-build', */
        //packages
        'jquery': 'libs/jquery.min',
        'inputmask':'libs/jquery.maskedinput.min',
        'bootstrap': 'libs/bootstrap.min',
        'kendo.all.min': 'libs/kendo/js/kendo.all.min',
        'kendoCulture': 'libs/kendo/js/cultures/kendo.culture.ru-RU.min',
        'kendoMessages': 'libs/kendo/js/messages/kendo.messages.ru-RU.min',
        'kendoHelpers': 'libs/kendo/js/kendoHelpers',
        'kendo-template': 'libs/kendo-template',
        'myDatePicker': "widgets/myDatePicker",
        'text': 'libs/text',
        'domReady': 'libs/domReady',
        'amplify': 'libs/amplify.min',
        'alertify': 'libs/alertify/lib/alertify.min',
        'jqprint': 'libs/jqprint-0.3',
        'Math.uuid':'libs/Math.uuid',
        'underscore':'libs/underscore',
        'keyevent':"libs/keyevent"
    },
    shim: {
        'bootstrap': {deps: ['jquery']},
        'amplify': {deps: ['jquery'], exports: 'amplify'},
        "underscore": {
            exports: "_"
        },
        'inputmask': {
            deps: ['jquery'],
            exports: 'Inputmask'
        },
        /*
        'kendo.all.min': {deps: ['jquery','kendo.all.min'], exports: 'kendo'}, */
        'kendoCulture': {deps:['kendo.all.min']},
        'kendoMessages': {deps:['kendo.all.min']},
        'kendoHelpers': {deps:['kendo.all.min'], exports:'kendoHelpers'},
        'jqprint': {deps:['jquery']},
        'Math.uuid': {exports:'Math.uuid'},
        'keyevent': {exports:"KeyEvent"}
        /*
        'myDatePicker':{deps:['kendo']}

        'kendo/kendo.culture.ru-RU.min': {deps: ['kendo']},
        'kendo/kendo.messages.ru_RU.min': {deps: ['kendo']} */
    },
    priority: ['jquery','bootstrap','kendo.all.min','kendoCulture','kendoMessages','kendoHelpers',
        'text',  'inputmask', 'amplify', 'router', 'keyevent','app'],
//    jquery: '2.0.3',
    waitSeconds: 30
});

require([
    'app','bootstrap','jquery','kendo.all.min','underscore','amplify','alertify','keyevent'
], function(app,bootstrap,jquery,kendo,underscore,amplify,alertify,keyevent) {
    app.initialize();
});