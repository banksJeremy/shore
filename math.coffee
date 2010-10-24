#!/usr/bin/env coffee -c
window.shore = shore =
	type: "Thing"
	
	Thing: class Thing
		toString: -> "#{@type}{#{@to_string()}}"
		
		precedence: 0
		
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
		
	Value: class Value extends Thing
		type: "Value"
		
		plus: (other) -> new shore.Sum [this, other]
		minus: (other) -> new shore.Sum [this, other.neg()]
		times: (other) -> new shore.Product [this, other]
		over: (other) -> new shore.Product [this, other.to_the shore.NEGATIVE_ONE]
		pos: -> this
		to_the: (other) -> new shore.Exponent this, other
		equals: (other) -> new shore.Equality this, other
		integrate: (variable) -> new shore.Integral this, variable
		differentiate: (variable) -> new shore.Derivative this, variable
		given: (substitution) -> new shore.PendingSubstitution this, substitution
	
	Number: class Number extends Value
		type: "Number"
		
		precedence: 10
		constructor: (@value) ->
		
		neg: -> new shore.Number -@value
		to_free_tex: -> String @value
		to_free_string: -> String @value
	
	Identifier: class Identifier extends Value
		type: "Identifier"
		
		precedence: 10
		constructor: (@string_value, @tex_value) ->
			@tex_value ?= @string_value
		
		to_free_tex: -> @tex_value
		to_free_string: -> @string_value
		sub: (other) ->
			string = "{#{@string_value}}_#{other.to_string()}"
			tex = "{#{@tex_value}}_{#{other.to_tex()}}"
			new Identifier string, tex
	
	CANOperation: class CANOperation extends Value
		type: "CANOperation"
		
		# Commutitive, Assocative N-ary Operation
		
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
						negative_exponents.push new Exponent term.base, exponent.neg()
					else
						positive_exponents.push term
				else
					positive_exponents.push term
			
			positive_exponents ||= [new shore.Number 1]
			
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
		
		to_free_tex: ->
			"\\int\\left[#{@expression.to_tex()}\\right]d#{@variable.to_tex()}"
	
	Derivative: class Derivative extends Value
		type: "Derivative"
		precedence: 3
		
		constructor: (@expression, @variable) ->
		
		to_free_tex: ->
			"\\tfrac{d}{d#{@variable.to_tex()}}\\left[#{@expression.to_tex()}\\right]"

	Equality: class Equality extends Thing
		precedence: 10
		
		type: "Equality"
		constructor: (@terms...) ->
		string_symbol: " = "
		tex_symbol: " = "
		
		to_free_tex: ->
			(term.to_tex() for term in @terms).join(@tex_symbol)
		to_free_string: ->
			(term.to_string() for term in @terms).join(@string_symbol)
			
		equals: (other) ->
			if other.type == Equality
				new shore.Equality @terms..., other.terms...
			else
				new shore.Equality @terms..., other
	
	PendingSubstitution: class PendingSubstitution extends Value
		precedence: 16
		
		thing: "PendingSubstitution"
		
		constructor: (@expression, @substitution) ->
		
		to_free_string: ->
			(@expression.to_string 0) + " given " + (@substitution.to_string 15)
		to_free_tex: ->
			(@expression.to_tex 0) + " \\;\\text{given}\\; " + (@substitution.to_tex 15)
