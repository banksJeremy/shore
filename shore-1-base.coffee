###
Shore
http://jeremybanks.github.com/shore/

Copyright Jeremy Banks <jeremy@jeremybanks.com>
Released under the MIT License
### 

# This module exports a single function under the names S and shore, with a
# single submodule defined as .utility and .U. In most cases you will only
# need to call the module function and not use any of the functions it
# contains directly, provided that you also include shore.parser.

# The module is split into four files which are to be concatenated.
#
# shore-1-base.coffee
# 	defines the shore function object and the shore.utility submodule.
# shore-2-not-types.coffee
# 	defines functions and constants in the shore module.
# shore-3-types.coffee
# 	defines most aspects of the types in the shore module.
# shore-4-canonizations.coffee
# 	defines the canonization methods of the types.
"use strict"

root = this

former_S = root.S
former_shore = root.shore

shore = root.S = root.shore = (args...) ->
	# The shore object is a function which can be called to create shore values.
	# Without shore.parser it will only be able to create identifiers, numbers
	# (when numbers are provided) and matricies (when 2d arrays are provided).
	# If multiple arguments are provided it will provide a system.
	
	if args.length is 1
		arg = args[0]
		
		if arg.is_shore_thing
			arg
		else if typeof arg is "object" and arg.constructor is Array
			if arg.length and typeof arg[0] is "object" and arg[0].constructor is Array
				shore.matrix values: utility.call_in arg, shore
			else
				throw new Error "Unable to handle argument of 1D array."
		else if typeof arg is "number"
			shore.number value: arg
		else if typeof arg is "string"
			if /^[a-zA-Z][a-zA-Z0-9]*'*$/.test arg
				if arg of shore.builtins
					shore.builtins[arg]
				else
					shore.identifier value: arg
			else
				if shore.parser?
					shore.parser.parse arg
				else
					throw new Error "shore.parser is not available to interpret expression: #{arg}"
		else
			throw new Error "Unable to handle argument of type #{typeof arg}."
	else if args.length
		shore.system equations: (shore arg for arg in args)
	else
		shore # ?

utility = shore.utility = shore.U =
	# The shore.utility module contains functions that are not shore-specific.
	
	uncamel: (string) ->
		# Converts CamelBack string (not just UPPERCASE) to lowercased_underscore.
		# 
		# Returns undefined if string's not in CamelBack.
		
		if (/^[A-Z]/.test string) and (/[a-z]/.test string)
			parts = (for part in string.split /(?=[A-Z0-9]+)/
				if part then part.toLowerCase())
			return parts.join "_"
	
	hash: (object) ->
		if object.__hashed__?
			object.__hashed__
		else if object.__hash__? # only define on immutable types
			object.__hashed__ = "OH{#{object.__hash__()}}"
		else
			if utility.is_array object
				"L{#{(utility.hash o for o in object).join "|"}}"
			else if typeof object is "object"
				(sorted_keys = (key for key of object)).sort utility.compare_by_hash
				"O{#{(utility.hash k + ":" + utility.hash object[k] for k in sorted_keys).join "|"}}"
			else
				String object
	
	compare_by_hash: (a, b) ->
		ha = utility.hash a
		hb = utility.hash b
		
		if ha > hb
			-1
		else if ha == hb
			0
		else
			1
	
	memoize: (f, memory, hasher) ->
		# Memoizes a function using a specified memory object and hash function.
		# 
		# Memory defaults to a new empty object.
		# Hasher defaults to utility.hash.
		
		hasher ?= utility.hash
		memory ?= {}
		
		memoized = (arguments...) ->
			"The memoized copy of a function."
			
			key = memoized.hasher [this].concat arguments
			
			if key of memory
				memoized.memory[key]
			else
				memoized.memory[key] = f.apply this, arguments
		
		memoized.memory = memory
		memoized.hasher = hasher
		
		memoized
	
	sss: (s) ->
		# Splits a String on Spaces
		
		s.split " "
	
	make_providers: (module) ->
		# For each CamelName on module defined module.uncameled_name to be
		# module._make_provider module.CamelName.
		
		for old_name of module
			if new_name = utility.uncamel old_name
				module[new_name] = module[old_name]::provider = module._make_provider module[old_name]
	
	extend: (destination, sources...) ->
		# Copies all properties from each source onto destination
		
		for source in sources
			for property of source
				destination[property] = source[property]
	
	is_array: (object) ->
		# Determines if an object is exactly of type Array
		
		typeof object is "object" and object.constructor is Array
	
	is_object: (object) ->
		# Determines if an object is exactly of type Object
		
		typeof object is "object" and object.constructor is Object
	
	is_string: (object) ->
		typeof object is "string"
	
	call_in: (object, f, extra_arguments...) ->
		# Calls function on an object or recursively within Arrays and Objects.
		
		if utility.is_array object
			for value in object
				utility.call_in value, f, extra_arguments...
		else if utility.is_object object
			result = {}
			for key, value of object
				result[key] = utility.call_in value, f, extra_arguments...
			result
		else if typeof object is "object"
			f object, extra_arguments...
		else # we leave functions/strings/etc alone
			object
	
	occurences: (string, target_character) ->
		 # Counts the occurrences of a given character in a string.
		
		result = 0
		for character in string
			if character is target_character
				result += 1
		result
