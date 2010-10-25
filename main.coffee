#!/usr/bin/env coffee -c
$ -> # jQuery on DOM ready...
	emPixels = ((element) ->
		"The approximate number of pixels per em in an element."
		
		test_element = ($ "<div>").css width: "10em"
		test_element.appendTo element
		result = parseFloat(test_element.css "width") / 10
		test_element.remove()
		result
	) ($ "body")
	occurences = (string, target_character) ->
		"The number of occurrences of a given character in a string."
		
		result = 0
		for character in string
			if character == target_character
				result += 1
		result
	scale_textarea = (textarea, modifier) ->
		"Set the height of a jQ textarea based on the newlines contained.
		
		(2 + newlines) ems."
		
		modifier ?= 0
		
		ems = (occurences textarea.val(), "\n") + 2 + modifier
		
		textarea.css "height", ems * emPixels
	escape_html = (raw) ->
		raw.replace("&", "&amp").replace("<", "&lt;").replace(">", "&gt;")
	
	input_box = $ "#input"
	result_box = $ "#results"
	form = $ "form"
	
	input_box.focus()
	
	input_box.keypress (event) ->
		if event.which == 13 or event.which == 10
			if event.shiftKey
				($ "form").submit()
				false
			else
				scale_textarea input_box, +1
				# where it most needs to be snappy
	
	input_box.keyup (event) -> scale_textarea input_box
	scale_textarea input_box
	
	texscapeify = (value) ->
		((escape_html value.to_tex()).replace /=/, "&=")
	
	process_math = (input, output) ->
		parsed = []
		for line in input.split /\n/
			if line.length
				parsed_line = []
				for expression in line.split /;/
					if expression.length
						parsed_line.push parser.parse expression
				parsed.push parsed_line
		
		output_parts = []
		
		if MathJax
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
		($ "h3").toggle (-> ($ this).next().hide 300), (-> ($ this).next().show 300)
		
		if MathJax
			MathJax.Hub.Queue ["Typeset", MathJax.Hub, (output.get 0) ]
	
	form.submit window.__go = ->
		input = ($ "#input").val()
		process_math input, result_box
		
		false # prevent form from being submitted normally
