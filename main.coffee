#!/usr/bin/env coffee -c
root = this

default_input = """
d = (((g ~ t + 5) ~ t) + 30)(g = -9.8)
A = (-4.9t^2 + 5t + 30) ` t ` t
"""

mj_wait = 2000

process_math = (input, output_element) ->
	"Parses an input string then display and format the input, steps and result
	in a given element."
	
	if MathJax?.isReady
		mathjax_message = (MathJax.Message.Set "Processing Math...")
	
	try
		parsed = shore input
	catch e
		throw e if not /^(Parse|Lexical) error/.test e.message
		# lack of exception types is bah...
		
		output_element.empty()
		output_element.append (($ "<pre>").css whiteSpace: "pre-line")
			.text e.message.replace "on line 1", "in \"#{input}\""
		output_element.show()
		return
	
	output_parts = [];
	out = (s) -> output_parts.push s
	
	if MathJax?.isReady
		out "<h3 id=output_input>Input</h3>"
		out "<div>\\begin{align}"
		
		out shore.ui.escape_html parsed.to_tex()
		
		out "\\end{align}</div>"
		
		out "<h3 id=output_steps>Steps</h3>"
		out "<div>\\begin{align}"
		out "\\end{align}</div>"
		
		out "<h3 id=output_results>Results</h3>"
		out "<div>\\begin{align}"
		
		out shore.ui.escape_html parsed.canonize().to_tex()
		
		out "\\end{align}</div>"
		output_element.html output_parts.join ""
		
		MathJax.Message.Clear mathjax_message if mathjax_message?
		
		MathJax.Hub.Queue ["Typeset", MathJax.Hub, (output_element.get 0) ]
	else # plain text output
		out "<h3 id=output_input>Input</h3>"
		out "<pre>"
		
		out shore.ui.escape_html parsed.to_string()
		
		out "</pre>"
		
		out "<h3 id=output_steps>Steps</h3>"
		out "<pre>"
		out "</pre>"
		
		out "<h3 id=output_results>Results</h3>"
		out "<pre>"
		
		out shore.ui.escape_html parsed.canonize().to_string()
		
		out "</pre>"
		
		output_element.html output_parts.join ""
	
	($ "h3")
		.css(cursor: "pointer")
		.hover (-> ($ this).css backgroundColor: "rgba(0,0,0,.1)"),
					 (-> ($ this).css backgroundColor: "transparent")
		.toggle (-> ($ this).next().show 300),
						(-> ($ this).next().hide 300)
	($ "h3 + div").hide()
	($ "h3#output_input").click()
	($ "h3#output_results").click()
	
	output_element.show 300

$ main = ->
	"Make it all start working when the DOM's ready."
	
	"Since it's not strictly necessary we don't load MathJax until after all
	of the required scripts."
	
	shore.ui.load_mathjax "../dep/mathjax-1.0.1/MathJax.js"
	qs = shore.ui.parse_qs()
	
	input_box = $ "#input"
	result_box = $ "#results"
	form = $ "form"
	
	provided_input = if (location.hash.slice 0, 3) is "#i="
		shore.ui.decode location.hash.slice 3
	else
		qs.i
	
	input = provided_input or default_input
	input_box.val input
	
	shore.ui.configure_textarea input_box
	
	input_box.focus()
	shore.ui.select_all input_box
	
	if provided_input
		# We give MathJax two seconds to load, then process into plain text if
		# necessary."
		
		if mj_wait and not MathJax?.isReady
			processed = false
			
			process_once = ->
				return if processed
				processed = true
				process_math input, result_box if provided_input
			
			shore.ui.__load_mathjax_callback__ = process_once
			setTimeout process_once, mj_wait
		else
			process_math input, result_box if provided_input
