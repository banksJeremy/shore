#!/usr/bin/env coffee -c
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
				if arg of shore.predefined_identifiers
					shore.predefined_identifiers[arg]
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

__not_types =
	# Merged onto shore first, as they may be required by the defenitions of
	# shore types.
	
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
		minor: 0
		moderate: 1
		major: 2
	
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

# used in defining types
sss = utility.sss

__types =
	# The types of the shore module.
	
	Thing: class Thing
		# The underlying mechanisms of all of our types, without anything of
		# actual math.
		
		is_shore_thing: true
		
		req_comps: []
		
		identifier_string_set: utility.memoize ->
			all = {}
			
			if @type is shore.Identifier
				all[@comps.value] = true
			
			shore.utility.call_in @comps, (o) -> utility.extend all, o.identifier_string_set() if o.is_shore_thing
			
			all
		
		uses_identifier: (o) ->
			o.comps.value of @identifier_string_set()
		
		constructor: (@comps) ->
			for name in @req_comps
				if not @comps[name]?
					throw new Error "#{@name ? @constructor} object requires value for #{name}"
		
		is: (other) ->
			@type is other?.type and shore.is @comps, other.comps
		
		__hash__: ->
			@name + ":" + utility.hash @comps
		
		canonize: utility.memoize (limit, enough) ->
			limit = shore._significance limit
			enough = shore._significance enough
			
			result = this
			
			loop
				next = result.next_canonization()
				if not next.length then break
				
				[{significance: significance}, value] = next
				
				if limit? and significance > limit then break
				result = value
				if enough? and significance >= enough then break
			
			result
		
		next_canonization: ->
			for canonization in @canonizers
				value = canonization.apply this
				
				if value and not @is(value)
					return [canonization, value]
		
		precedence: 0
		# this needs to be more nuanced
		
		to_tex: (context, args...) ->
			context ?= 1
			
			if @precedence < context
				"\\left(#{@to_free_tex args...}\\right)"
			else
				@to_free_tex args...
		
		to_string: (context, args...) ->
			context ?= 0
			if @precedence < context
				"(#{@to_free_string args...})"
			else
				@to_free_string args...
		
		to_free_string: -> "(shore.#{@type} value)"
		to_free_tex: -> "\\text{(shore.#{@type} value)}"
		to_cs: -> "(shore.#{@name.toLowerCase()} #{@comps})"
		toString: -> @to_cs()
		
		_then: (other) ->
			if other.is_a_value
				this.times other
			else
				this.given other
		
		given: (substitution) -> shore.pending_substitution expression: this, substitution: substitution
		
	Value: class Value extends Thing
		known_constant: false
		is_a_value: true
		
		plus: (other) -> shore.sum operands: [this, other]
		minus: (other) -> shore.sum operands: [this, other.neg()]
		times: (other) -> shore.product operands: [this, other]
		over: (other) -> shore.product operands: [this, other.to_the shore (- 1)]
		pos: -> this
		neg: -> (shore (-1)).times(this)
		to_the: (other) -> shore.exponent base: this, exponent: other
		equals: (other) -> shore.equality values: [this, other]
		integrate: (variable) -> shore.integral expression: this, variable: variable
		differentiate: (variable) -> shore.derivative expression: this, variable: variable
		plus_minus: (other) -> shore.with_margin_of_error value: this, margin: other
	
	Number: class Number extends Value
		known_constant: true
		precedence: 10
		req_comps: sss "value"
		
		neg: -> shore.number value: -@comps.value
		to_free_tex: -> String @comps.value
		to_free_string: -> String @comps.value
	
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
		
		to_free_tex: -> @comps.tex_value
		to_free_string: -> @comps.value
		
		sub: (other) ->
			string = "#{@comps.value}_#{other.to_string()}"
			tex = "{#{@comps.tex_value}}_{#{other.to_tex()}}"
			
			shore.identifier value: string, tex_value: tex
	
	CANOperation: class CANOperation extends Value
		# Commutitive, Assocative N-ary Operation
		
		req_comps: sss "operands"
		
		to_free_tex: (symbol) ->
			symbol ?= @tex_symbol
			
			(((operand.to_tex @precedence) for operand in @comps.operands)
			 .join symbol)
		
		to_free_string: (symbol) ->
			symbol ?= @string_symbol
			
			(((operand.to_string @precedence) for operand in @comps.operands)
			 .join symbol)
		
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
				
				(if operands[0].comps.value isnt -1 then operands[0].to_tex @precedence else "-") +
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
					exponent = term.comps.exponent
					
					if exponent.type is shore.Number and exponent.comps.value < 0
						negative_exponents.push shore.exponent base: term.comps.base, exponent: exponent.neg()
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
			(operand.to_string(20) for operand in @comps.operands).join ""
	
	Exponent: class Exponent extends Value
		precedence: 5
		req_comps: sss "base exponent"
		
		to_free_tex: ->
			if @comps.exponent.type is shore.Number and @comps.exponent.comps.value is 1
				@comps.base.to_tex @precedence
			else
				"{#{@comps.base.to_tex @precedence}}^{#{@comps.exponent.to_tex()}}"
		
		to_free_string: ->
			if @comps.exponent.type is shore.Number and @comps.exponent.comps.value is 1
				@comps.base.to_string @precedence
			else
				"#{@comps.base.to_string @precedence}^#{@comps.exponent.to_string()}"
		
	Integral: class Integral extends Value
		precedence: 3
		req_comps: sss "variable expression"
		
		to_free_tex: ->
			"\\int\\left[#{@comps.expression.to_tex()}\\right]d#{@comps.variable.to_tex()}"
		
		to_free_string: ->
			"int{[#{@comps.expression.to_string()}]d#{@comps.variable.to_string()}}"
	
	Derivative: class Derivative extends Value
		precedence: 3
		req_comps: sss "variable expression"
		
		to_free_tex: ->
			"\\tfrac{d}{d#{@comps.variable.to_tex()}}\\left[#{@comps.expression.to_tex()}\\right]"
		
		to_free_string: ->
			"d/d#{@comps.variable.to_string()}[#{@comps.expression.to_string()}]"
	
	WithMarginOfError: class WithMarginOfError extends Value
		precedence: 1.5
		
		tex_symbol: " \\pm "
		string_symbol: " ± "
		
		to_free_string: ->
			if not @margin.is (shore 0)
				"#{@comps.value.to_string @precedence}
				 #{@string_symbol}
				 #{@comps.margin.to_string @precedence}"
			else
				@comps.value.to_string @precedence
		
		to_free_tex: ->
			if not @margin.is (shore 0)
				"#{@comps.value.to_tex @precedence}
				 #{@tex_symbol}
				 #{@comps.margin.to_tex @precedence}"
			else
				@comps.value.to_tex @precedence
	
	Matrix: class Matrix extends Value
		req_comps: sss "values"
		
		to_free_tex: ->
			"\\begin{matrix}
			#{
				((v.to_tex() for v in row).join('&') for row in @comps.values).join(' \\\\\n')
			}
			\\end{matrix}"
	
	Equation: class Equation extends Thing
		precedence: 1
		req_comps: sss "values"
		
		to_free_tex: (symbol) ->
			symbol ?= @tex_symbol
			
			(((value.to_tex @precedence) for value in @comps.values)
			 .join symbol)
		
		to_free_string: (symbol) ->
			symbol ?= @string_symbol
			
			(((value.to_string @precedence) for value in @comps.values)
			 .join symbol)
	
	Equality: class Equality extends Equation
		string_symbol: " = "
		tex_symbol: " = "
		
	ExternalNumericFunction: class ExternalNumericFunction extends Value
		req_comps: sss "identifier arguments f"
		
		specified: ->
			for arg in @comps.arguments
				if arg.type is shore.Identifier
					return false
			true
		
		to_string: (args...) ->
			if not @specified()
				@comps.identifier.to_string args...
			else
				(@comps.identifier.to_string args...) + "_external(#{(shore.to_string a for a in  @comps.arguments).join ', '})"
		
		to_tex: (args...) ->
			if not @specified()
				@comps.identifier.to_tex args...
			else
				(@comps.identifier.to_tex args...) + "_{external}(#{(shore.to_tex a for a in  @comps.arguments).join ', '})"
	
	PendingSubstitution: class PendingSubstitution extends Thing
		precedence: 2.5
		
		req_comps: sss "expression substitution"
		
		constructor: (comps) ->
			@is_a_value = comps.expression.is_a_value
			super comps
		
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
	
	System: class System extends Thing
		precedence: 1000
		req_comps: sss "equations"
		
		to_free_string: -> (eq.to_string for eq in @comps.equations).join "\n"
		to_free_tex: -> (eq.to_tex 0, " &= " for eq in @comps.equations).join " \\\\\n"

# Set the .type property of each type to itself
for name, type of __types
	type::type = type
	type::name = name

utility.extend shore, __types
utility.make_providers shore

shore.predefined_identifiers =
	sin: shore.external_numeric_function
		identifier: shore.identifier (value: "sin", tex_value: "\\sin")
		arguments: [shore.identifier (value: "theta")]
		f: Math.sin
	cos: shore.external_numeric_function
		identifier: shore.identifier (value: "cos", tex_value: "\\cos")
		arguments: [shore.identifier (value: "theta")]
		f: Math.cos
	tan: shore.external_numeric_function
		identifier: shore.identifier (value: "tan", tex_value: "\\tan")
		arguments: [shore.identifier (value: "theta")]
		f: Math.tan

# in defining canonizations
def = (args...) -> args
canonization = shore.canonization

__definers_of_canonizers = [
	def "Thing", ->
		for significance of shore._significances
			canonization significance, "components #{significance}", ->
				@provider shore.canonize @comps, significance, significance
	
	def "CANOperation", -> @__super__.canonizers.concat [
		canonization "minor", "single argument", ->
			@comps.operands[0] if @comps.operands.length is 1
		
		canonization "minor", "no arguments", ->
			@get_nullary() if @comps.operands.length is 0 and @get_nullary
		
		canonization "minor", "commutativity", ->
			# expands out instances of the same thing in itself
			can_expand = false
			for operand in @comps.operands
				if @type is operand.type
					can_expand = true
					break
			
			if can_expand
				new_operands = []
				
				for operand in @comps.operands
					if @type is operand.type
						for suboperand in operand.comps.operands
							new_operands.push suboperand
					else
						new_operands.push operand
				
				@provider operands: new_operands
		
		canonization "moderate", "sort items", ->
			# order is sort-of arbitrary at the moment but we need it to be something
			
			@provider operands: @comps.operands.sort utility.compare_by_hash
		
		canonization "major", "remove redundant nullaries", ->
			n = @get_nullary()
			@provider operands: (o for o in @comps.operands when not o.is n)
	]
	
	def "Sum", -> @__super__.canonizers.concat [
		canonization "major", "numbers in sum", ->
			numbers = []
			not_numbers = []
			
			for operand in @comps.operands
				if operand.type is shore.Number
					numbers.push operand
				else
					not_numbers.push operand
			
			if numbers.length > 1
				sum = @get_nullary().comps.value
				
				while numbers.length
					sum += numbers.pop().comps.value
				
				@provider operands: [ shore.number value: sum ].concat not_numbers
		
		# constant coefficients
	]
	
	def "Product", -> @__super__.canonizers.concat [
		canonization "major", "ZERO IT", ->
			if (shore 0) in @comps.operands
				(shore 0)
		
		canonization "major", "numbers in product", ->
			numbers = []
			not_numbers = []
			
			for operand in @comps.operands
				if operand.type is shore.Number
					numbers.push operand
				else
					not_numbers.push operand
			
			if numbers.length > 1
				product = @get_nullary().comps.value
				
				while numbers.length
					product *= numbers.pop().comps.value
				
				@provider operands: [ shore.number value: product ].concat not_numbers
	]
	
	def "Exponent", -> @__super__.canonizers.concat [
		canonization "minor", "eliminate power of one", ->
			if @comps.exponent.is (shore 1)
				@comps.base
		
		canonization "major", "exponent of numbers", ->
			if @comps.base.type is @comps.exponent.type is shore.Number
				x = Math.pow @comps.base.comps.value, @comps.exponent.comps.value
				shore.number value: x
	]
	
	def "Integral", -> @__super__.canonizers.concat [
		canonization "major", "integration over constant", ->
			if @comps.variable.known_constant
				shore 0
		
		canonization "major", "integration of constant", ->
			if @comps.expression.known_constant
				@comps.expression.times @comps.variable
		
		canonization "moderate", "rule of sums", ->
			if @comps.expression.type is shore.Sum
				shore.sum operands: for term in @comps.expression.comps.operands
					shore.integral variable: @comps.variable, expression: term
		
		canonization "moderate", "constant coefficient", ->
			if @comps.expression.type is shore.Product
				terms = @comps.expression.comps.operands
				coefficient = terms[0]
				if coefficient.known_constant
					coefficient.times shore.integral
						variable: @comps.variable
						expression: shore.product (operands: terms[1...terms.length])
		
		canonization "major", "integration over self", ->
			if @comps.expression.is @comps.variable
				@comps.expression.to_the(shore 2).over(shore 2)
		
		canonization "major", "power rule", ->
			if @comps.expression.type is shore.Exponent
				{ base: base, exponent: exponent } = @comps.expression.comps
				new_exponent = exponent.plus (shore 1)
				if base.is @comps.variable
					base.to_the(exponent.minus new_exponent).over(new_exponent)
	]
	
	def "Derivative", -> @__super__.canonizers.concat [
		canonization "moderate", "differentiation over self", ->
			if @comps.variable.is @comps.expression
				shore 1
		
		canonization "moderate", "differentiation over constant", ->
			if @comps.variable.known_constant
				shore 0
		
		canonization "moderate", "differentiation of constant", ->
			if @comps.expression.known_constant
				shore 0
		
		canonization "moderate", "rule of sums", ->
			if @comps.expression.type is shore.Sum
				shore.sum operands: for term in @comps.expression.comps.operands
					shore.derivative (variable: @comps.variable, expression: term)
		
		canonization "major", "constant coefficient", ->
			if @comps.expression.type is shore.Product
				terms = @comps.expression.comps.operands
				coefficient = terms[0]
				if coefficient.known_constant
					coefficient.times shore.derivative
						variable: @comps.variable
						expression: shore.product(operands: terms[1...terms.length])
		
		canonization "major", "power rule", ->
			if @comps.expression.type is shore.Exponent
				{ base: base, exponent: exponent } = @comps.expression.comps
				if base.is @comps.variable
					exponent.times(base).to_the(exponent.minus (shore 1))
		
	]
	
	def "PendingSubstitution", -> @__super__.canonizers.concat [
		canonization "major", "substitute", ->
			[ original, replacement ] = @comps.substitution.comps.values
			shore.substitute @comps.expression, original, replacement
	]
	
	def "ExternalNumericFunction", -> @__super__.canonizers.concat [
		canonization "minor", "apply", ->
			values = []
			for argument in @comps.arguments
				if argument.type isnt shore.Number
					return
				values.push argument.comps.value
			shore.number value: @comps.f.apply this, values
	]
]

for definition in __definers_of_canonizers
	[name, definer] = definition
	shore[name]::canonizers = definer.apply shore[name]
