// Library to simplify implementation of Web Speech API.
// Library to simplify implementation of Web Speech API.

// Designed to allow overwriting of nearly all attributes and function callbacks
// to implement custom behavior.

// Create and return new WebSpeechRecognition object.
function WebSpeechRecognition() {
  var r = this;
  r.continuous = false;
  r.lang = 'ru-RU';
  r.maxAlternatives = 1;
  r.status_array = status_array_ru;
  r.image_array = image_array_mic;
  var recognizing = false;
  var ignore_onend;

  // Return false if speech recognition is unavailable. (Typically occurs
  // when using a browser that does not support it.)
  r.supported = function() {
    return !!r.recognition;
  };

  // Sets the object which will receive status as text messages.
  r.statusText = function(id) {
    r.status_elem = r.getElem(id);
    r.refreshState();
  };

  // Sets the object which will receive status as images.
  r.statusImage = function(id) {
    r.image_elem = r.getElem(id);
    r.refreshState();
  };

  // Sets the object which will receive final text results.
  r.finalResults = function(id) {
    r.final_results = r.getElem(id);
  };

  // Sets the object which will receive interim text results.
  r.interimResults = function(id) {
    r.interim_results = r.getElem(id);
  };

  // Return true if recognition is in progress.
  r.inProgress = function() {
    return recognizing;
  };

  // Start recognition.
  r.start = function() {
    recognizing = true;
    ignore_onend = false;
    r.final_transcript = '';
    r.setText(r.final_results, '');
    r.setText(r.interim_results, '');
    r.recognition.continuous = r.continuous;
    r.recognition.interimResults = !!r.interim_results;
    r.recognition.maxAlternatives = r.maxAlternatives;
    if (r.lang != '') {
      r.recognition.lang = r.lang;
    }
    r.recognition.start();
    r.onState('allow');
  };

  // Stop recognition.
  r.stop = function() {
    recognizing = false;
    r.recognition.stop();
  };

  // Toggle recognition between Start and Stop states.
  r.toggleStartStop = function() {
    if (reco.inProgress()) {
      reco.stop();
    } else {
      reco.start();
    }
  };



//
// All functions below are rarely called directly by the web page.
//

  r.onState = function(key) {
    r.onStatusChange(key);
    r.onImageChange(key);
    r.currentState = key;
  };

  r.refreshState = function() {
    r.onState(r.currentState);
  };

  // Set status field to text corresponding to key.  See status_array for valid
  // values of key.  An invalid value of key will hide the status message.
  r.onStatusChange = function(key) {
    if (!!r.status_elem) {
      var s = r.status_array[key];
      if (s) {
        r.setText(r.status_elem, s);
        r.status_elem.style.visibility = 'visible';
      } else {
        r.status_elem.style.visibility = 'hidden';
      }
    }
  };

  // Set button image corresponding to key. See image_array for valid values of
  // key.  An invalid value of key will show the image in its 'disable' state.
  r.onImageChange = function(key) {
    if (!!r.image_elem) {
      var f = r.image_array[key];
      if (!f) {
        f = r.image_array['disable'];
      }
      r.image_elem.src = f;
    }
  };

  r.setText = function(elem, text) {
    if (elem) {
      if (elem.nodeName == 'INPUT') {
        elem.value = text;
      } else {
      elem.innerHTML = r.linebreak(text);
      }
    }
  };

  // id is a DOM element or a string containing id or null.
  // Returns DOM element or null.
  r.getElem = function(id) {
    if (typeof(id) == 'string') {
      return document.getElementById(id);
    }
    return id;
  };

  var two_line = /\n\n/g;
  var one_line = /\n/g;
  r.linebreak = function(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
  };

  var first_char = /\S/;
  r.capitalize = function(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
  };
  // mike alekseev - Custom Grammar
  r.applyGrammar=function(sText) {
    var sRet=sText;
      
    sRet=sRet.replaceAll('<br class="k-br">',"<br>");

    sRet=sRet.replaceAll(" точка запятая",";");
    sRet=sRet.replaceAll(" Точка запятая",";");
    sRet=sRet.replaceAll(" Точка Запятая",";");
    sRet=sRet.replaceAll(" точка Запятая",";");

    sRet=sRet.replaceAll(" точка",".");
    sRet=sRet.replaceAll(" Точка",".");

    sRet=sRet.replaceAll(" запятая",",");
    sRet=sRet.replaceAll(" Запятая",",");

    sRet=sRet.replaceAll(" двоеточие",":");
    sRet=sRet.replaceAll(" Двоеточие",":");

    sRet=sRet.replaceAll(" дефис ","-");
    sRet=sRet.replaceAll(" Дефис ","-");
      sRet=sRet.replaceAll(" дефис","-");
      sRet=sRet.replaceAll(" Дефис","-");

      /*
      sRet=sRet.replaceAll(" тире "," -");
      sRet=sRet.replaceAll(" Тире "," -");
      sRet=sRet.replaceAll(" тире"," -");
      sRet=sRet.replaceAll(" Тире"," -");
        */

      sRet=sRet.replaceAll(" кавычки ",'"');
      sRet=sRet.replaceAll(" Кавычки ",'"');
      sRet=sRet.replaceAll(" кавычки",'"');
      sRet=sRet.replaceAll(" Кавычки",'"');

      sRet=sRet.replaceAll(" звездочка ",'*');
      sRet=sRet.replaceAll(" Звездочка ",'*');
      sRet=sRet.replaceAll(" звездочка",'*');
      sRet=sRet.replaceAll(" Звездочка",'*');

    sRet=sRet.replaceAll(" вопросительный знак","?");
    sRet=sRet.replaceAll(" Вопросительный знак","?");
    sRet=sRet.replaceAll(" Вопросительный Знак","?");
    sRet=sRet.replaceAll(" вопросительный Знак","?");

    sRet=sRet.replaceAll(" восклицательный знак","!");
    sRet=sRet.replaceAll(" Восклицательный знак","!");
    sRet=sRet.replaceAll(" восклицательный Знак","!");
    sRet=sRet.replaceAll(" Восклицательный Знак","!");

      sRet=sRet.replaceAll(" открыть скобку"," (");
      sRet=sRet.replaceAll(" Открыть скобку"," (");
      sRet=sRet.replaceAll(" открыть Скобку"," (");
      sRet=sRet.replaceAll(" Открыть Скобку"," (");

      sRet=sRet.replaceAll(" закрыть скобку",")");
      sRet=sRet.replaceAll(" Закрыть скобку",")");
      sRet=sRet.replaceAll(" закрыть Скобку",")");
      sRet=sRet.replaceAll(" Закрыть Скобку",")");

      sRet=sRet.replaceAll(" новая строка","\n");
    sRet=sRet.replaceAll(" Новая строка","\n");
    sRet=sRet.replaceAll("  "," ");

//    console.log(sRet);

    sRet=this.linebreak(sRet);
    sRet=sRet.replaceAll("<br><br>","<br>");
    sRet=sRet.replaceAll(" )",")");
    sRet=sRet.replaceAll("( ","(");
    sRet=makeUpperCaseAfterPeriod(sRet);
    sRet=makeUpperCaseAfterBr(sRet);
    sRet=sRet.trim().substr(0,1).toUpperCase()+sRet.trim().substr(1);
//    sRet=this.capitalize(sRet.trim());
      try {
          if (sRet.trim().substr(0,4)=="<br>") {
              sRet=sRet.trim().substr(4);
          }
      }
      catch (e) {

      }
    return sRet;

  }

  if (!('webkitSpeechRecognition' in window)) {
    r.onState('upgrade');
  } else {
    r.recognition = new webkitSpeechRecognition();
    r.final_transcript = '';
    r.interim_transcript = '';
    r.onState('ready');
    r.onEnd = null;

    r.recognition.onstart = function() {
      recognizing = true;
      r.onState('active');
    };

    r.recognition.onerror = function(event) {
      if (event.error == 'no-speech' ||
          event.error == 'audio-capture' ||
          event.error == 'not-allowed') {
        r.onState(event.error);
        ignore_onend = true;
      }
    };

    r.recognition.onend = function() {
      recognizing = false;
      if (ignore_onend) {
        return;
      }
      if (r.final_transcript == '') {
        r.onState('ready');
        return;
      }
      r.onState('complete');
      if (!!r.onEnd) {
        r.onEnd();
      }
    };

    r.recognition.onresult = function(event) {
      r.interim_transcript = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          r.final_transcript += event.results[i][0].transcript;
        } else {
          r.interim_transcript += event.results[i][0].transcript;
        }
      }
      r.final_transcript = r.capitalize(r.final_transcript);
      r.setText(r.final_results, r.final_transcript);
      r.setText(r.interim_results, r.interim_transcript);
      if (!!r.onResult) {
        r.onResult(event);
      }
    };
  }
}

// Informational text that is displayed for each status condition.
// {key : display_text, key : display_text, ...}
var status_array_en = {
    'ready' : 'Click on the microphone icon and begin speaking.',
    'active' : 'Speak now.',
    'no-speech' : 'No speech was detected. You may need to adjust your ' +
        '<a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892">' +
        ' microphone settings</a>.',
    'audio-capture' :
        'No microphone was found. Ensure that a microphone is installed and that ' +
            '<a href="//support.google.com/chrome/bin/answer.py?hl=en&amp;answer=1407892">' +
            ' microphone settings</a> are configured correctly.',
    'allow' : 'Click the "Allow" button above to enable your microphone.',
    'not-allowed' : 'Permission to use microphone is denied. To change, go to ' +
        'chrome://settings/contentExceptions#media-stream',
    'upgrade' : 'Web Speech API is not supported by this browser.  Upgrade to ' +
        '<a href="//www.google.com/chrome">Chrome</a>.'
};

var status_array_ru = {
  'ready' : 'Для начала разговора нажмите на изображение микрофона.',
  'active' : 'Говорите.',
  'no-speech' : 'Речь не опознана. Возможно, нужно изменить ' +
      '<a href="//support.google.com/chrome/bin/answer.py?hl=ru&amp;answer=1407892" target="_blank">' +
      ' настройки микрофона</a>.',
  'audio-capture' :
      'Микрофон не найден. Убедитесь, что микрофон подключен ' +
      '<a href="//support.google.com/chrome/bin/answer.py?hl=ru&amp;answer=1407892" target="_blank">' +
      '</a> и правильно сконфигурирован.',
  'allow' : 'Нажмите на кнопку "Разрешить" для использования микрофона.',
   /*
  'not-allowed' : 'Доступ к микрофону отклонен.' +
      '<a href="#" onclick="createMicTab()"> Для изменения перейдите по ссылке</a>',
   */
  'not-allowed' : 'В доступе к микрофону отказано! Настройка на странице: chrome://settings/contentExceptions#media-stream' +
        ' или нажмите на значок видеокамеры в адресной строке браузера',
  'upgrade' : 'Web Speech API не поддерживается вашим браузером.  Обновите браузер ' +
      '<a href="//www.google.com/chrome" target="_blank">Chrome</a>.'
};

// Button images for various status conditions.
var image_array_mic = {
  'ready' : 'html/images/mic.gif',
  'complete' : 'html/images/mic.gif',
  'active' : 'html/images/mic-animate.gif',
  'no-speech' : 'html/images/mic.gif',
  'disable' : 'html/images/mic-slash.gif'
};

/*
function createMicTab() {
    try {
    chrome.tabs.create({url:"chrome://settings/contentExceptions#media-stream"});
    }
    catch (e) {

    }

}
*/