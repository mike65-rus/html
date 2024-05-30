({
    paths: {
        //packages
        'jquery': 'libs/jquery.min',
            'bootstrap': 'libs/bootstrap.min',
        'kendo.all.min': 'libs/kendo/js/kendo.all.min',
        'kendoCulture': 'libs/kendo/js/cultures/kendo.culture.ru-RU.min',
        'kendoMessages': 'libs/kendo/js/messages/kendo.messages.ru-RU.min',
            'kendoHelpers': 'libs/kendo/kendoHelpers',
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
    },
    map: {
        "rangy-selectionsaverestore": {
            "rangy-core": "rangy"
        }
    },
    optimize: "none",
    name: "main",
    findNestedDependencies: true,
    out:"main-build.js"
})