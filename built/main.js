(function() {
  var default_input, main, mj_wait, process_math, root;
  root = this;
  default_input = "d = (((g ~ t + 5) ~ t) + 30)(g = -9.8)\nA = (-4.9t^2 + 5t + 30) ` t ` t";
  mj_wait = 2000;
  process_math = function(input, output_element) {
    var mathjax_message, out, output_parts, parsed;
    "Parses an input string then display and format the input, steps and result\
	in a given element.";
    if ((typeof MathJax === "undefined" || MathJax === null) ? undefined : MathJax.isReady) {
      mathjax_message = (MathJax.Message.Set("Processing Math..."));
    }
    try {
      parsed = shore(input);
    } catch (e) {
      if (!/^(Parse|Lexical) error/.test(e.message)) {
        throw e;
      }
      output_element.empty();
      output_element.append((($("<pre>")).css({
        whiteSpace: "pre-line"
      })).text(e.message.replace("on line 1", "in \"" + (input) + "\"")));
      output_element.show();
      return null;
    }
    output_parts = [];
    out = function(s) {
      return output_parts.push(s);
    };
    if ((typeof MathJax === "undefined" || MathJax === null) ? undefined : MathJax.isReady) {
      out("<h3 id=output_input>Input</h3>");
      out("<div>\\begin{align}");
      out(shore.ui.escape_html(parsed.to_tex()));
      out("\\end{align}</div>");
      out("<h3 id=output_steps>Steps</h3>");
      out("<div>\\begin{align}");
      out("\\end{align}</div>");
      out("<h3 id=output_results>Results</h3>");
      out("<div>\\begin{align}");
      out(shore.ui.escape_html(parsed.canonize().to_tex()));
      out("\\end{align}</div>");
      output_element.html(output_parts.join(""));
      if (typeof mathjax_message !== "undefined" && mathjax_message !== null) {
        MathJax.Message.Clear(mathjax_message);
      }
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, (output_element.get(0))]);
    } else {
      out("<h3 id=output_input>Input</h3>");
      out("<pre>");
      out(shore.ui.escape_html(parsed.to_string()));
      out("</pre>");
      out("<h3 id=output_steps>Steps</h3>");
      out("<pre>");
      out("</pre>");
      out("<h3 id=output_results>Results</h3>");
      out("<pre>");
      out(shore.ui.escape_html(parsed.canonize().to_string()));
      out("</pre>");
      output_element.html(output_parts.join(""));
    }
    ($("h3")).css({
      cursor: "pointer"
    }).hover(function() {
      return ($(this)).css({
        backgroundColor: "rgba(0,0,0,.1)"
      });
    }, function() {
      return ($(this)).css({
        backgroundColor: "transparent"
      });
    }).toggle(function() {
      return ($(this)).next().show(300);
    }, function() {
      return ($(this)).next().hide(300);
    });
    ($("h3 + div")).hide();
    ($("h3#output_input")).click();
    ($("h3#output_results")).click();
    return output_element.show(300);
  };
  $(main = function() {
    var form, input, input_box, process_once, processed, provided_input, qs, result_box;
    "Make it all start working when the DOM's ready.";
    "Since it's not strictly necessary we don't load MathJax until after all\
	of the required scripts.";
    shore.ui.load_mathjax("dep/mathjax-1.0.1/MathJax.js");
    qs = shore.ui.parse_qs();
    input_box = $("#input");
    result_box = $("#results");
    form = $("form");
    provided_input = (location.hash.slice(0, 3)) === "#i=" ? shore.ui.decode(location.hash.slice(3)) : qs.i;
    input = provided_input || default_input;
    input_box.val(input);
    shore.ui.configure_textarea(input_box);
    input_box.focus();
    shore.ui.select_all(input_box);
    if (provided_input) {
      if (mj_wait && !((typeof MathJax === "undefined" || MathJax === null) ? undefined : MathJax.isReady)) {
        processed = false;
        process_once = function() {
          if (processed) {
            return null;
          }
          processed = true;
          if (provided_input) {
            return process_math(input, result_box);
          }
        };
        shore.ui.__load_mathjax_callback__ = process_once;
        return setTimeout(process_once, mj_wait);
      } else {
        if (provided_input) {
          return process_math(input, result_box);
        }
      }
    }
  });
}).call(this);
