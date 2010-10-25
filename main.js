(function() {
  $(function() {
    var emPixels, escape_html, form, input_box, occurences, process_math, result_box, scale_textarea, texscapeify;
    emPixels = (function(element) {
      var result, test_element;
      "The approximate number of pixels per em in an element.";
      test_element = ($("<div>")).css({
        width: "10em"
      });
      test_element.appendTo(element);
      result = parseFloat(test_element.css("width")) / 10;
      test_element.remove();
      return result;
    })($("body"));
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
    scale_textarea = function(textarea, modifier) {
      var ems;
      "Set the height of a jQ textarea based on the newlines contained.\
		\
		(2 + newlines) ems.";
      modifier = (typeof modifier !== "undefined" && modifier !== null) ? modifier : 0;
      ems = (occurences(textarea.val(), "\n")) + 2 + modifier;
      return textarea.css("height", ems * emPixels);
    };
    escape_html = function(raw) {
      return raw.replace("&", "&amp").replace("<", "&lt;").replace(">", "&gt;");
    };
    input_box = $("#input");
    result_box = $("#results");
    form = $("form");
    input_box.focus();
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
      return scale_textarea(input_box);
    });
    scale_textarea(input_box);
    texscapeify = function(value) {
      return (escape_html(value.to_tex())).replace(/=/, "&=");
    };
    process_math = function(input, output) {
      var _i, _j, _len, _len2, _ref, _ref2, expression, line, output_parts, parsed, parsed_line;
      parsed = [];
      _ref = input.split(/\n/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.length) {
          parsed_line = [];
          _ref2 = line.split(/;/);
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            expression = _ref2[_j];
            if (expression.length) {
              parsed_line.push(parser.parse(expression));
            }
          }
          parsed.push(parsed_line);
        }
      }
      output_parts = [];
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
      ($("h3")).css({
        cursor: "pointer"
      });
      ($("h3")).toggle(function() {
        return ($(this)).next().hide(100);
      }, function() {
        return ($(this)).next().show(100);
      });
      return MathJax.Hub.Queue(["Typeset", MathJax.Hub, (output.get(0))]);
    };
    return form.submit(window.__go = function() {
      var input;
      input = ($("#input")).val();
      process_math(input, result_box);
      return false;
    });
  });
}).call(this);
