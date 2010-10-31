#!/usr/bin/env coffee -c
root = exports ? this
S = root.S = root.shore ?=
	_former_S: root.S
	_former_shore: root.shore

S.noConflict = (deep) ->
	root.S = S._former_S
	root.shore = S._former_shore

shore = (args...) ->
	if args.length is 1
		arg = args[0]
		
		if typeof arg is "number"
			shore.number arg
		else if typeof arg is "string"
			if /^[a-zA-Z][a-zA-Z0-9]*'*$/.test arg
				shore.identifier arg
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

shore.utility = utility = 
	nullary_proto_memo: (id, f) ->
		"memoizes a nullary function on a prototype"
		-> 
			return f
			
			key = "proto-memory of nullary " + id
			prototype = this.constructor.prototype
			
			if not prototype.hasOwnProperty key
				prototype[key] = f.apply this
			else
				prototype[key]
	
	nullary_memo: (id, f) ->
		"memoizes a nullary function on an instance"
		->
			return f
			
			key = "memory of nullary " + id
		
			if key not of this
				this[key] = f.apply this
			else
				this[key]
	
	uncamel: (string) ->
		"Converts CamelBack (not ALLCAPS) string to this_thing."
		
		if (/^[A-Z]/.test string) and (/[a-z]/.test string)
			parts = (for part in string.split /(?=[A-Z0-9])/
				if part then part.toLowerCase())
			return parts.join "_"
	
	sss: (s) ->
		"Splits a String on Spaces"
		
		s.split " "

sss = utility.sss

for name, value of { # contents of module
	_special_identifiers:
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
		"For now just like new, but later will memoize and such."
		(args...) -> new cls args...
	
	_make_providers: ->
		"For each FooBar in this define foo_bar = this._provider FooBar."
		
		for old_name of this
			if new_name = utility.uncamel old_name
				this[new_name] = @_make_provider this[old_name]
	
	_significance: (x) ->
		if x of shore._significations
			@_significations[x]
		else
			x
	
	_signified: (significance, f) ->
		f.significance = (shore._significance significance)
		f
	
	_canonization: (significance, name, f) ->
		(shore._signified significance, f)
#		                  (utility.nullary_memo "canonization (#{name})", f))
	
	_significations:
		minor: 0
		moderate: 1
		major: 2
	
	Thing: class Thing
		precedence: 0
		
		req_comps: []
		
		constructor: (@comps)
			for name in @req_comps
				if not @hasOwnProperty name
					raise new Error "#{@type} object requires value for #{name}"
		
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
		
		toString: ->
			if @to_js
				@to_js()
			else
				"S{#{@to_string()}}"
		
		to_free_string: -> "SHORE PRIVATE TYPE"
		to_free_tex: -> "\\text{SHORE PRIVATE TYPE}"
		
	Value: class Value extends Thing
		is_a_value: true
		
		plus: (other) -> shore.sum [this, other]
		minus: (other) -> shore.sum [this, other.neg()]
		times: (other) -> shore.product [this, other]
		over: (other) -> shore.product [this, other.to_the shore (- 1)]
		pos: -> this
		neg: -> (shore (-1)).times(this)
		to_the: (other) -> shore.exponent this, other
		equals: (other) -> shore.equality [this, other]
		integrate: (variable) -> shore.integral this, variable
		differentiate: (variable) -> shore.derivative this, variable
		given: (substitution) -> shore.pending_substitution this, substitution
		plus_minus: (other) -> shore.with_margin_of_error this, other
		
		_then: (other) ->
			if other.is_a_value
				this.times other
			else
				this.given other
	
	Number: class Number extends Value
		precedence: 10
		req_components: sss "value"
		
		_eq: (other) -> @value is other.value
		neg: -> shore.number (- @value)
		to_free_tex: -> String @value
		to_free_string: -> String @value
		to_js: -> "S(#{@value})"
	
	Identifier: class Identifier extends Value
		precedence: 10
		
		req_components: sss "value"
		
		constructor: (@string_value, @tex_value) ->
			if not @tex_value?
				if @string_value of shore._special_identifiers
					[@string_value, @tex_value] = shore._special_identifiers[@string_value]
				else
					@tex_value = @string_value
		
		_eq: (other) -> @value is other.value
		to_free_tex: -> @tex_value
		to_free_string: -> @string_value
		to_js: ->
			if @string_value isnt @tex_value
				"S.identifier(\"#{@string_value}\", \"#{@tex_value}\")"
			else
				"S(\"#{@string_value}\")"
		
		sub: (other) ->
			string = "#{@string_value}_#{other.to_string()}"
			tex = "{#{@tex_value}}_{#{other.to_tex()}}"
			shore.identifier string, tex
	
	CANOperation: class CANOperation extends Value
		# Commutitive, Assocative N-ary Operation
		
		constructor: (@operands) ->
		
		_eq: (other) ->
			if @operands.length is other.operands.length
				return false
			
			for i in [0..@operands.length - 1]
				if not (@operands[i].eq other.operands[i])
					return false
			
			true
		
		to_free_tex: ->
			(((operand.to_tex @precedence) for operand in @operands)
			 .join @tex_symbol)
		
		to_free_string: ->
			(((operand.to_string @precedence) for operand in @operands)
			 .join @string_symbol)
		
		to_js: -> "S.#{@type.toLowerCase()}([#{@operands.join ", "}])"
	
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
			   operands[0].type is "Number" and
				 operands[1].type isnt "Number"
				
				(if operands[0].value is -1 then operands[0].to_tex @precedence else "-") +
				(((operand.to_tex @precedence) for operand in operands.slice 1)
				 .join @tex_symbol)
			else
				(((operand.to_tex @precedence) for operand in operands)
				 .join @tex_symbol)
		
		to_free_tex: ->
			positive_exponents = []
			negative_exponents = []
			
			for term in @operands
				if term.type is "Exponent"
					exponent = term.exponent
					
					if exponent.type is "Number" and exponent.value < 0
						negative_exponents.push shore.exponent term.base, exponent.neg()
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
		
		# to_free_string?
	
	Exponent: class Exponent extends Value
		precedence: 5
		
		constructor: (@base, @exponent) ->
		
		_eq: (other) -> @base.eq(other.base) and @exponent.eq(other.exponent)
		
		to_free_tex: ->
			if @exponent.type is "Number" and @exponent.value is 1
				@base.to_tex @precedence
			else
				"{#{@base.to_tex @precedence}}^{#{@exponent.to_tex()}}"
		
		to_free_string: ->
			if @exponent.type is "Number" and @exponent.value is 1
				@base.to_tex @precedence
			else
				"#{@base.to_string @precedence}^#{@exponent.to_string()}"
		
		to_js: ->
			return "S(#{@base.to_js()}, #{@exponent.to_js()})"
	
	Integral: class Integral extends Value
		precedence: 3
		
		constructor: (@expression, @variable) ->
		
		_eq: (other) ->
			@expression.eq(other.expression) and @variable.eq(other.variable)
		
		to_free_tex: ->
			"\\int\\left[#{@expression.to_tex()}\\right]d#{@variable.to_tex()}"
		
		to_free_string: ->
			"int{[#{@expression.to_tex()}]d#{@variable.to_tex()}}"
	
	Derivative: class Derivative extends Value
		precedence: 3
		
		constructor: (@expression, @variable) ->
		
		_eq: (other) ->
			@expression.eq(other.expression) and @variable.eq(other.variable)
		
		to_free_tex: ->
			"\\tfrac{d}{d#{@variable.to_tex()}}\\left[#{@expression.to_tex()}\\right]"
		
		to_free_string: ->
			"d/d#{@variable.to_tex()}[#{@expression.to_tex()}]"
	
	WithMarginOfError: class WithMarginOfError extends Value
		precedence: 1.5
		
		constructor: (@value, @margin) ->
		
		tex_symbol: " \\pm "
		string_symbol: " ± "
		
		to_free_string: ->
			if not @margin.eq (shore 0)
				"#{@value.to_string @precedence} #{@string_symbol} #{@margin.to_string @precedence}"
			else
				@value.to_string @precedence
		
		to_free_tex: ->
			if not @margin.eq (shore 0)
				"#{@value.to_tex @precedence} #{@tex_symbol} #{@margin.to_tex @precedence}"
			else
				@value.to_tex @precedence
	
	Equality: class Equality extends CANOperation
		precedence: 1
		
		is_a_value: false # ><
		
		string_symbol: " = "
		tex_symbol: " = "
	
	PendingSubstitution: class PendingSubstitution extends Value
		precedence: 2.5
		
		thing: "PendingSubstitution"
		
		constructor: (@expression, @substitution) ->
			@is_a_value = @expression.is_a_value
		
		_eq: (other) ->
			@expression.eq(other.expression) and @substitution.eq(other.substitution)
		
		string_symbol: ""
		tex_symbol: ""
		
		to_free_string: ->
			(@expression.to_string @precedence) + @string_symbol + (@substitution.to_string @precedence)
		to_free_tex: ->
			(@expression.to_tex @precedence) + @tex_symbol + (@substitution.to_tex @precedence)
}
	shore[name] = value
	
	if utility.uncamel name # if it's CamelCase to begin with
		shore[name]::type = name

# Canonizers follow here, to keep the logic of math as seperate
# from the logic of programming as I can.

for name, getter_of_canonizers of {
	CANOperation: ->
		CANOperation.__super__._get_canonizers.apply(this).concat [
			canonization "minor", "single argument", ->
				@operands[0] if @operands.length is 1
			canonization "minor", "no arguments", ->
				@get_nullary() if @operands.length is 0 and @get_nullary
		]
	
	Sum: ->
		Sum.__super__._get_canonizers.apply(this).concat [
			canonization "major", "numbers in sum", ->
				numbers = []
				not_numbers = []
				
				for operand in @operands
					if operand.type is "Number"
						numbers.push operand
					else
						not_numbers.push operand
				
				if numbers.length > 1
					sum = @get_nullary().value
					
					while numbers.length
						sum += numbers.pop().value
					
					shore.sum [ shore.number sum ].concat not_numbers
		]
	
	Equality: ->
		Equality.__super__._get_canonizers.apply(this).concat [
			canonization "minor", "minors in equality", ->
				shore.equality (o.canonize("minor", "minor") for o in @operands)
			canonization "moderate", "moderates in equality", ->
				shore.equality (o.canonize("moderate", "moderate") for o in @operands)
			canonization "majors", "majors in equality", ->
				shore.equality (o.canonize("majors", "majors") for o in @operands)
		]
}
	shore[name]::_get_canonizers = getter_of_canonizers

canonization = shore._canonization
shore._make_providers()
