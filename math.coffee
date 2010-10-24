#!/usr/bin/env coffee -c
window.shore = shore =
	Thing: class Thing
		toString: -> "#{@type}{#{@to_string()}}"
		
		precedence: 0 # Used for output formatting, not parsing.
		
		constructor: (args...) ->
			"We'll define .init on subclasses and they'll work with or without new."
			
			just_construct = args and args[0] == " _CONSTRUCT"
			
			if this !== undefined
				self = new arguments.callee " _CONSTRUCT"
			else
				self = this
			
			if not just_construct
				self.init args...
			
			`return self` # coffeescript requires we return this
		
		init: ->
		to_free_string: -> "[Value]"
		to_free_tex: -> "\\text{[Value]}"
		
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
		
		toString: -> @to_string()
		
	Value: class Value extends Thing
		plus: (other) -> shore.Sum [this, other]
		minus: (other) -> shore.Sum [this, other.neg()]
		times: (other) -> shore.Product [this, other]
		over: (other) -> shore.Product [this, other.to_the shore.NEGATIVE_ONE]
		pos: -> this
		to_the: (other) -> shore.Exponent this, other
		equals: (other) -> shore.Equality this, other
		integrate: (variable) -> shore.Integral this, variable
		differentiate: (variable) -> shore.Derivative this, variable
		given: (substitution) -> shore.PendingSubstitution this, substitution
	
	Number: class Number extends Value
		precedence: 10
		init: (@value) ->
		
		neg: -> shore.Number -@value
		to_free_tex: -> String @value
		to_free_string: -> String @value
	
	Identifier: class Identifier extends Value
		precedence: 10
		init: (@string_value, @tex_value) ->
			@tex_value ?= @string_value
		
		to_free_tex: -> @tex_value
		to_free_string: -> @string_value
		sub: (other) ->
			string = "{#{@string_value}}_#{other.to_string()}"
			tex = "{#{@tex_value}}_{#{other.to_tex()}}"
			shore.Identifier string, tex
	
	CANOperation: class CANOperation extends Value
		# Commutitive, Assocative N-ary Operation
		
		init: (@operands) ->
		to_free_tex: ->
			(((operand.to_tex @precedence) for operand in @operands)
			 .join @tex_symbol)
		to_free_string: ->
			(((operand.to_string @precedence) for operand in @operands)
			 .join @string_symbol)
	
	Sum: class Sum extends CANOperation
		precedence: 2
		
		string_symbol: " + "
		tex_symbol: " + "
	
	Product: class Product extends CANOperation
		precedence: 4
		
		string_symbol: " f "
		tex_symbol: " \\cdot "
		
		to_free_tex: ->
			positive_exponents = []
			negative_exponents = []
			
			for term in @operands
				if typeof term == "Exponent"
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
		precedence: 5
		
		init: (@base, @exponent) ->
		
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
	
	Integral: class Integral extends Value # Indefinite Intergral
		precedence: 3
		
		init: (@expression, @variable) ->
		
		to_free_tex: ->
			"\\int\\left[#{@expression.to_tex()}\\right]d#{@variable.to_tex()}"
	
	Derivative: class Derivative extends Value
		precedence: 3
		
		init: (@expression, @variable) ->
		
		to_free_tex: ->
			"\\tfrac{d}{d#{@variable.to_tex()}}\\left[#{@expression.to_tex()}\\right]"

	Equality: class Equality extends Thing
		precedence: 10
		
		init: (@terms...) ->
		string_symbol: " = "
		tex_symbol: " = "
		
		to_free_tex: ->
			((term.to_tex() for term in @terms).join @tex_symbol)
		to_free_string: ->
			((term.to_string() for term in @terms).join @string_symbol)
			
		equals: (other) ->
			if other.type == Equality
				new shore.Equality @terms..., other.terms...
			else
				new shore.Equality @terms..., other
	
	PendingSubstitution: class PendingSubstitution extends Value
		precedence: 16
		
		thing: "PendingSubstitution"
		
		init: (@expression, @substitution) ->
		
		to_free_string: ->
			(@expression.to_string 0) + " given " + (@substitution.to_string 15)
		to_free_tex: ->
			(@expression.to_tex 0) + " \\;\\text{given}\\; " + (@substitution.to_tex 15)

shore.ZERO = new shore.Number 0
shore.ONE = new shore.Number 1
shore.NEGATIVE_ONE = new shore.Number -1
