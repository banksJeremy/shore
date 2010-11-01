#!/usr/bin/env coffee -c
###
Shore Math Module
http://jeremybanks.github.com/shore/

Copyright Jeremy Banks <jeremy@jeremybanks.com>
Released under the MIT License
### 

# This module exports a single function under the names S and shore, with a
# single submodule defined as .utility and .U. In most cases you will only
# need to call the module function and not use any of the functions it
# contains directly, provided that you also include shore.parser.
# 
# The module is defined piecemeal:
# 
#   1. the object is created as a function that may be used to create shore
#      objects, using shore.parser if available.
#   
#   2. the shore.utility submodule is defined.
#   
#   3. components of the shore module which are not its types are defined
#      as __not_types and then added to the shore object.
#   
#   4. the shore types are defined initially as __types, provider functions
#      are generated and then it's all added to the shore object.
#   
#   5. the canonizations for the types are defined initially by functions
#      in __definers_of_canonizers, which are evaluated and added added to
#      their respective types.

root = this

former_S = root.S
former_shore = root.shore

shore = root.S = root.shore = (args...) ->
	# The shore object is a function which can be called to create shore values.
	# Without shore.parser it will only be able to create numbers and
	# identifiers. If multiple arguments are provided it will return an array
	# of values, so you can do things like [x, y, z] = shore "x", "y", "z".
	
	if args.length is 1
		arg = args[0]
		
		if typeof arg is "number"
			S.number value: arg
		else if typeof arg is "string"
			if /^[a-zA-Z][a-zA-Z0-9]*'*$/.test arg
				S.identifier value: arg
			else
				if shore.parser?
					shore.parser.parse arg
				else
					throw new Error "shore.parser is not available to interpret expression: #{arg}"
		else
			throw new Error "Unable to handle argument of type #{typeof arg}."
	else
		for arg in args
			shore arg

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
		# Converts an object to a string or calls its __hash__ method recursively
		# in Arrays and Object.
		
		String utility.call_in object, (object) ->
			if object.__hash__?
				object.__hash__()
			else
				String object
	
	memoize: (f, memory, hasher) ->
		# Memoizes a function using a specified memory object and hash function.
		# 
		# Memory defaults to a new empty object.
		# Hasher defaults to utility.hash.
		
		hasher ?= hash
		memory ?= {}
		
		memoized = (arguments...) ->
			"The memoized copy of a function."
			
			key = memoized.hasher [this].concat arguments
			
			if key of memory
				memoized.memory[key]
			else
				memoized.memory[key] = f.apply this, arguments...
		
		memoized.memory = memory
		memoized
	
	sss: (s) ->
		# Splits a String on Spaces
		
		s.split " "
	
	make_providers: (module) ->
		# For each CamelName on module defined module.uncameled_name to be
		# module._make_provider module.CamelName.
		
		for old_name of module
			if new_name = utility.uncamel old_name
				module[new_name] = module._make_provider module[old_name]
	
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
	
	call_in: (object, f, extra_arguments...) ->
		# Calls function on an object or recursively within Arrays and Objects.
		
		if utility.is_array object
			for value in object
				f value, extra_arguments...
		else if utility.is_object object
			result = {}
			for key, value of object
				result[key] = f value, extra_arguments...
			result
		else
			f object, extra_arguments...

__not_types =
	# Merged onto shore first, as they may be required by the defenitions of
	# shore types.
	
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
		sin: [ "sin", "\\sin" ]
		cos: [ "cos", "\\cos" ]
		tan: [ "tan", "\\tan" ]
		arcsin: [ "arcsin", "\\arcsin" ]
		arccos: [ "arccos", "\\arccos" ]
		arctan: [ "arctan", "\\arctan" ]
	
	_make_provider: (cls) ->
		# Used to generate shore.foo_bar from shore.FooBar.
		# 
		# Just new for now, later we'll memoize.
		
		(args...) -> new cls args...
	
	_significance: (x) ->
		if x of shore._significances
			@_significances[x]
		else
			x
	
	_signified: (significance, f) ->
		f.significance = (shore._significance significance)
		f
	
	canonization: (significance, name, f) ->
		(shore._signified significance, f)
	
	_significances:
		minor: 0
		moderate: 1
		major: 2
	
	canonize: (object, arguments...) ->
		# Canonizes an object or recrusively within Arrays and Objects.
		
		utility.call_in ((o, args...) -> o.canonize args...), object, arguments

utility.extend shore, __not_types

# used in defining types
sss = utility.sss

__types =
	# The types of the shore module.
	
	Thing: class Thing
		precedence: 0
		
		req_comps: []
		
		constructor: (@comps) ->
			for name in @req_comps
				if not @comps[name]?
					throw new Error "#{@type ? @constructor} object requires value for #{name}"
		
		eq: (other) ->
			@type is other.type and @_eq other
		
		canonize: (enough, excess) ->
			enough = shore._significance enough
			excess = shore._significance excess
			
			result = this
			
			loop
				next = result.next_canonization()
				if not next.length then break
				[{significance: significance}, value] = next
				
				if excess? and significance >= excess then break
				result = value
				if enough? and significance >= enough then break
			
			result
		
		next_canonization: ->
			for canonization in @get_canonizers()
				value = canonization.apply this
				
				if value and not @eq(value)
					return [canonization, value]
		
		get_canonizers: -> @_get_canonizers() #(utility.nullary_proto_memo "get_canonizers",
			#-> @_get_canonizers())
		
		_get_canonizers: -> []
		
		to_tex: (context) ->
			context ?= 1
			
			if @precedence < context
				"\\left(#{@to_free_tex()}\\right)"
			else
				@to_free_tex()
		
		to_string: (context) ->
			context ?= 0
			if @precedence < context
				"(#{@to_free_string()})"
			else
				@to_free_string()
		
		to_free_string: -> "(shore.#{@type} value)"
		to_free_tex: -> "\\text{(shore.#{@type} value)}"
		to_cs: -> "(shore.#{@type.toLowerCase()} #{@comps})"
		toString: -> @to_cs()
		
	Value: class Value extends Thing
		is_a_value: true
		
		plus: (other) -> shore.sum operands: [this, other]
		minus: (other) -> shore.sum operands: [this, other.neg()]
		times: (other) -> shore.product operands: [this, other]
		over: (other) -> shore.product operands: [this, other.to_the shore (- 1)]
		pos: -> this
		neg: -> (shore (-1)).times(this)
		to_the: (other) -> shore.exponent base: this, exponent: other
		equals: (other) -> shore.equality operands: [this, other]
		integrate: (variable) -> shore.integral expression: this, variable: variable
		differentiate: (variable) -> shore.derivative expression: this, variable: variable
		given: (substitution) -> shore.pending_substitution expression: this, substitution: substitution
		plus_minus: (other) -> shore.with_margin_of_error value: this, margin: other
		
		_then: (other) ->
			if other.is_a_value
				this.times other
			else
				this.given other
	
	Number: class Number extends Value
		precedence: 10
		req_comps: sss "value"
		
		_eq: (other) -> @value is other.value
		neg: -> shore.number value: -@value
		to_free_tex: -> String @value
		to_free_string: -> String @value
	
	Identifier: class Identifier extends Value
		precedence: 10
		
		req_comps: sss "value tex_value"
		
		constructor: (comps) ->
			{ tex_value: tex_value, value: value } = comps
			
			if not tex_value?
				if value of shore._special_identifiers
					[value, tex_value] = shore._special_identifiers[value]
				else
					tex_value = value
			
			super { tex_value: tex_value, value: value }
		
		_eq: (other) -> @value is other.value
		to_free_tex: -> @tex_value
		to_free_string: -> @string_value
		
		sub: (other) ->
			string = "#{@string_value}_#{other.to_string()}"
			tex = "{#{@tex_value}}_{#{other.to_tex()}}"
			shore.identifier value: string, tex_value: tex
	
	CANOperation: class CANOperation extends Value
		# Commutitive, Assocative N-ary Operation
		
		req_comps: sss "operands"
		
		_eq: (other) ->
			if @comps.operands.length isnt other.operands.length
				return false
			
			for i in [0...@comps.operands.length]
				if not (@comps.operands[i].eq other.operands[i])
					return false
			
			true
		
		to_free_tex: ->
			(((operand.to_tex @precedence) for operand in @comps.operands)
			 .join @tex_symbol)
		
		to_free_string: ->
			(((operand.to_string @precedence) for operand in @comps.operands)
			 .join @string_symbol)
		
	Sum: class Sum extends CANOperation
		precedence: 2
		get_nullary: -> shore 0
		
		string_symbol: " + "
		tex_symbol: " + "
		
		to_free_text: -> super().replace /\+ *\-/, "-" # HACK
		to_free_tex: -> super().replace /\+ *\-/, "-" # HACK
	
	Product: class Product extends CANOperation
		precedence: 4
		get_nullary: -> shore 1
		
		string_symbol: " * "
		tex_symbol: " \\cdot "
		
		_to_free_tex: (operands) ->
			"Without checking for negative powers."
			
			if operands.length > 1 and
			   operands[0].type is shore.Number and
				 operands[1].type isnt shore.Number
				
				(if operands[0].value isnt -1 then operands[0].to_tex @precedence else "-") +
				(((operand.to_tex @precedence) for operand in operands.slice 1)
				 .join @tex_symbol)
			else
				(((operand.to_tex @precedence) for operand in operands)
				 .join @tex_symbol)
		
		to_free_tex: ->
			positive_exponents = []
			negative_exponents = []
			
			for term in @comps.operands
				if term.type is shore.Exponent
					exponent = term.exponent
					
					if exponent.type is shore.Number and exponent.value < 0
						negative_exponents.push shore.exponent base: term.base, exponent: exponent.neg()
					else
						positive_exponents.push term
				else
					positive_exponents.push term
			
			positive_exponents or= [shore 1]
			
			top = @_to_free_tex positive_exponents
			
			if negative_exponents.length
				bottom = @_to_free_tex negative_exponents
				"\\tfrac{#{top}}{#{bottom}}"
			else
				top
		
		to_free_string: ->
			(operand.to_string() for operand in @comps.operands).join ""
	
	Exponent: class Exponent extends Value
		precedence: 5
		
		_eq: (other) ->
			@comps.base.eq(other.base) and @comps.exponent.eq(other.exponent)
		
		to_free_tex: ->
			if @comps.exponent.type is shore.Number and @comps.exponent.value is 1
				@comps.base.to_tex @precedence
			else
				"{#{@comps.base.to_tex @precedence}}^{#{@comps.exponent.to_tex()}}"
		
		to_free_string: ->
			if @comps.exponent.type is shore.Number and @comps.exponent.value is 1
				@comps.base.to_tex @precedence
			else
				"#{@comps.base.to_string @precedence}^#{@comps.exponent.to_string()}"
		
	Integral: class Integral extends Value
		precedence: 3
		
		_eq: (other) ->
			@comps.expression.eq(other.expression) and
			@comps.variable.eq(other.variable)
		
		to_free_tex: ->
			"\\int\\left[#{@comps.expression.to_tex()}\\right]d#{@comps.variable.to_tex()}"
		
		to_free_string: ->
			"int{[#{@comps.expression.to_tex()}]d#{@comps.variable.to_tex()}}"
	
	Derivative: class Derivative extends Value
		precedence: 3
		
		_eq: (other) ->
			@expression.eq(other.expression) and @comps.variable.eq(other.variable)
		
		to_free_tex: ->
			"\\tfrac{d}{d#{@comps.variable.to_tex()}}\\left[#{@comps.expression.to_tex()}\\right]"
		
		to_free_string: ->
			"d/d#{@comps.variable.to_tex()}[#{@comps.expression.to_tex()}]"
	
	WithMarginOfError: class WithMarginOfError extends Value
		precedence: 1.5
		
		tex_symbol: " \\pm "
		string_symbol: " ± "
		
		to_free_string: ->
			if not @margin.eq (shore 0)
				"#{@comps.value.to_string @precedence}
				 #{@string_symbol}
				 #{@comps.margin.to_string @precedence}"
			else
				@comps.value.to_string @precedence
		
		to_free_tex: ->
			if not @margin.eq (shore 0)
				"#{@comps.value.to_tex @precedence}
				 #{@tex_symbol}
				 #{@comps.margin.to_tex @precedence}"
			else
				@comps.value.to_tex @precedence
	
	Equality: class Equality extends CANOperation
		precedence: 1
		
		is_a_value: false # >_< HACK
		
		string_symbol: " = "
		tex_symbol: " = "
	
	PendingSubstitution: class PendingSubstitution extends Value
		precedence: 2.5
		
		constructor: (comps) ->
			comps.is_a_value = comps.expression.is_a_value
			super comps
		
		_eq: (other) ->
			@expression.eq(other.expression) and @substitution.eq(other.substitution)
		
		string_symbol: ""
		tex_symbol: ""
		
		to_free_string: ->
			(@comps.expression.to_string @precedence) +
			@string_symbol +
			(@comps.substitution.to_string @precedence)
		
		to_free_tex: ->
			(@comps.expression.to_tex @precedence) +
			@tex_symbol +
			(@comps.substitution.to_tex @precedence)

# Set the .type property of each type to itself
for name, type of __types
	type.type = type

utility.extend shore, __types
utility.make_providers shore

__definers_of_canonizers = [
	"Thing", -> 
		for significance of shore.significances
			canonization significance, "components #{significance}", ->
				@provider shore.canonize @comps, significance, significance
	
	"CANOperation", -> @__super__.canonizers.concat [
		canonization "minor", "single argument", ->
			@operands[0] if @operands.length is 1
		
		canonization "minor", "no arguments", ->
			@get_nullary() if @operands.length is 0 and @get_nullary
	]
	
	"Sum", -> @__super__.canonizers.concat [
		canonization "major", "numbers in sum", ->
			numbers = []
			not_numbers = []
			
			for operand in @operands
				if operand.type is shore.Number
					numbers.push operand
				else
					not_numbers.push operand
			
			if numbers.length > 1
				sum = @get_nullary().value
				
				while numbers.length
					sum += numbers.pop().value
				
				shore.sum operands: [ shore.number sum ].concat not_numbers
	]
]

for index of __definers_of_canonizers
	if not index % 2
		[name, definer] = [__definers_of_canonizers[index], __definers_of_canonizers[index + 1]]
		shore[name].canonizers = definer.apply shore[name]

