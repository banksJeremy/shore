__not_types =
	__hashed__: "!!SHORE!!"
	
	former_S: former_S,
	former_shore: former_shore,
	
	no_conflict: (deep) ->
		# Resets the value of root.S that what it was before shore was imported.
		# If deep is a true value than root.shore is also reset. Returns shore.
		
		root.S = @former_S
		root.shore = @former_shore if deep
		this
	
	_special_identifiers:
		# If an identifier is created with one of these values it is converted
		# into the corresponding string/tex values.
		
		theta: [ "θ", "\\theta" ]
		pi: [ "π", "\\pi" ]
		tau: [ "τ" , "\\tau" ]
		mu: [ "μ", "\\mu" ]
	
	_make_provider: (cls) ->
		# Used to generate shore.foo_bar from shore.FooBar.
		
		utility.memoize (args...) -> new cls args...
	
	_significance: (x) ->
		if x of shore._significances
			@_significances[x]
		else
			x
	
	_signified: (significance, f) ->
		f.significance = (shore._significance significance)
		f
	
	canonization: (significance, name, f) ->
		(shore._signified significance, utility.memoize f)
	
	_significances:
		invisible: 0
		# changes that aren't even visible in normal output
		# e.g. ((1 + 2) + 3) -> (1 + 2 + 3)
		organization: 1
		# changes that maintain essentially the same components
		# e.g. (3 + 1 + 2) -> (1 + 2 + 3) or (2a + 3b + a) -> (3a + 3b)
		significant: 2
		# ...
		# e.g. ((a + b) ~ x) -> ((a ~ x) + (b ~ x))
		overwhelming: 3
		# changes that result in an entirely different object
		# e.g. (2 ~ x) -> (2x)
	
	canonize: (object, arguments...) ->
		# Canonizes an object or recrusively within Arrays and Objects.
		
		f = (object, arguments...) ->
			if object.is_shore_thing
				object.canonize arguments...
			else
				object
		
		utility.call_in object, f, arguments...
	
	to_string: (object) ->
		if object.is_shore_thing
			object.to_string()
		else
			String object
	
	to_tex: (object) ->
		if object.is_shore_thing
			object.to_tex()
		else
			String object
	
	substitute: (within, original, replacement) ->
		f = (object, original, replacement) ->
			if object.is_shore_thing
				if object.is original
					replacement
				else
					object.provider shore.substitute object.comps, original, replacement
			else
				object
		
		utility.call_in within, f, original, replacement
	
	is: (a, b) ->
		# Determines equality of two objects or recursively within arrays and
		# objects.
		
		if utility.is_object a
			return false if not utility.is_object b
			
			for key of a
				return false if key not of b
			for key of b
				return false if key not of a
			for key of a
				return false if not shore.is a[key], b[key]
			true
		else if utility.is_array a
			return false if not utility.is_array b
			return false if a.length isnt b.length
			
			for index of a
				return false if not shore.is a[index], b[index]
			
			true
		else
			return false if a?.type isnt b?.type
			
			if a.is_shore_thing
				a.is b
			else
				a is b

utility.extend shore, __not_types
