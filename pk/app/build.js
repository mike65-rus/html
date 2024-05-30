({
    paths: {
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
            'keyevent':"libs/keyevent"


    },
    shim: {
        'bootstrap': {deps: ['jquery']},
        'amplify': {deps: ['jquery'], exports: 'amplify'},
        /*
        'kendo': {deps: ['jquery'], exports: 'kendo'},
        'kendoCulture': {deps: ['kendo']},
        'kendoMessages': {deps: ['kendo']},
        'kendoHelpers': {deps: ['kendo'], exports: 'kendoHelpers'}, */
        'jqprint': {deps:['jquery']},
        'Math.uuid': {exports:'Math.uuid'},
        'keyevent': {exports:"KeyEvent"}

    },
    optimize: "none",
    name: "main",
    findNestedDependencies: true,
    out:"main-build.js"
})