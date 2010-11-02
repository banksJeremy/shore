#!/usr/bin/env coffee -c
root = this

default_input = """
d = (((g ~ t + 5) ~ t) + 30)(g = -9.8)
A = (-4.9t^2 + 5t + 30) ` t ` t
"""

mathjax_src = "https://jbmathjax.s3.amazonaws.com/mathjax-1.0.1/MathJax.js"
shore.__main_on_mathjax_loaded = (->)
mathjax_load = ->
	# http://www.mathjax.org/docs/dynamic.html
	# apparently creating script tags with jQuery had oddities...
	
	script = document.createElement "script"
	script.type = "text/javascript"
	script.src = mathjax_src
	config = """
		MathJax.Hub.Config({
			jax: ["input/TeX", "output/HTML-CSS"],
			extensions: ["tex2jax.js", "TeX/AMSmath.js", "TeX/AMSsymbols.js"],
			tex2jax: {
				inlineMath: [["\\\\(", "\\\\)"]],
				displayMath: [["\\\\[", "\\\\]"]]
			},
			messageStyle: "none"
		});
		
		MathJax.Hub.Startup.onload();
		MathJax.Hub.Register.StartupHook("End", function() {
			shore.__main_on_mathjax_loaded()
		});
	"""
	
	if opera?
		script.innerHTML = config
	else
		script.text = config
	
	(document.getElementsByTagName "head")[0].appendChild script

"If input is provided we give MathJax this many miliseconds to load before
processing it to plain-text output."
mj_wait = 2000

decode = (s) -> decodeURIComponent s.replace(/\+/g, " ")
encode = encodeURIComponent

get_qs = ->
	"An object representing the contents of the query string."
	
	result = {}
	query_string = location.search.substring 1
	re = /([^&=]+)=([^&]*)/g
	
	while match = re.exec query_string
		result[decode match[1]] = decode match[2]
	
	return result

ems_per_pixel_in = (element) ->
	"The approximate number of pixels per em in an element."
	
	test_element = ($ "<div>").css width: "10em"
	test_element.appendTo element
	result = parseFloat(test_element.css "width") / 10
	test_element.remove()
	result

scale_textarea = (textarea, pixels_per_line, modifier) ->
	"Set the height of a jQ textarea based on the newlines contained.
	
	(2 + newlines) ems."
	
	modifier ?= 0
	
	lines = (occurences textarea.val(), "\n") + 2 + modifier
	
	textarea.css "height", lines * pixels_per_line

occurences = (string, target_character) ->
	"The number of occurrences of a given character in a string."
	
	result = 0
	for character in string
		if character is target_character
			result += 1
	result

escape_html = (raw) ->
	raw
		.replace("&", "&amp")
		.replace("<", "&lt;")
		.replace(">", "&gt;")
		.replace("\"", "&quot;")
		.replace("'", "&#39;")

texscapeify = (value) ->
	((escape_html value.to_tex()).replace /=/, "&=")

process_math = (input, output_element) ->
	"Parses an input string then display and format the input, steps and result
	in a given element."
	
	parsed = []
	try
		for line in input.split /\n/
			if line.length
				parsed_line = []
				for expression in line.split /;/
					if expression.length
						parsed_line.push shore.parser.parse expression
				parsed.push parsed_line
	catch e
		throw e if not /^(Parse|Lexical) error/.test e.message
		# lack of exception types is bah...
		
		output_element.empty()
		output_element.append (($ "<pre>").css whiteSpace: "pre-line")
			.text e.message.replace "on line 1", "in \"#{expression}\""
		output_element.show()
		return
	
	output_parts = [];
	out = (s) -> output_parts.push s
	
	if MathJax?.isReady
		out "<h3 id=output_input>Input</h3>"
		out "<div>\\begin{align}"
		
		for line in parsed
			for expression in line
				out texscapeify expression
				out " & "
			out " \\\\\n<br>"
		
		out "\\end{align}</div>"
		
		out "<h3 id=output_steps>Steps</h3>"
		out "<div>\\begin{align}"
		out "\\end{align}</div>"
		
		out "<h3 id=output_results>Results</h3>"
		out "<div>\\begin{align}"
		
		for line in parsed
			for expression in line
				out texscapeify expression.canonize()
				out " & "
			out " \\\\\n<br>"
		
		out "\\end{align}</div>"
		output_element.html output_parts.join ""
		
		MathJax.Hub.Queue ["Typeset", MathJax.Hub, (output_element.get 0) ]
	else # plain text output
		out "<h3 id=output_input>Input</h3>"
		out "<pre>"
		
		for line in parsed
			for expression in line
				out escape_html expression.to_string()
				out "\t"
			out "\n"
		
		out "</pre>"
		
		out "<h3 id=output_steps>Steps</h3>"
		out "<pre>"
		out "</pre>"
		
		out "<h3 id=output_results>Results</h3>"
		out "<pre>"
		
		for line in parsed
			for expression in line
				out escape_html expression.canonize().to_string()
				out "\t"
			out "\n"
		
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

$.fn.select_all = ->
	"Sets the user's selection in an input/textarea to the complete contents."
	
	for element in this
		element.selectionStart = 0
		element.selectionEnd = element.value.length
	
	this

$ main = ->
	"Make it all start working when the DOM's ready."
	
	"Since it's not strictly necessary we don't load MathJax until after all
	of the required scripts."
	
	mathjax_load()
	qs = get_qs()
	
	input_box = $ "#input"
	result_box = $ "#results"
	form = $ "form"
	
	em_pixels = ems_per_pixel_in $ "body"
	
	input_box.keypress (event) ->
		if event.which is 13 or event.which is 10
			if event.shiftKey
				($ "form").submit()
				false # suppress newline
			else
				scale_textarea input_box, +1
	
	input_box.keyup (event) -> scale_textarea input_box, em_pixels
	scale_textarea input_box, em_pixels
	
	form.submit ->
		input = ($ "#input").val()
		process_math input, result_box
		location.hash = "i=#{encode input}"
		
		false # suppress normal form submission
	
	provided_input = if (location.hash.slice 0, 3) is "#i="
		decode location.hash.slice 3
	else
		qs.i
	
	input = provided_input or default_input
	input_box.val input
	scale_textarea input_box, em_pixels
	
	input_box
		.select_all()
		.focus()
	
	if provided_input
		"We give MathJax two seconds to load, then process into plain text if
		necessary."
		
		if mj_wait and not MathJax?.isReady
			processed = false
			
			process_once = ->
				return if processed
				processed = true
				process_math input, result_box if provided_input
			
			shore.__main_on_mathjax_loaded = process_once
			setTimeout process_once, mj_wait
		else
			process_math input, result_box if provided_input
