#!/usr/bin/env coffee -c
window.shore = shore =
	_provider: (cls) ->
		"For now just like new, but later will memoize and such."
		(args...) -> new cls args...
	
	_uncamel: (string) ->
		"Converts CamelBack (not ALLCAPS) string to this_thing."
		
		if (/^[A-Z]/.test string) and (/[a-z]/.test string)
			parts = (for part in string.split /(?=[A-Z0-9])/
				if part then part.toLowerCase())
			return parts.join "_"
	
	_add_providers_to: (module) ->
		"For each FooBar in module define foo_bar = module._provider FooBar."
		
		for old_name of module
			if new_name = shore._uncamel old_name
				module[new_name] = module._provider module[old_name]
	
	_significance: (x) ->
		if x in @_significations
			@_significations[x]
		else
			x
	
	_signified: (significance, f) ->
		f.significance = (_significance significance)
		f
	
	_unmemosig: (significance, name, f) ->
		(shore._signified significance (object) ->
			key = "memory of " + name
			if key in object
				object[key]
			else
				object[key] = f(object)
		)
	
	_significations:
		minor: 0
		moderate: 1
		major: 2
	
	Thing: class Thing
		type: "Thing"
		precedence: 0
		
		eq: (other) ->
			@type == other.type and @_eq other
		
		canonize: (enough, excess) ->
			enough = _significance (enough || 0)
			excess = _significance (excess || 0)
			
			result = this
			
			loop
				next = result.next_canonization()
				if not next then break
				[{significance: significance}, value] = next
				
				if significance >= excess then break
				result = value
				if significance >= enough then break
			
			result
		
		next_canonization: ->
			for canonization in @get_canonizations
				value = canonization this
				
				if value and not @eq(value)
					return [canonization, value]
		
		get_canonizations: -> []
		
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
		
		toString: -> "#{@type}{#{@to_string()}}"
		
	Value: class Value extends Thing
		type: "Value"
		
		plus: (other) -> shore.sum [this, other]
		minus: (other) -> shore.sum [this, other.neg()]
		times: (other) -> shore.product [this, other]
		over: (other) -> shore.product [this, other.to_the shore.NEGATIVE_ONE]
		pos: -> this
		neg: -> shore.ZERO.minus(this)
		to_the: (other) -> shore.exponent this, other
		equals: (other) -> shore.equality [this, other]
		integrate: (variable) -> shore.integral this, variable
		differentiate: (variable) -> shore.derivative this, variable
		given: (substitution) -> shore.pending_substitution this, substitution
	
	Number: class Number extends Value
		type: "Number"
		
		precedence: 10
		constructor: (@value) ->
		
		_eq: (other) -> @value == other.value
		neg: -> shore.number (- @value)
		to_free_tex: -> String @value
		to_free_string: -> String @value
	
	Identifier: class Identifier extends Value
		type: "Identifier"
		
		precedence: 10
		constructor: (@string_value, @tex_value) ->
			@tex_value ?= @string_value
		
		_eq: (other) -> @value == other.value
		to_free_tex: -> @tex_value
		to_free_string: -> @string_value
		sub: (other) ->
			string = "{#{@string_value}}_#{other.to_string()}"
			tex = "{#{@tex_value}}_{#{other.to_tex()}}"
			shore.identifier string, tex
	
	CANOperation: class CANOperation extends Value
		type: "CANOperation"
		
		# Commutitive, Assocative N-ary Operation
		
		_eq: (other) ->
			if @operands.length != other.operands.length
				return false
			
			for i in [0..@operands.length]
				if not (@operands[i].eq other.operands[i])
					return false
			
			true
		
		get_canonizations: ->
			super().concat [
				unmemosig "minor", "single argument", ->
					@operands[0] if @operands.length == 1
			]
		
		constructor: (@operands) ->
		to_free_tex: ->
			(((operand.to_tex @precedence) for operand in @operands)
			 .join @tex_symbol)
		to_free_string: ->
			(((operand.to_string @precedence) for operand in @operands)
			 .join @string_symbol)
	
	Sum: class Sum extends CANOperation
		type: "Sum"
		precedence: 2
		
		string_symbol: " + "
		tex_symbol: " + "
	
	Product: class Product extends CANOperation
		type: "Product"
		precedence: 4
		
		string_symbol: " f "
		tex_symbol: " \\cdot "
		
		to_free_tex: ->
			positive_exponents = []
			negative_exponents = []
			
			for term in @operands
				if term.type == "Exponent"
					exponent = term.exponent
					if exponent.type == "Number" and exponent.value < 0
						negative_exponents.push shore.exponent term.base, exponent.neg()
					else
						positive_exponents.push term
				else
					positive_exponents.push term
			
			positive_exponents ||= [shore.ONE]
			
			top = (((operand.to_tex @precedence) for operand in positive_exponents)
			       .join @tex_symbol)
			
			if negative_exponents.length
				bottom = (((operand.to_tex @precedence) for operand in negative_exponents)
				          .join @tex_symbol)
				"\\tfrac{#{top}}{#{bottom}}"
			else
				top
	
	Exponent: class Exponent extends Value
		type: "Exponent"
		precedence: 5
		
		constructor: (@base, @exponent) ->
		
		_eq: (other) -> @base.eq(other.base) and @exponent.eq(other.exponent)
		
		to_free_tex: ->
			if @exponent.type == "Number" and @exponent.value == 1
				@base.to_tex @precedence
			else
				"{#{@base.to_tex @precedence}}^{#{@exponent.to_tex()}}"
		
		to_free_string: ->
			if @exponent.type == "Number" and @exponent.value == 1
				@base.to_tex @precedence
			else
				"#{@base.to_string @precedence}^#{@exponent.to_string()}"
	
	Integral: class Integral extends Value
		type: "Integral" # Indefinite
		precedence: 3
		
		constructor: (@expression, @variable) ->
		
		_eq: (other) ->
			@expression.eq(other.expression) and @variable.eq(other.variable)
		
		to_free_tex: ->
			"\\int\\left[#{@expression.to_tex()}\\right]d#{@variable.to_tex()}"
	
	Derivative: class Derivative extends Value
		type: "Derivative"
		precedence: 3
		
		constructor: (@expression, @variable) ->
		
		_eq: (other) ->
			@expression.eq(other.expression) and @exponent.eq(other.variable)
		
		to_free_tex: ->
			"\\tfrac{d}{d#{@variable.to_tex()}}\\left[#{@expression.to_tex()}\\right]"
	
	Equality: class Equality extends CANOperation
		precedence: 1
		
		type: "Equality"
		
		string_symbol: " = "
		tex_symbol: " = "
	
	PendingSubstitution: class PendingSubstitution extends Value
		precedence: 16
		
		thing: "PendingSubstitution"
		
		constructor: (@expression, @substitution) ->
		
		_eq: (other) ->
			@expression.eq(other.expression) and @substitution.eq(other.substitution)
		
		to_free_string: ->
			(@expression.to_string 0) + " given " + (@substitution.to_string 15)
		to_free_tex: ->
			(@expression.to_tex 0) + " \\;\\text{given}\\; " + (@substitution.to_tex 15)

unmemosig = shore._unmemosig
shore._add_providers_to shore

shore.ZERO = shore.number 0
shore.ONE = shore.number 1
shore.NEGATIVE_ONE = shore.number (-1)
shore.X = shore.identifier "x"
shore.Y = shore.identifier "y"
shore.Z = shore.identifier "z"
