#!/usr/bin/env coffee -c
ui = (this.shore ?= {}).ui =
	__load_mathjax_callback__: null
	
	load_mathjax: (src, callback) ->
		# http://www.mathjax.org/docs/dynamic.html
		# apparently creating script tags with jQuery had oddities...
		
		ui.__load_mathjax_callback__ = callback ? null
		
		script = document.createElement "script"
		script.type = "text/javascript"
		script.src = src
		config = """
			MathJax.Hub.Config({
				jax: ["input/TeX", "output/HTML-CSS"],
				extensions: ["tex2jax.js", "TeX/AMSmath.js", "TeX/AMSsymbols.js"],
				tex2jax: {
					inlineMath: [["\\\\(", "\\\\)"]],
					displayMath: [["\\\\[", "\\\\]"]]
				},
				skipStartupTypeset: true,
			});

			MathJax.Hub.Startup.onload();
			MathJax.Hub.Register.StartupHook("End", function() {
				var callback;
				if (callback = shore.ui.__load_mathjax_callback__) callback();
			});
		"""
		
		if opera?
			script.innerHTML = config
		else
			script.text = config
		
		(document.getElementsByTagName "head")[0].appendChild script
	
	decode: (s) -> decodeURIComponent s.replace(/\+/g, " ")
	encode: encodeURIComponent
	
	html_entities:
		"&": "&amp;"
		"<": "&lt;"
		">": "&gt;"
		"\"": "&quot;"
		"'": "&#39;"
	
	escape_html: (original) ->
		pattern = ui.escape_html._pattern ?=
			/(#{(c for c of ui.html_entities).join "|"})/g
		
		original.replace pattern, (c) -> ui.html_entities[c]
	
	scale_textarea: (textarea, pixels_per_line, modifier) ->
		# Set the height of a jQuery textarea based on the newlines contained.
		# (2 + newlines) ems
		
		modifier ?= 0
		
		lines = (shore.utility.occurences textarea.val(), "\n") + 2 + modifier
		
		textarea.css "height", lines * pixels_per_line
	
	configure_textarea: (textarea) ->
		# Sets a jQuery textarea to resize as needed and submit on shift+enter.
		
		pixels_per_line = ui.pixels_per_em $ "body"
		
		textarea.keypress (event) ->
			if event.which is 13 or event.which is 10
				if event.shiftKey
					(textarea.closest "form").submit()
					false # suppress newline
				else
					ui.scale_textarea textarea, pixels_per_line, +1
		
		textarea.keyup (event) -> ui.scale_textarea textarea, pixels_per_line
		
		ui.scale_textarea textarea, pixels_per_line
	
	pixels_per_em: (element, sample_size) ->
		# Returns the approximate number of pixels per em in a given jQuery
		# element.
		
		sample_size ?= 10
		test_element = ($ "<div>").css width: "#{sample_size}em"
		test_element.appendTo element
		result = parseFloat(test_element.css "width") / sample_size
		test_element.remove()
		result
	
	select_all: (elements) ->
		# Sets the users selection of jQuery textarea/input elements to all
		# of its contents.
		
		for element in elements
			element.selectionStart = 0
			element.selectionEnd = element.value.length
	
	parse_qs: (qs) ->
		# Returns an object representing the contents of the query string.
		
		qs ?= location.search.substring 1
		
		result = {}
		re = /([^&=]+)=([^&]*)/g
		
		while match = re.exec qs
			[_, key, value] = match
			
			if key[-2..key.length] == "[]"
				result[key] ?= []
				result[key].push ui.decode value
			else
				result[key] = ui.decode value
		
		return result
