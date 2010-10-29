(function() {
  var decode, default_input, ems_per_pixel_in, encode, escape_html, get_qs, load_mathjax, main, mj_wait, occurences, process_math, scale_textarea, texscapeify;
  default_input = "A = -g_gemini; g_gemini = 0.00015\nv = A ~ t + v_0; v_0 = 0\nd = v ~ t + d_0; d_0 = 1\nt_fall = t(d=0)";
  shore.__main_mj_ready = function() {};
  load_mathjax = function() {
    var _ref, config, script;
    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "dep/mathjax-1.0.1/MathJax.js";
    config = "MathJax.Hub.Config({\n	jax: [\"input/TeX\", \"output/HTML-CSS\"],\n	extensions: [\"tex2jax.js\", \"TeX/AMSmath.js\", \"TeX/AMSsymbols.js\"],\n	tex2jax: {\n		inlineMath: [[\"\\(\", \"\\)\"]],\n		displayMath: [[\"\\[\", \"\\]\"]]\n	},\n	messageStyle: \"none\"\n});\n\nMathJax.Hub.Startup.onload();\nMathJax.Hub.Register.StartupHook(\"End\", function() {\n	shore.__main_mj_ready()\n});";
    if (typeof (_ref = window.opera) !== "undefined" && _ref !== null) {
      script.innerHTML = config;
    } else {
      script.text = config;
    }
    return (document.getElementsByTagName("head"))[0].appendChild(script);
  };
  "If input is provided we give MathJax this many miliseconds to load before\
processing it to plain-text output.";
  mj_wait = 2000;
  decode = function(s) {
    return decodeURIComponent(s.replace(/\+/g, " "));
  };
  encode = encodeURIComponent;
  get_qs = function() {
    var match, query_string, re, result;
    "An object representing the contents of the query string.";
    result = {};
    query_string = window.location.search.substring(1);
    re = /([^&=]+)=([^&]*)/g;
    while (match = re.exec(query_string)) {
      result[decode(match[1])] = decode(match[2]);
    }
    return result;
  };
  ems_per_pixel_in = function(element) {
    var result, test_element;
    "The approximate number of pixels per em in an element.";
    test_element = ($("<div>")).css({
      width: "10em"
    });
    test_element.appendTo(element);
    result = parseFloat(test_element.css("width")) / 10;
    test_element.remove();
    return result;
  };
  scale_textarea = function(textarea, pixels_per_line, modifier) {
    var lines;
    "Set the height of a jQ textarea based on the newlines contained.\
	\
	(2 + newlines) ems.";
    modifier = (typeof modifier !== "undefined" && modifier !== null) ? modifier : 0;
    lines = (occurences(textarea.val(), "\n")) + 2 + modifier;
    return textarea.css("height", lines * pixels_per_line);
  };
  occurences = function(string, target_character) {
    var _i, _len, _ref, character, result;
    "The number of occurrences of a given character in a string.";
    result = 0;
    _ref = string;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      character = _ref[_i];
      if (character === target_character) {
        result += 1;
      }
    }
    return result;
  };
  escape_html = function(raw) {
    return raw.replace("&", "&amp").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
  };
  texscapeify = function(value) {
    return (escape_html(value.to_tex())).replace(/=/, "&=");
  };
  process_math = function(input, output) {
    var _i, _j, _len, _len2, _ref, _ref2, expression, line, output_parts, parsed, parsed_line;
    output.show(300);
    parsed = [];
    try {
      _ref = input.split(/\n/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.length) {
          parsed_line = [];
          _ref2 = line.split(/;/);
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            expression = _ref2[_j];
            if (expression.length) {
              parsed_line.push(shore.parser.parse(expression));
            }
          }
          parsed.push(parsed_line);
        }
      }
    } catch (e) {
      if (!/^(Parse|Lexical) error/.test(e.message)) {
        throw e;
      }
      output.empty();
      output.append((($("<pre>")).css({
        whiteSpace: "pre-line"
      })).text(e.message.replace("on line 1", "in \"" + (expression) + "\"")));
      output.show();
      return null;
    }
    output_parts = [];
    if ((typeof MathJax === "undefined" || MathJax === null) ? undefined : MathJax.isReady) {
      output_parts.push("<h3><span class=tex2jax_ignore>Input</span></h3>");
      output_parts.push("<div>\\begin{align}");
      _ref = parsed;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _ref2 = line;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          expression = _ref2[_j];
          output_parts.push(texscapeify(expression));
          output_parts.push(" & ");
        }
        output_parts.push(" \\\\\n<br>");
      }
      output_parts.push("\\end{align}</div>");
      output_parts.push("<h3><span class=tex2jax_ignore>Steps</span></h3>");
      output_parts.push("<div>\\begin{align}");
      output_parts.push("\\end{align}</div>");
      output_parts.push("<h3><span class=tex2jax_ignore>Results</span></h3>");
      output_parts.push("<div>\\begin{align}");
      _ref = parsed;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _ref2 = line;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          expression = _ref2[_j];
          output_parts.push(texscapeify(expression.canonize()));
          output_parts.push(" & ");
        }
        output_parts.push(" \\\\\n<br>");
      }
      output_parts.push("\\end{align}</div>");
      output.html(output_parts.join(""));
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, (output.get(0))]);
    } else {
      output_parts.push("<h3>Input</h3>");
      output_parts.push("<pre>");
      _ref = parsed;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _ref2 = line;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          expression = _ref2[_j];
          output_parts.push(escape_html(expression.to_string()));
          output_parts.push("\t");
        }
        output_parts.push("\n");
      }
      output_parts.push("</pre>");
      output_parts.push("<h3>Steps</h3>");
      output_parts.push("<pre>");
      output_parts.push("</pre>");
      output_parts.push("<h3>Results</h3>");
      output_parts.push("<pre>");
      _ref = parsed;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _ref2 = line;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          expression = _ref2[_j];
          output_parts.push(escape_html(expression.canonize().to_string()));
          output_parts.push("\t");
        }
        output_parts.push("\n");
      }
      output_parts.push("</pre>");
      output.html(output_parts.join(""));
    }
    ($("h3")).css({
      cursor: "pointer"
    });
    ($("h3")).hover(function() {
      return ($(this)).css({
        backgroundColor: "rgba(0,0,0,.1)"
      });
    }, function() {
      return ($(this)).css({
        backgroundColor: "transparent"
      });
    });
    ($("h3")).toggle(function() {
      return ($(this)).next().show(300);
    }, function() {
      return ($(this)).next().hide(300);
    });
    ($("h3 + div")).hide();
    (($("h3")).eq(0)).click();
    return (($("h3")).eq(2)).click();
  };
  $(main = function() {
    var em_pixels, form, input, input_box, process_once, processed, provided_input, qs, result_box, window;
    "Make it all start working when the DOM's ready.";
    "Since it's not strictly necessary we don't load MathJax until after all\
	of the required scripts.";
    load_mathjax();
    qs = get_qs();
    input_box = $("#input");
    result_box = $("#results");
    form = $("form");
    input_box.focus();
    em_pixels = ems_per_pixel_in($("body"));
    input_box.keypress(function(event) {
      if (event.which === 13 || event.which === 10) {
        if (event.shiftKey) {
          ($("form")).submit();
          return false;
        } else {
          return scale_textarea(input_box, +1);
        }
      }
    });
    input_box.keyup(function(event) {
      return scale_textarea(input_box, em_pixels);
    });
    scale_textarea(input_box, em_pixels);
    form.submit(window = function() {
      var input;
      input = ($("#input")).val();
      process_math(input, result_box);
      window.location.hash = ("i=" + (encode(input)));
      return false;
    });
    provided_input = qs.i || ((location.hash.slice(0, 3)) === "#i=" ? decode(location.hash.slice(3)) : null);
    input = provided_input || default_input;
    input_box.val(input);
    scale_textarea(input_box, em_pixels);
    (input_box.get(0)).selectionStart = 0;
    (input_box.get(0)).selectionEnd = input_box.val().length;
    if (provided_input) {
      "We give MathJax two seconds to load, then fall back to plain text.";
      if (mj_wait) {
        processed = false;
        process_once = function() {
          if (processed) {
            return null;
          }
          console.log("processing");
          processed = true;
          if (provided_input) {
            return process_math(input, result_box);
          }
        };
        shore.__main_mj_ready = function() {
          return process_once();
        };
        return setTimeout(process_once, mj_wait);
      } else {
        if (provided_input) {
          return process_math(input, result_box);
        }
      }
    }
  });
}).call(this);
