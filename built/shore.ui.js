(function() {
  var ui;
  var __hasProp = Object.prototype.hasOwnProperty;
  ui = ((this.shore = (typeof this.shore !== "undefined" && this.shore !== null) ? this.shore : {}).ui = {
    __load_mathjax_callback__: null,
    load_mathjax: function(src, callback) {
      var config, script;
      ui.__load_mathjax_callback__ = (typeof callback !== "undefined" && callback !== null) ? callback : null;
      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      config = "MathJax.Hub.Config({\n	jax: [\"input/TeX\", \"output/HTML-CSS\"],\n	extensions: [\"tex2jax.js\", \"TeX/AMSmath.js\", \"TeX/AMSsymbols.js\"],\n	tex2jax: {\n		inlineMath: [[\"\\\\(\", \"\\\\)\"]],\n		displayMath: [[\"\\\\[\", \"\\\\]\"]]\n	},\n	skipStartupTypeset: true,\n});\n\nMathJax.Hub.Startup.onload();\nMathJax.Hub.Register.StartupHook(\"End\", function() {\n	var callback;\n	if (callback = shore.ui.__load_mathjax_callback__) callback();\n});";
      if (typeof opera !== "undefined" && opera !== null) {
        script.innerHTML = config;
      } else {
        script.text = config;
      }
      return (document.getElementsByTagName("head"))[0].appendChild(script);
    },
    decode: function(s) {
      return decodeURIComponent(s.replace(/\+/g, " "));
    },
    encode: encodeURIComponent,
    html_entities: {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    },
    escape_html: function(original) {
      var _i, _ref, _result, c, pattern;
      pattern = ui.escape_html._pattern = (typeof ui.escape_html._pattern !== "undefined" && ui.escape_html._pattern !== null) ? ui.escape_html._pattern : (new RegExp("(" + ((function() {
        _result = []; _ref = ui.html_entities;
        for (c in _ref) {
          if (!__hasProp.call(_ref, c)) continue;
          _i = _ref[c];
          _result.push(c);
        }
        return _result;
      })().join("|")) + ")", "g"));
      return original.replace(pattern, function(c) {
        return ui.html_entities[c];
      });
    },
    scale_textarea: function(textarea, pixels_per_line, modifier) {
      var lines;
      modifier = (typeof modifier !== "undefined" && modifier !== null) ? modifier : 0;
      lines = (shore.utility.occurences(textarea.val(), "\n")) + 2 + modifier;
      return textarea.css("height", lines * pixels_per_line);
    },
    configure_textarea: function(textarea) {
      var pixels_per_line;
      pixels_per_line = ui.pixels_per_em($("body"));
      textarea.keypress(function(event) {
        if (event.which === 13 || event.which === 10) {
          if (event.shiftKey) {
            (textarea.closest("form")).submit();
            return false;
          } else {
            return ui.scale_textarea(textarea, pixels_per_line, +1);
          }
        }
      });
      textarea.keyup(function(event) {
        return ui.scale_textarea(textarea, pixels_per_line);
      });
      return ui.scale_textarea(textarea, pixels_per_line);
    },
    pixels_per_em: function(element, sample_size) {
      var result, test_element;
      sample_size = (typeof sample_size !== "undefined" && sample_size !== null) ? sample_size : 10;
      test_element = ($("<div>")).css({
        width: ("" + (sample_size) + "em")
      });
      test_element.appendTo(element);
      result = parseFloat(test_element.css("width")) / sample_size;
      test_element.remove();
      return result;
    },
    select_all: function(elements) {
      var _i, _len, _ref, _result, element;
      _result = []; _ref = elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        _result.push((function() {
          element.selectionStart = 0;
          return (element.selectionEnd = element.value.length);
        })());
      }
      return _result;
    },
    parse_qs: function(qs) {
      var _, _ref, key, match, re, result, value;
      qs = (typeof qs !== "undefined" && qs !== null) ? qs : location.search.substring(1);
      result = {};
      re = /([^&=]+)=([^&]*)/g;
      while (match = re.exec(qs)) {
        _ref = match;
        _ = _ref[0];
        key = _ref[1];
        value = _ref[2];
        if (key.slice(-2, key.length + 1) === "[]") {
          result[key] = (typeof result[key] !== "undefined" && result[key] !== null) ? result[key] : [];
          result[key].push(ui.decode(value));
        } else {
          result[key] = ui.decode(value);
        }
      }
      return result;
    }
  });
}).call(this);
