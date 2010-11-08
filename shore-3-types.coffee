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
		req_comps: sss "value margin"
		
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
	type::type = type # TODO: just use .constructor
	type::name = name # TODO: something better

utility.extend shore, __types
utility.make_providers shore

# not types, but need to go here to have the right things defined
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
