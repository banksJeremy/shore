#!/usr/bin/env coffee -c
root = exports ? this
S = shore = root.S = root.shore ?=
	_former_S: root.S
	_former_shore: root.shore

S.U = S.utility =
	uncamel: (string) ->
		"Converts CamelBack string (not just UPPERCASE) to lowercased_underscore.
		
		Returns undefined if string's not in CamelBack."
		
		if (/^[A-Z]/.test string) and (/[a-z]/.test string)
			parts = (for part in string.split /(?=[A-Z0-9]+)/
				if part then part.toLowerCase())
			return parts.join "_"
	
	memoizer: SU_memoizer = (hasher, memory) ->
		"Returns a function that use hasher to generate the keys used to memoize a
		function, storing the results in memoized[hasher([key].concat arguments)].
		
		If you want to specify the memory that will be used for the hasher"
		
		memoize: (f, hasher, memory) ->
			"Memoizes a function."
			
			memory = memory ? {}
			
			memoized = (arguments...) ->
				"The memoized copy of a function."
				
				key = hasher [this].concat arguments
				
				if key of memory
					memory[key]
				else
					memory[key] = f.apply this, arguments...
			
			memoized.memory = memory
			memoized
	
	
