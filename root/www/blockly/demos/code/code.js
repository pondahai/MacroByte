/**
 * Blockly Demos: Code
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Code demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Code = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
  'ar': 'العربية',
  'be-tarask': 'Taraškievica',
  'br': 'Brezhoneg',
  'ca': 'Català',
  'cs': 'Česky',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'es': 'Español',
  'et': 'Eesti',
  'fa': 'فارسی',
  'fr': 'Français',
  'he': 'עברית',
  'hrx': 'Hunsrik',
  'hu': 'Magyar',
  'ia': 'Interlingua',
  'is': 'Íslenska',
  'it': 'Italiano',
  'ja': '日本語',
  'ko': '한국어',
  'mk': 'Македонски',
  'ms': 'Bahasa Melayu',
  'nb': 'Norsk Bokmål',
  'nl': 'Nederlands, Vlaams',
  'oc': 'Lenga d\'òc',
  'pl': 'Polski',
  'pms': 'Piemontèis',
  'pt-br': 'Português Brasileiro',
  'ro': 'Română',
  'ru': 'Русский',
  'sc': 'Sardu',
  'sk': 'Slovenčina',
  'sr': 'Српски',
  'sv': 'Svenska',
  'ta': 'தமிழ்',
  'th': 'ภาษาไทย',
  'tlh': 'tlhIngan Hol',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'vi': 'Tiếng Việt',
  'zh-hans': '简体中文',
  'zh-hant': '正體中文'
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = ['ar', 'fa', 'he', 'lki'];

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
Code.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function() {
  var lang = Code.getStringParamFromUrl('lang', '');
  if (Code.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'en';
  }
  return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function() {
  return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    // An href with #key trigers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
  } else if (loadOnce) {
    // Language switching stores the blocks during the reload.
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  } else if ('BlocklyStorage' in window) {
    // Restore saved blocks in a separate thread so that subsequent
    // initialization is not affected from a failed load.
    window.setTimeout(BlocklyStorage.restoreBlocks, 0);
  }
};

/**
 * Save the blocks and reload with a different language.
 */
Code.changeLanguage = function() {
  // Store the blocks for the duration of the reload.
  // This should be skipped for the index page, which has no blocks and does
  // not load Blockly.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (typeof Blockly != 'undefined' && window.sessionStorage) {
    var xml = Blockly.Xml.workspaceToDom(Code.workspace);
    var text = Blockly.Xml.domToText(xml);
    window.sessionStorage.loadOnceBlocks = text;
  }

  var languageMenu = document.getElementById('languageMenu');
  var newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Code.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
Code.importPrettify = function() {
  //<link rel="stylesheet" href="../prettify.css">
  //<script src="../prettify.js"></script>
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', '../prettify.css');
  document.head.appendChild(link);
  var script = document.createElement('script');
  script.setAttribute('src', '../prettify.js');
  document.head.appendChild(script);
};

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
Code.getBBox_ = function(element) {
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  return {
    height: height,
    width: width,
    x: x,
    y: y
  };
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();

/**
 * List of tab names.
 * @private
 */
//Code.TABS_ = ['blocks', 'javascript', 'php', 'python', 'dart', 'lua', 'xml'];
Code.TABS_ = ['blocks', 'python', 'xml'];

Code.selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function(clickedName) {
  // If the XML tab was open, save and render the content.
  if (document.getElementById('tab_xml').className == 'tabon') {
    var xmlTextarea = document.getElementById('content_xml');
    var xmlText = xmlTextarea.value;
    var xmlDom = null;
    try {
      xmlDom = Blockly.Xml.textToDom(xmlText);
    } catch (e) {
      var q =
          window.confirm(MSG['badXml'].replace('%1', e));
      if (!q) {
        // Leave the user on the XML tab.
        return;
      }
    }
    if (xmlDom) {
      Code.workspace.clear();
      Blockly.Xml.domToWorkspace(xmlDom, Code.workspace);
    }
  }

  if (document.getElementById('tab_blocks').className == 'tabon') {
    Code.workspace.setVisible(false);
  }
  // Deselect all tabs and hide all panes.
  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    document.getElementById('tab_' + name).className = 'taboff';
    document.getElementById('content_' + name).style.visibility = 'hidden';
  }

  // Select the active tab.
  Code.selected = clickedName;
  document.getElementById('tab_' + clickedName).className = 'tabon';
  // Show the selected pane.
  document.getElementById('content_' + clickedName).style.visibility =
      'visible';
  Code.renderContent();
  if (clickedName == 'blocks') {
    Code.workspace.setVisible(true);
  }
  Blockly.svgResize(Code.workspace);
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
  var content = document.getElementById('content_' + Code.selected);
  // Initialize the pane.
  if (content.id == 'content_xml') {
    var xmlTextarea = document.getElementById('content_xml');
    var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    xmlTextarea.value = xmlText;
    xmlTextarea.focus();
  } else if (content.id == 'content_javascript') {
    var code = Blockly.JavaScript.workspaceToCode(Code.workspace);
    content.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = content.textContent;
      code = prettyPrintOne(code, 'js');
      content.innerHTML = code;
    }
  } else if (content.id == 'content_python') {
    code = Blockly.Python.workspaceToCode(Code.workspace);
    content.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = content.textContent;
      code = prettyPrintOne(code, 'py');
      content.innerHTML = code;
    }
  } else if (content.id == 'content_php') {
    code = Blockly.PHP.workspaceToCode(Code.workspace);
    content.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = content.textContent;
      code = prettyPrintOne(code, 'php');
      content.innerHTML = code;
    }
  } else if (content.id == 'content_dart') {
    code = Blockly.Dart.workspaceToCode(Code.workspace);
    content.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = content.textContent;
      code = prettyPrintOne(code, 'dart');
      content.innerHTML = code;
    }
  } else if (content.id == 'content_lua') {
    code = Blockly.Lua.workspaceToCode(Code.workspace);
    content.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = content.textContent;
      code = prettyPrintOne(code, 'lua');
      content.innerHTML = code;
    }
  }
};
/**
 *
 */
// function getFileFromServer(url, doneCallback) {
//     var xhr;
//
//     xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = handleStateChange;
//     xhr.open("GET", url, true);
//     xhr.send();
//
//     function handleStateChange() {
//         if (xhr.readyState === 4) {
//             doneCallback(xhr.status == 200 ? xhr.responseText : null);
//         }
//     }
// }
/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
  Code.initLanguage();

  var rtl = Code.isRtl();
  var container = document.getElementById('content_area');
  var onresize = function(e) {
    var bBox = Code.getBBox_(container);
    for (var i = 0; i < Code.TABS_.length; i++) {
      var el = document.getElementById('content_' + Code.TABS_[i]);
      el.style.top = bBox.y + 'px';
      el.style.left = bBox.x + 'px';
      // Height and width need to be set, read back, then set again to
      // compensate for scrollbars.
      el.style.height = bBox.height + 'px';
      el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
      el.style.width = bBox.width + 'px';
      el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
    }
    // Make the 'Blocks' tab line up with the toolbox.
    if (Code.workspace && Code.workspace.toolbox_.width) {
      document.getElementById('tab_blocks').style.minWidth =
          (Code.workspace.toolbox_.width - 38) + 'px';
          // Account for the 19 pixel margin and on each side.
    }
  };
  window.addEventListener('resize', onresize, false);

  // The toolbox XML specifies each category name using Blockly's messaging
  // format (eg. `<category name="%{BKY_CATLOGIC}">`).
  // These message keys need to be defined in `Blockly.Msg` in order to
  // be decoded by the library. Therefore, we'll use the `MSG` dictionary that's
  // been defined for each language to import each category name message
  // into `Blockly.Msg`.
  // TODO: Clean up the message files so this is done explicitly instead of
  // through this for-loop.
  for (var messageKey in MSG) {
    if (messageKey.startsWith('cat')) {
      Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
    }
  }

  // Construct the toolbox XML.
  var toolboxText = document.getElementById('toolbox').outerHTML;
  var toolboxXml = Blockly.Xml.textToDom(toolboxText);

  Code.workspace = Blockly.inject('content_blocks',
      {grid:
          {spacing: 25,
           length: 3,
           colour: '#ccc',
           snap: true},
       media: '../../media/',
       rtl: rtl,
       toolbox: toolboxXml,
       zoom:
           {controls: true,
            wheel: true}
      });

  // Add to reserved word list: Local variables in execution environment (runJS)
  // and the infinite loop detection function.
  Blockly.JavaScript.addReservedWords('code,timeouts,checkTimeout');

  // dahai: auto load from board when init
  // getFileFromServer("/save/macrobyte.xml", function(text) {
  //     if (text === null) {
  //         // An error occurred
  //       Code.loadBlocks('');
  //     }
  //     else {
  //         // `text` is the file text
  //       console.log(text);
  //       Code.loadBlocks(text);
  //     }
  // });
  Code.loadBlocks('');


  if ('BlocklyStorage' in window) {
    // Hook a save function onto unload.
    // dahai: disable local storage
    // BlocklyStorage.backupOnUnload(Code.workspace);
  }

  Code.tabClick(Code.selected);

  Code.bindClick('folderButton', Code.importScript);
  Code.bindClick('uploadScriptButton', Code.uploadScript);
  Code.bindClick('trashButton',
      function() {Code.discard(); Code.renderContent();});
  // Code.bindClick('runButton', Code.runJS);
  // Disable the link button if page isn't backed by App Engine storage.
  var linkButton = document.getElementById('linkButton');
  if ('BlocklyStorage' in window) {
    BlocklyStorage['HTTPREQUEST_ERROR'] = MSG['httpRequestError'];
    BlocklyStorage['LINK_ALERT'] = MSG['linkAlert'];
    BlocklyStorage['HASH_ERROR'] = MSG['hashError'];
    BlocklyStorage['XML_ERROR'] = MSG['xmlError'];
    Code.bindClick(linkButton,
        function() {BlocklyStorage.link(Code.workspace);});
  } else if (linkButton) {
    linkButton.className = 'disabled';
  }

  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    Code.bindClick('tab_' + name,
        function(name_) {return function() {Code.tabClick(name_);};}(name));
  }
  onresize();
  Blockly.svgResize(Code.workspace);

  // Lazy-load the syntax-highlighting.
  window.setTimeout(Code.importPrettify, 1);

};

/**
 * Initialize the page language.
 */
Code.initLanguage = function() {
  // Set the HTML's language and direction.
  var rtl = Code.isRtl();
  document.dir = rtl ? 'rtl' : 'ltr';
  document.head.parentElement.setAttribute('lang', Code.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var lang in Code.LANGUAGE_NAME) {
    languages.push([Code.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  var languageMenu = document.getElementById('languageMenu');
  languageMenu.options.length = 0;
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang == Code.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
  languageMenu.addEventListener('change', Code.changeLanguage, true);

  // Inject language strings.
  document.title += ' ' + MSG['title'];
  //document.getElementById('title').textContent = MSG['title'];
  document.getElementById('tab_blocks').textContent = MSG['blocks'];

  document.getElementById('linkButton').title = MSG['linkTooltip'];
  // document.getElementById('runButton').title = MSG['runTooltip'];
  document.getElementById('trashButton').title = MSG['trashTooltip'];
  document.getElementById('uploadScriptButton').title = MSG['uploadTooltip'];
  document.getElementById('folderButton').title = MSG['folderTooltip'];
};

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  Catch infinite loops.
 */
Code.runJS = function() {
  Blockly.JavaScript.INFINITE_LOOP_TRAP = '  checkTimeout();\n';
  var timeouts = 0;
  var checkTimeout = function() {
    if (timeouts++ > 1000000) {
      throw MSG['timeout'];
    }
  };
  var code = Blockly.JavaScript.workspaceToCode(Code.workspace);
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
  try {
    eval(code);
  } catch (e) {
    alert(MSG['badCode'].replace('%1', e));
  }
};


/**
 *   dahai 下載程式碼，download the last xml
 */
Code.importScript = function() {
  //window.location.replace('http://macrobyte.local/blockly/demos/code/#last');
  //window.location.reload();
  var fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('id', 'fileselect');
  fileSelector.setAttribute('name', 'files[]');
  fileSelector.click();

  fileSelector.addEventListener('change', handleFileSelect, false);

};
function handleFileSelect(evt) {
   var files = evt.target.files; // FileList object

   var file = files[0];
   //
   var reader = new FileReader();
   reader.onloadend = function(evt) {
         if (evt.target.readyState == FileReader.DONE) { // DONE == 2
           //console.log(evt.target);
           Code.workspace.clear();
           var xml = Blockly.Xml.textToDom(evt.target.result);
           Blockly.Xml.domToWorkspace(xml, Code.workspace);

         }
       };

   reader.readAsText(file);
   var projectName = file.name.substr(0, file.name.lastIndexOf('.')) || file.name;
   document.getElementById("projectname").value = projectName;
};
/**
 *   dahai 上傳程式碼，以及上傳xml
 */
Code.uploadScript = function() {
	var code = Blockly.Python.workspaceToCode(Code.workspace);
	Code.post('/cgi-bin/runPython', {pythonCode: code});
	//alert(code);
  // save xml at the same time
  BlocklyStorage.link(Code.workspace);
};

/**
 * Discard all blocks from the workspace.
 */
Code.discard = function() {
  var count = Code.workspace.getAllBlocks().length;
  if (count < 2 ||
      window.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1', count))) {
    Code.workspace.clear();
		document.getElementById("projectname").value = '';
    if (window.location.hash) {
      window.location.hash = '';
    }
  }
};

/**
 *   dahai 上傳副程式
 */

//function post(path, params, method) {
Code.post = function(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.
    console.log("post");
    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("target", "hidden-form");

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
	var iframe = document.createElement("iframe");
	iframe.setAttribute("style", "display:none");
	iframe.setAttribute("name", "hidden-form");
    document.body.appendChild(iframe);
    form.submit();
}

/**
 *
 */
Blockly.Python['websocket_'] = function(block) {
  Blockly.Python.definitions_.import_websocket_server = "from websocket_server import WebsocketServer";
  Blockly.Python.definitions_.import_thread = "import thread";
  var variable_client = Blockly.Python.variableDB_.getName(block.getFieldValue('client'), Blockly.Variables.NAME_TYPE);
  var variable_server = Blockly.Python.variableDB_.getName(block.getFieldValue('server'), Blockly.Variables.NAME_TYPE);
  var variable_message = Blockly.Python.variableDB_.getName(block.getFieldValue('message'), Blockly.Variables.NAME_TYPE);
  var statements_message_received = Blockly.Python.statementToCode(block, 'message_received');
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'def message_received('+variable_client+', '+variable_server+', '+variable_message+'):\n';
  if (statements_message_received === ""){
  	code += '  pass';
  }
  code += statements_message_received+'\n';
  code += 'server = WebsocketServer(8008,host=\'0.0.0.0\')\n';
  code += 'server.set_fn_message_received(message_received)\n';
  code += 'try:\n';
  code += '  thread.start_new_thread(server.run_forever,())\n';
  code += 'except:\n';
  code += '  pass\n';
  return code;
};
Blockly.Python['websocket_server'] = function(block) {
  Blockly.Python.definitions_.import_websocket_server = "from websocket_server import WebsocketServer";
  Blockly.Python.definitions_.import_thread = "import thread";
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'server = WebsocketServer(8008,host=\'0.0.0.0\')\n';
//  code += 'server.set_fn_new_client(new_client)\n'
//  code += 'server.set_fn_client_left(client_left)\n'
  code += 'server.set_fn_message_received(message_received)\n';
  code += 'try:\n';
  code += '  thread.start_new_thread(server.run_forever,())\n';
  code += 'except:\n';
  code += '  pass\n';
  return code;
};
Blockly.Python['message_received'] = function(block) {
  var variable_client = Blockly.Python.variableDB_.getName(block.getFieldValue('client'), Blockly.Variables.NAME_TYPE);
  var variable_server = Blockly.Python.variableDB_.getName(block.getFieldValue('server'), Blockly.Variables.NAME_TYPE);
  var variable_message = Blockly.Python.variableDB_.getName(block.getFieldValue('message'), Blockly.Variables.NAME_TYPE);
  var statements_message_received = Blockly.Python.statementToCode(block, 'message_received');
  // TODO: Assemble Python into code variable.
  var code = 'def message_received('+variable_client+', '+variable_server+', '+variable_message+'):\n';
  if (statements_message_received === ""){
  	code += '  pass';
  }
  code += statements_message_received+'\n';
  return code;
};
Blockly.Python['server_send_message_to_all'] = function(block) {
  var value_message = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'server.send_message_to_all('+value_message+')\n';
  return code;
};
Blockly.Python['mechabyte_init'] = function(block) {
//  Blockly.Python.definitions_.import_pyfirmata = "from pyfirmata import Arduino, util";
  Blockly.Python.definitions_.import_future_division = "from __future__ import division";
  Blockly.Python.definitions_.import_pymata = "from PyMata.pymata import PyMata";
  var checkbox_streaming_switch = block.getFieldValue('streaming_switch') == 'TRUE';
  var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);
//  Blockly.Python.definitions_.import_MBdisplay = "import MBdisplay";
  // TODO: Assemble Python into code variable.
  var code = 'board = PyMata(\'/dev/ttyS0\')\n';
  code += 'board.reset()\n';
  if(checkbox_streaming_switch == true){
    Blockly.Python.definitions_.import_os = "import os";
    code += 'os.system(\'mjpg_streamer -i \"input_uvc.so -d /dev/video0 -r 320x240 -f 25\" -o \"output_http.so -p '+value_port+' -w /www/webcam\" &\')\n';
//		code += 'os.popen(\'mjpg_streamer -i \"input_uvc.so -d /dev/video0 -r 320x240 -f 25\" -o \"output_http.so -p '+value_port+' -w /www/webcam\" \').read()\n';
//		Blockly.Python.definitions_.import_subprocess = "import subprocess";
//		code += 'proc = subprocess.Popen(["mjpg_streamer","-i","input_uvc.so -d /dev/video0 -r 320x240 -f 25","-o","utput_http.so -p '+value_port+' -w /www/webcam\"],stdout=subprocess.PIPE,stderr=subprocess.PIPE, shell=True)\n';
//		code += '(out, err) = proc.communicate()\n';
//		code += 'print out\n';
//		code += 'output = subprocess.check_output(\'mjpg_streamer -i \"input_uvc.so -d /dev/video0 -r 320x240 -f 25\" -o \"output_http.so -p '+value_port+' -w /www/webcam\" \')\n';
//		code += 'print output\n';
  }
//  code += 'board.i2c_config(0, board.DIGITAL, 2, 3)\n';
//  code += 'MBdisplay.board=board\n';
//  code += 'MBdisplay.display_init()\n';
//  code += 'MBdisplay.display_buffer()\n';
  return code;
};
/*
Blockly.Python['start_streaming'] = function (block) {
  Blockly.Python.definitions_.import_os = "import os";
  var port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);
  var code = 'os.system("mjpg_streamer -i \"input_uvc.so -d /dev/video0 -r 320x240 -f 25\" -o \"output_http.so -p '+port+' -w /www/webcam\" &")';
  return code;
};
*/
var fwPin = [11,10,6,5];
Blockly.Python['car_init'] = function(block) {
  var dropdown_pin2 = block.getFieldValue('port2');
  var dropdown_pin4 = block.getFieldValue('port4');
  // TODO: Assemble Python into code variable.
  var code = 'board.set_pin_mode(10,board.PWM,board.DIGITAL)\n';
  code += 'board.set_pin_mode(11,board.PWM,board.DIGITAL)\n';
  code += 'board.set_pin_mode(6,board.PWM,board.DIGITAL)\n';
  code += 'board.set_pin_mode(5,board.PWM,board.DIGITAL)\n';

  if(dropdown_pin2=="A"){
    fwPin[0] = 11;
    fwPin[1] = 10;
  }else{
    fwPin[0] = 10;
    fwPin[1] = 11;
  }
  if(dropdown_pin4=="A"){
    fwPin[2] = 6;
    fwPin[3] = 5;
  }else{
    fwPin[2] = 5;
    fwPin[3] = 6;
  }
  return code;
};
Blockly.Python['car_forward'] = function(block) {
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.analog_write('+fwPin[1]+', 0)\n';
  code += 'board.analog_write('+fwPin[3]+', 0)\n';
  code += 'board.analog_write('+fwPin[0]+', '+speed+')\n';
  code += 'board.analog_write('+fwPin[2]+', '+speed+')\n';
  return code;
};
Blockly.Python['car_backward'] = function(block) {
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.analog_write('+fwPin[0]+', 0)\n';
  code += 'board.analog_write('+fwPin[2]+', 0)\n';
  code += 'board.analog_write('+fwPin[1]+', '+speed+')\n';
  code += 'board.analog_write('+fwPin[3]+', '+speed+')\n';
  return code;
};
Blockly.Python['car_spin_left'] = function(block) {
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.analog_write('+fwPin[1]+', 0)\n';
  code += 'board.analog_write('+fwPin[2]+', 0)\n';
  code += 'board.analog_write('+fwPin[0]+', '+speed+')\n';
  code += 'board.analog_write('+fwPin[3]+', '+speed+')\n';
  return code;
};
Blockly.Python['car_spin_right'] = function(block) {
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.analog_write('+fwPin[0]+', 0)\n';
  code += 'board.analog_write('+fwPin[3]+', 0)\n';
  code += 'board.analog_write('+fwPin[1]+', '+speed+')\n';
  code += 'board.analog_write('+fwPin[2]+', '+speed+')\n';
  return code;
};
Blockly.Python['car_stop'] = function(block) {
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.analog_write('+fwPin[0]+', 0)\n';
  code += 'board.analog_write('+fwPin[3]+', 0)\n';
  code += 'board.analog_write('+fwPin[1]+', 0)\n';
  code += 'board.analog_write('+fwPin[2]+', 0)\n';
  return code;
};
var pid_i = 0;
var pid_pre_d = -1;
Blockly.Python['car_pid'] = function(block) {
  var distance = parseFloat(Blockly.Python.valueToCode(block, 'distance', Blockly.Python.ORDER_ATOMIC));
  var measure = parseFloat(Blockly.Python.valueToCode(block, 'measure', Blockly.Python.ORDER_ATOMIC));
  var kp = parseFloat(Blockly.Python.valueToCode(block, 'kp', Blockly.Python.ORDER_ATOMIC));
  var ki = parseFloat(Blockly.Python.valueToCode(block, 'ki', Blockly.Python.ORDER_ATOMIC));
  var kd = parseFloat(Blockly.Python.valueToCode(block, 'kd', Blockly.Python.ORDER_ATOMIC));
  var err = measure-distance;
  pid_i += err;
  if(pid_pre_d == -1){
    pid_pre_d = measure;
    return '';
  }else{
    var cmd = Math.round(kp*err+ki*pid_i+kd*(pid_pre_d - measure));
    var code = '';
    if(cmd > 0){
      code += 'board.analog_write('+fwPin[1]+', 0)\n';
      code += 'board.analog_write('+fwPin[3]+', 0)\n';
      code += 'board.analog_write('+fwPin[0]+', '+Math.min(cmd, 255)+')\n';
      code += 'board.analog_write('+fwPin[2]+', '+Math.min(cmd, 255)+')\n';
    }else{
      cmd *= -1;
      code += 'board.analog_write('+fwPin[0]+', 0)\n';
      code += 'board.analog_write('+fwPin[2]+', 0)\n';
      code += 'board.analog_write('+fwPin[1]+', '+Math.min(cmd, 255)+')\n';
      code += 'board.analog_write('+fwPin[3]+', '+Math.min(cmd, 255)+')\n';
    }
    return code;
  }
};
Blockly.Python['sleep'] = function(block) {
  Blockly.Python.definitions_.import_time = "import time";
  var value_seconds = Blockly.Python.valueToCode(block, 'seconds', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'time.sleep('+value_seconds+')\n';
  return code;
};
Blockly.Python['set_pin_mode'] = function(block) {
  var value_pin = Blockly.Python.valueToCode(block, 'pin', Blockly.Python.ORDER_ATOMIC);
  var dropdown_mode = block.getFieldValue('mode');
  var dropdown_type = block.getFieldValue('type');
  // TODO: Assemble Python into code variable.
  var code = 'board.set_pin_mode('+value_pin+',board.'+dropdown_mode+',board.'+dropdown_type+')\n';
  return code;
};
Blockly.Python['write_pin'] = function(block) {
  var dropdown_type = block.getFieldValue('type');
  var value_pin = Blockly.Python.valueToCode(block, 'pin', Blockly.Python.ORDER_ATOMIC);
  var value_value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'board.'+dropdown_type+'_write('+value_pin+', '+value_value+')\n';
  return code;
};
Blockly.Python['read_pin'] = function(block) {
  var dropdown_type = block.getFieldValue('type');
  var value_pin = Blockly.Python.valueToCode(block, 'pin', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'board.'+dropdown_type+'_read('+value_pin+')';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};
Blockly.Python['servo_setup'] = function(block) {
  var dropdown_pin = block.getFieldValue('pin');
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.servo_config('+dropdown_pin+')\n';
  return code;
};

Blockly.Python['servo_rotate'] = function(block) {
  var dropdown_pin = block.getFieldValue('pin');
  var value_value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.analog_write('+dropdown_pin+','+value_value+')\n';
  return code;
};

Blockly.Python['servo_config'] = function(block) {
  var value_pin = Blockly.Python.valueToCode(block, 'pin', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'board.servo_config('+value_pin+')\n';
  return code;
};
Blockly.Python['servo_set'] = function(block) {
  var value_pin = Blockly.Python.valueToCode(block, 'pin', Blockly.Python.ORDER_ATOMIC);
  var value_value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'board.analog_write('+value_pin+','+value_value+')\n';
  return code;
};

Blockly.Python['dc_setup'] = function(block) {
  var dropdown_pin = block.getFieldValue('channel');
  // TODO: Assemble Python into code variable.
  // var code = 'board.set_pin_mode('+dropdown_pin+',board.OUTPUT,board.ANALOG)\n';
  // var other_pin = (parseInt(dropdown_pin)-1);
  // if(other_pin==8){
  //   code += 'board.set_pin_mode('+other_pin+',board.OUTPUT,board.DIGITAL)\n';
  // }else{
  //   code += 'board.set_pin_mode('+other_pin+',board.OUTPUT,board.ANALOG)\n';
  // }
	var code = '';
	code += 'board.set_pin_mode('+dropdown_pin+',board.PWM,board.DIGITAL)\n';
	var other_pin = (parseInt(dropdown_pin)-1);
	code += 'board.set_pin_mode('+other_pin+',board.PWM,board.DIGITAL)\n';
  return code;
};
Blockly.Python['dc_spin'] = function(block) {
  var dropdown_pin = block.getFieldValue('channel');
  var dropdown_polarity = block.getFieldValue('polarity');
  var value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var pin_a = parseInt(dropdown_pin);
  var pin_b = pin_a - 1;
  var code = '';
  // if(dropdown_polarity == "A"){
  //   code += 'board.digital_write('+pin_b+', 0)\n'
  //   code += 'board.analog_write('+pin_a+', '+value+')\n';
  // }else{
  //   code += 'board.digital_write('+pin_a+', 0)\n'
  //   if(pin_b==8){
  //     value = ((value < 128) ? 0 : 255);
  //     code += 'board.analog_write('+pin_b+', '+value+')\n';
  //   }else{
  //     code += 'board.analog_write('+pin_b+', '+value+')\n';
  //   }
  // }
	if(dropdown_polarity == "A"){
		code += 'board.analog_write('+pin_b+', 0)\n';
		code += 'board.analog_write('+pin_a+', '+value+')\n'
	}else{
		code += 'board.analog_write('+pin_a+', 0)\n';
		code += 'board.analog_write('+pin_b+', '+value+')\n'
	}
  return code;
};

Blockly.Python['play_tone'] = function(block) {
  var value_pin = Blockly.Python.valueToCode(block, 'pin', Blockly.Python.ORDER_ATOMIC);
  var dropdown_command = block.getFieldValue('cmd');
  var value_frequency = Blockly.Python.valueToCode(block, 'frequency', Blockly.Python.ORDER_ATOMIC);
  var value_duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'board.play_tone('+value_pin+',board.'+dropdown_command+',int('+value_frequency+'),int('+value_duration+'))\n';
  //var code = '\n';
  return code;
};
Blockly.Python['i2c_init'] = function(block) {
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.i2c_config(0, board.DIGITAL, 2, 3)\n';
  return code;
};
Blockly.Python['i2c_write'] = function(block) {
  var value_addr = Blockly.Python.valueToCode(block, 'addr', Blockly.Python.ORDER_ATOMIC);
  var value_data = Blockly.Python.valueToCode(block, 'data', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.i2c_write('+value_addr+','+value_data+')\n';
  return code;
};
Blockly.Python['sonar_config'] = function(block) {
  var value_trigger = Blockly.Python.valueToCode(block, 'trigger', Blockly.Python.ORDER_ATOMIC);
  var value_echo = Blockly.Python.valueToCode(block, 'echo', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = '';
  code += 'board.sonar_config('+value_trigger+','+value_echo+')\n';
  return code;
};
Blockly.Python['get_sonar_data'] = function(block) {
  var value_trigger = Blockly.Python.valueToCode(block, 'trigger', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  // var code = '';
  // code += 'board.get_sonar_data()['+value_trigger+'][1][0]';
  // TODO: Change ORDER_NONE to the correct strength.
  //return [code, Blockly.Python.ORDER_NONE];
  var a = '';
  a = Blockly.Python.provideFunction_("convert_sonar_data", ["def " + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + "(echo_pin):", "  result = board.get_sonar_data()[echo_pin]" , "  if isinstance(result[1],list):" , "    return result[1][0]" , "  else:" , "    return result[1]"]);
  return [a + "(" + value_trigger +  ")", Blockly.Python.ORDER_FUNCTION_CALL]
};
/*
Blockly.Python['display_clear'] = function(block) {
  // TODO: Assemble Python into code variable.
  // var code = 'MBdisplay.display_clear()\n';
  return code;
};
Blockly.Python['plot'] = function(block) {
  var value_x = Blockly.Python.valueToCode(block, 'x', Blockly.Python.ORDER_ATOMIC);
  var value_y = Blockly.Python.valueToCode(block, 'y', Blockly.Python.ORDER_ATOMIC);
  var value_c = Blockly.Python.valueToCode(block, 'c', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  // var code = 'MBdisplay.plotDot('+value_x+','+value_y+','+value_c+')\n';
  return code;
};
Blockly.Python['gpio'] = function(block) {
  Blockly.Python.definitions_.import_os = "import os";
  var value_port = Blockly.Python.valueToCode(block, 'port', Blockly.Python.ORDER_ATOMIC);
  var value_value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = 'os.system(\'echo '+value_port+' > /sys/class/gpio/export\')\n';
  code += 'os.system(\'echo out > /sys/class/gpio/gpio'+value_port+'/direction\')\n';
  code += 'os.system(\'echo '+value_value+' > /sys/class/gpio/gpio'+value_port+'/value\')\n';
  return code;
};
Blockly.Python['mt7688_pinmax'] = function(block) {
  Blockly.Python.definitions_.import_os = "import os";
  var dropdown_i2c = block.getFieldValue('i2c');
  var dropdown_uart0 = block.getFieldValue('uart0');
  var dropdown_uart1 = block.getFieldValue('uart1');
  var dropdown_uart2 = block.getFieldValue('uart2');
  var dropdown_pwm0 = block.getFieldValue('pwm0');
  var dropdown_pwm1 = block.getFieldValue('pwm1');
  var dropdown_refclk = block.getFieldValue('refclk');
  var dropdown_spi_s = block.getFieldValue('spi_s');
  var dropdown_spi_cs1 = block.getFieldValue('spi_cs1');
  var dropdown_i2s = block.getFieldValue('i2s');
  var dropdown_ephy = block.getFieldValue('ephy');
  var dropdown_wled = block.getFieldValue('wled');
  // TODO: Assemble Python into code variable.
  var code = 'os.system(\'mt7688_pinmux set i2c '+dropdown_i2c+'\')\n';
  code += 'os.system(\'mt7688_pinmux set uart0 '+dropdown_uart0+'\')\n';
  code += 'os.system(\'mt7688_pinmux set uart1 '+dropdown_uart1+'\')\n';
  code += 'os.system(\'mt7688_pinmux set uart2 '+dropdown_uart2+'\')\n';
  code += 'os.system(\'mt7688_pinmux set pwm0 '+dropdown_pwm0+'\')\n';
  code += 'os.system(\'mt7688_pinmux set pwm1 '+dropdown_pwm1+'\')\n';
  code += 'os.system(\'mt7688_pinmux set refclk '+dropdown_refclk+'\')\n';
  code += 'os.system(\'mt7688_pinmux set spi_s '+dropdown_spi_s+'\')\n';
  code += 'os.system(\'mt7688_pinmux set spi_cs1 '+dropdown_spi_cs1+'\')\n';
  code += 'os.system(\'mt7688_pinmux set i2s '+dropdown_i2s+'\')\n';
  code += 'os.system(\'mt7688_pinmux set ephy '+dropdown_ephy+'\')\n';
  code += 'os.system(\'mt7688_pinmux set wled '+dropdown_wled+'\')\n';
  code += 'os.system(\'sleep 1\')\n';
  return code;
};
*/
// Load the Code demo's language strings.
document.write('<script src="msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="../../msg/js/' + Code.LANG + '.js"></script>\n');

window.addEventListener('load', Code.init);

// // Load the Google Chart Tools Visualization API and the chart package.
// if (typeof google == 'object') {
//   google.load('visualization', '1', {packages: ['corechart']});
// } else {
//   alert('Unable to load Google\'s chart API.\n' +
//         'Are you connected to the Internet?');
// }
//
// // Define the custom blocks and their JS generators.
// Blockly.Blocks['graph_get_x'] = {
//   // x variable getter.
//   init: function() {
//     this.jsonInit({
//       "message0": "x",
//       "output": "Number",
//       "colour": Blockly.Blocks.variables.HUE,
//       "tooltip": Blockly.Msg.VARIABLES_GET_TOOLTIP,
//       "helpUrl": Blockly.Msg.VARIABLES_GET_HELPURL
//     });
//   }
// };
//
// Blockly.JavaScript['graph_get_x'] = function(block) {
//   // x variable getter.
//   return ['x', Blockly.JavaScript.ORDER_ATOMIC];
// };
//
Blockly.Blocks['graph_set_y'] = {
  // y variable setter.
  init: function() {
    this.jsonInit({
      "message0": "y = %1",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number"
        }
      ],
      "colour": Blockly.Blocks.variables.HUE,
      "tooltip": Blockly.Msg.VARIABLES_SET_TOOLTIP,
      "helpUrl": Blockly.Msg.VARIABLES_SET_HELPURL
    });
  }
};

Blockly.JavaScript['graph_set_y'] = function(block) {
  // y variable setter.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '';
  return 'y = ' + argument0 + ';';
};
Blockly.Python['graph_set_y'] = function(block) {
  // y variable setter.
	var argument0 = block.getFieldValue('VALUE');
  return 'y = ' + argument0;
};

// /**
//  * Create a namespace for the application.
//  */
// var Graph = {};
//
// /**
//  * Main Blockly workspace.
//  * @type {Blockly.WorkspaceSvg}
//  */
// Graph.workspace = null;
//
// /**
//  * Cached copy of the function string.
//  * @type {?string}
//  * @private
//  */
// Graph.oldFormula_ = null;
//
// /**
//  * Drawing options for the Chart API.
//  * @type {!Object}
//  * @private
//  */
// Graph.options_ = {
//   //curveType: 'function',
//   width: 400, height: 400,
//   chartArea: {left: '10%', width: '85%', height: '85%'}
// };
//
// /**
//  * Visualize the graph of y = f(x) using Google Chart Tools.
//  * For more documentation on Google Chart Tools, see this linechart example:
//  * https://developers.google.com/chart/interactive/docs/gallery/linechart
//  */
// Code.drawVisualization = function() {
//   var formula = Blockly.JavaScript.workspaceToCode(Graph.workspace);
//   if (formula === Graph.oldFormula_) {
//     // No change in the formula, don't recompute.
//     return;
//   }
//   Graph.oldFormula_ = formula;
//
//   // Create and populate the data table.
//   var data = google.visualization.arrayToDataTable(Graph.plot(formula));
//   // Create and draw the visualization, passing in the data and options.
//   new google.visualization.LineChart(document.getElementById('visualization')).
//       draw(data, Graph.options_);
//
//   // Create the "y = ..." label.  Find the relevant part of the code.
//   formula = formula.substring(formula.indexOf('y = '));
//   formula = formula.substring(0, formula.indexOf(';'));
//   var funcText = document.getElementById('funcText');
//   funcText.replaceChild(document.createTextNode(formula), funcText.lastChild);
// };
//
// /**
//  * Plot points on the function y = f(x).
//  * @param {string} code JavaScript code.
//  * @return {!Array.<!Array>} 2D Array of points on the graph.
//  */
// Graph.plot = function(code) {
//   // Initialize a table with two column headings.
//   var table = [];
//   var y;
//   // TODO: Improve range and scale of graph.
//   for (var x = -10; x <= 10; x = Math.round((x + 0.1) * 10) / 10) {
//     try {
//       eval(code);
//     } catch (e) {
//       y = NaN;
//     }
//     if (!isNaN(y)) {
//       // Prevent y from being displayed inconsistently, some in decimals, some
//       // in scientific notation, often when y has accumulated rounding errors.
//       y = Math.round(y * Math.pow(10, 14)) / Math.pow(10, 14);
//       table.push([x, y]);
//     }
//   }
//   // Add column heading to table.
//   if (table.length) {
//     table.unshift(['x', 'y']);
//   } else {
//     // If the table is empty, add a [0, 0] row to prevent graph error.
//     table.unshift(['x', 'y'], [0, 0]);
//   }
//   return table;
// };
//
// /**
//  * Force Blockly to resize into the available width.
//  */
// Code.resize = function() {
//   var width = Math.max(window.innerWidth - 440, 250);
//   document.getElementById('content_blocks').style.width = width + 'px';
//   Blockly.svgResize(Graph.workspace);
// };
//
// /**
//  * Initialize Blockly and the graph.  Called on page load.
//  */
// Graph.init = function () {
//   // Graph.workspace = Blockly.inject('blocklyDiv',
//   //     {collapse: false,
//   //      disable: false,
//   //      media: '../../media/',
//   //      toolbox: document.getElementById('toolbox')});
//
//    Graph = Code;
//
//   // Blockly.Xml.domToWorkspace(document.getElementById('startBlocks'),
//   //  Graph.workspace);
//   // Graph.workspace.clearUndo();
//
//   // When Blockly changes, update the graph.
//   Graph.workspace.addChangeListener(Code.drawVisualization);
//   Graph.workspace.addChangeListener(Blockly.Events.disableOrphans);
//   Code.resize();
// };
//
// // window.addEventListener('load', Graph.init);
// window.addEventListener('resize', Code.resize);
