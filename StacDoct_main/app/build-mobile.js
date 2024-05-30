({
    paths: {
        //packages
        'jquery': 'libs/jquery.min',
        'bootstrap': 'libs/bootstrap.min',
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
        'bootstrap': {deps: ['jquery']},
        'amplify': {deps: ['jquery'], exports: 'amplify'},
     'kendoCulture': {deps:['kendo.all.min']},
     'kendoMessages': {deps:['kendo.all.min']},
        'Math.uuid': {exports:'Math.uuid'},
    },
    optimize: "none",
    name: "main-mobile",
    findNestedDependencies: true,
    out:"main-mobile-build.js"
})