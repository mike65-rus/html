/**
 * Created by STAR_06 on 18.11.2015.
 */
require.config({
    baseUrl: "html/StacDoct_main/app/",
    paths: {
/*        'main': 'main-build', */
        //packages
        'jquery': 'libs/jquery.min',
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
        'keyevent':"libs/keyevent",
		"rangy": "libs/rangy/rangy-core",
		"rangy-selectionsaverestore": "libs/rangy/rangy-selectionsaverestore"
    },
    shim: {
        'bootstrap': {deps: ['jquery']},
        'amplify': {deps: ['jquery'], exports: 'amplify'},
        'kendoCulture': {deps:['kendo.all.min']},
        'kendoMessages': {deps:['kendo.all.min']},
        'kendoHelpers': {deps:['kendo.all.min'], exports:'kendoHelpers'},
        'jqprint': {deps:['jquery']},
        'Math.uuid': {exports:'Math.uuid'},
        'keyevent': {exports:"KeyEvent"},
		'rangy-selectionsaverestore': { deps: ['rangy'] }
        /*
        'myDatePicker':{deps:['kendo']}

        'kendo/kendo.culture.ru-RU.min': {deps: ['kendo']},
        'kendo/kendo.messages.ru_RU.min': {deps: ['kendo']} */
    },
	map: {
    "rangy-selectionsaverestore": {
      "rangy-core": "rangy"
    },
	},
    priority: ['jquery','bootstrap','text', 'kendo.all.min', 'amplify', 'router', 'keyevent','app'],
//    jquery: '2.0.3',
    waitSeconds: 30
});

require([
    'ibViewer','bootstrap','jquery','kendo.all.min','underscore','amplify','alertify','keyevent'
], function(app,bootstrap,jquery,kendo,underscore,amplify,alertify,keyevent) {
    app.initialize();
});