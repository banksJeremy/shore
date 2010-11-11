# in defining canonizations
def = (args...) -> args
canonization = shore.canonization

__definers_of_canonizers = [
	def "Thing", ->
		for significance of shore._significances
			canonization significance, "components #{significance}", ->
				@provider shore.canonize @comps, significance, significance
	
	def "CANOperation", -> @__super__.canonizers.concat [
		canonization "invisible", "single argument", ->
			@comps.operands[0] if @comps.operands.length is 1
		
		canonization "invisible", "no arguments", ->
			@get_nullary() if @comps.operands.length is 0 and @get_nullary
		
		canonization "invisible", "commutativity", ->
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
		
		canonization "organization", "sort items", ->
			# order is sort-of arbitrary at the moment but we need it to be something
			
			@provider operands: @comps.operands.sort utility.compare_by_hash
		
		canonization "overwhelming", "remove redundant nullaries", ->
			n = @get_nullary()
			@provider operands: (o for o in @comps.operands when not o.is n)
	]
	
	def "Sum", -> @__super__.canonizers.concat [
		canonization "overwhelming", "numbers in sum", ->
			numbers = []
			not_numbers = []
			
			for operand in @comps.operands
				if operand.type is shore.Number
					numbers.push operand
				else
					not_numbers.push operand
			
			if numbers.length > 1
				sum = @get_nullary().comps.value
				
				for number in numbers
					sum += number.comps.value
				
				@provider operands: [ shore.number value: sum ].concat not_numbers
		
		# constant coefficients
	]
	
	def "Product", -> @__super__.canonizers.concat [
		canonization "overwhelming", "ZERO IT", ->
			if (shore 0) in @comps.operands
				(shore 0)
		
		canonization "overwhelming", "numbers in product", ->
			numbers = []
			not_numbers = []
			
			for operand in @comps.operands
				if operand.type is shore.Number
					numbers.push operand
				else
					not_numbers.push operand
			
			if numbers.length > 1
				product = @get_nullary().comps.value
				
				for number in numbers
					product *= number.comps.value
				
				@provider operands: [ shore.number value: product ].concat not_numbers
	]
	
	def "Exponent", -> @__super__.canonizers.concat [
		canonization "invisible", "eliminate power of one", ->
			if @comps.exponent.is (shore 1)
				@comps.base
		
		canonization "overwhelming", "exponent of numbers", ->
			if @comps.base.type is @comps.exponent.type is shore.Number
				x = Math.pow @comps.base.comps.value, @comps.exponent.comps.value
				shore.number value: x
	]
	
	def "Integral", -> @__super__.canonizers.concat [
		canonization "overwhelming", "integration of constant", ->
			if @comps.expression.known_constant
				@comps.expression.times @comps.variable
		
		canonization "organization", "rule of sums", ->
			if @comps.expression.type is shore.Sum
				shore.sum operands: for term in @comps.expression.comps.operands
					shore.integral variable: @comps.variable, expression: term
		
		canonization "organization", "constant coefficient", ->
			if @comps.expression.type is shore.Product
				terms = @comps.expression.comps.operands
				coefficient = terms[0]
				if coefficient.known_constant
					coefficient.times shore.integral
						variable: @comps.variable
						expression: shore.product (operands: terms[1...terms.length])
		
		canonization "overwhelming", "integration over self", ->
			if @comps.expression.is @comps.variable
				@comps.expression.to_the(shore 2).over(shore 2)
		
		canonization "overwhelming", "power rule", ->
			if @comps.expression.type is shore.Exponent
				{ base: base, exponent: exponent } = @comps.expression.comps
				new_exponent = exponent.plus (shore 1)
				if base.is @comps.variable
					base.to_the(exponent.minus new_exponent).over(new_exponent)
		
		canonization "overwhelming", "hard-coded", ->
			for [variable, result] in @comps.expression.integrals
				if variable.is @comps.variable
					return result
			null
	]
	
	def "Derivative", -> @__super__.canonizers.concat [
		canonization "organization", "differentiation over self", ->
			if @comps.variable.is @comps.expression
				shore 1
		
		canonization "organization", "differentiation of constant", ->
			if @comps.expression.known_constant
				shore 0
		
		canonization "organization", "sum rule", ->
			if @comps.expression.type is shore.Sum
				shore.sum operands: for term in @comps.expression.comps.operands
					shore.derivative (variable: @comps.variable, expression: term)
		
		canonization "significant", "constant coefficient", ->
			if @comps.expression.type is shore.Product
				terms = @comps.expression.comps.operands
				coefficient = terms[0]
				if coefficient.known_constant
					coefficient.times shore.derivative
						variable: @comps.variable
						expression: shore.product(operands: terms[1...terms.length])
		
		canonization "significant", "product rule", ->
			if @comps.expression.type is shore.Product
				factors = @comps.expression.comps.operands
				
				shore.sum operands: for i in [0...factors.length]
					shore.product operands: for j in [0...factors.length]
						if i is j
							factors[j].differentiate @comps.variable
						else
							factors[j]
		
		canonization "overwhelming", "power rule", ->
			if @comps.expression.type is shore.Exponent
				{ base: base, exponent: exponent } = @comps.expression.comps
				if base.is @comps.variable
					exponent.times(base).to_the(exponent.minus (shore 1))
		
		canonization "overwhelming", "hard-coded", ->
			for [variable, result] in @comps.expression.derivatives
				if variable.is @comps.variable
					return result
			null
	]
	
	def "PendingSubstitution", -> @__super__.canonizers.concat [
		canonization "overwhelming", "substitute", ->
			shore.substitute @comps.value, @comps.original, @comps.replacement
	]
	
	def "ExternalNumericFunction", -> @__super__.canonizers.concat [
		canonization "invisible", "apply", ->
			values = []
			for argument in @comps.arguments
				if argument.type isnt shore.Number
					return
				values.push argument.comps.value
			shore.number value: @comps.f.apply this, values
	]
	
	def "System", ->
		simple = for significance in [0...10] #...
			canonization significance, "components #{significance}", ->
				# only do it one equation at a time, to make the steps better
				new_equations = @comps.equations
				
				for index in [0...new_equations.length]
					canonized = new_equations[index].canonize significance, significance
				
					if new_equations[index].isnt canonized
						new_equations[index] = canonized
						break
				
				@provider equations: new_equations
		
		simple.concat [
			canonization "overwhelming", "substitute!", ->
				knowns = []
			
				for equation in @comps.equations
					if equation instanceof shore.Equality
						if equation.comps.values[0] instanceof shore.Identifier
							knowns.push equation
			
				equations = []
			
				for equation in @comps.equations
					substitutions = []
				
					for id_ of equation.subbable_id_set false
						id = (shore id_)
					
						continue if id.is equation.comps.values[0]
						# don't sub into self
					
						for known_equation in knowns
							if id.is known_equation.comps.values[0]
								substitutions.push known_equation
				
					if substitutions.length
						[ls, rs] = equation.comps.values
					
						for substitution in substitutions
							rs = rs.substitute substitution.comps.values[0], substitution.comps.values[1]
					
						equations.push shore.equality values: [ ls, rs ]
					else
						equations.push equation
			
				shore.system equations: equations
	]
]

for definition in __definers_of_canonizers
	[name, definer] = definition
	shore[name]::canonizers = definer.apply shore[name]
