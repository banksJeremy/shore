#!/usr/bin/env coffee -c
default_input = """
	A = -g_gemini; g_gemini = 0.00015
	v = A ~ t + v_0; v_0 = 0
	d = v ~ t + d_0; d_0 = 1
	t_fall = t(d=0)
"""

shore.__main_mj_ready = ->

mathjax_src = "https://jbmathjax.s3.amazonaws.com/mathjax-1.0.1/MathJax.js"

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
				inlineMath: [["\\(", "\\)"]],
				displayMath: [["\\[", "\\]"]]
			},
			messageStyle: "none"
		});
		
		MathJax.Hub.Startup.onload();
		MathJax.Hub.Register.StartupHook("End", function() {
			shore.__main_mj_ready()
		});
	"""
	
	if window.opera?
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
	query_string = window.location.search.substring 1
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
		if character == target_character
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

process_math = (input, output) ->
	output.show 300
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
		throw e if not /^(Parse|Lexical) error/.test e.message # lack of exception type...
		
		output.empty()
		output.append (($ "<pre>").css whiteSpace: "pre-line").
			text e.message.replace "on line 1", "in \"#{expression}\""
		output.show()
		return
	
	output_parts = []
	
	if MathJax?.isReady
		output_parts.push "<h3><span class=tex2jax_ignore>Input</span></h3>"
		output_parts.push "<div>\\begin{align}"
		
		for line in parsed
			for expression in line
				output_parts.push texscapeify expression
				output_parts.push " & "
			output_parts.push " \\\\\n<br>"
		
		output_parts.push "\\end{align}</div>"
		
		output_parts.push "<h3><span class=tex2jax_ignore>Steps</span></h3>"
		output_parts.push "<div>\\begin{align}"
		output_parts.push "\\end{align}</div>"
		
		output_parts.push "<h3><span class=tex2jax_ignore>Results</span></h3>"
		output_parts.push "<div>\\begin{align}"
		
		for line in parsed
			for expression in line
				output_parts.push texscapeify expression.canonize()
				output_parts.push " & "
			output_parts.push " \\\\\n<br>"
		
		output_parts.push "\\end{align}</div>"
		output.html output_parts.join ""
		
		MathJax.Hub.Queue ["Typeset", MathJax.Hub, (output.get 0) ]
	else
		output_parts.push "<h3>Input</h3>"
		output_parts.push "<pre>"
		
		for line in parsed
			for expression in line
				output_parts.push escape_html expression.to_string()
				output_parts.push "\t"
			output_parts.push "\n"
		
		output_parts.push "</pre>"
		
		output_parts.push "<h3>Steps</h3>"
		output_parts.push "<pre>"
		output_parts.push "</pre>"
		
		output_parts.push "<h3>Results</h3>"
		output_parts.push "<pre>"
		
		for line in parsed
			for expression in line
				output_parts.push escape_html expression.canonize().to_string()
				output_parts.push "\t"
			output_parts.push "\n"
	
		output_parts.push "</pre>"
		
		output.html output_parts.join ""
	
	($ "h3").css cursor: "pointer"
	($ "h3").hover (-> ($ this).css backgroundColor: "rgba(0,0,0,.1)"),
	               (-> ($ this).css backgroundColor: "transparent")
	($ "h3").toggle (-> ($ this).next().show 300), (-> ($ this).next().hide 300)
	($ "h3 + div").hide()
	(($ "h3").eq 0).click()
	(($ "h3").eq 2).click()


$ main = ->
	"Make it all start working when the DOM's ready."
	
	"Since it's not strictly necessary we don't load MathJax until after all
	of the required scripts."
	mathjax_load()
	
	qs = get_qs()
	
	input_box = $ "#input"
	result_box = $ "#results"
	form = $ "form"
	
	input_box.focus()
	
	em_pixels = ems_per_pixel_in $ "body"
	
	input_box.keypress (event) ->
		if event.which == 13 or event.which == 10
			if event.shiftKey
				($ "form").submit()
				false
			else
				scale_textarea input_box, +1
				# where it most needs to be snappy
	
	input_box.keyup (event) -> scale_textarea input_box, em_pixels
	scale_textarea input_box, em_pixels
	
	form.submit window = ->
		input = ($ "#input").val()
		process_math input, result_box
		window.location.hash = "i=#{encode input}"
		
		false # prevent form from being submitted normally
	
	provided_input = qs.i or if (location.hash.slice 0, 3) is "#i="
		decode location.hash.slice 3
	
	input = provided_input || default_input
	input_box.val input
	scale_textarea input_box, em_pixels
	
	(input_box.get 0).selectionStart = 0
	(input_box.get 0).selectionEnd = input_box.val().length
	
	if provided_input
		"We give MathJax two seconds to load, then fall back to plain text."
		
		if mj_wait
			processed = false
			
			process_once = ->
				return if processed
				processed = true
				process_math input, result_box if provided_input
			
			shore.__main_mj_ready = ->
				process_once()
			setTimeout process_once, mj_wait
		else
			process_math input, result_box if provided_input
