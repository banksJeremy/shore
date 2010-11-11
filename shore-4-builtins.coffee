nix_tinys = (v) ->
	# Because `Math.sin 2 * Math.PI` should be 0.
	
	if Math.abs v < 1e-12
		0
	else
		v

shore.builtins =
	sin: shore.external_numeric_function
		identifier: shore.identifier (value: "sin", tex_value: "\\sin")
		arguments: [shore.identifier value: "theta"]
		f: (v) -> nix_tinys Math.sin v
	cos: shore.external_numeric_function
		identifier: shore.identifier (value: "cos", tex_value: "\\cos")
		arguments: [shore.identifier value: "theta"]
		f: (v) -> nix_tinys Math.cos v
	tan: shore.external_numeric_function
		identifier: shore.identifier (value: "tan", tex_value: "\\tan")
		arguments: [shore.identifier value: "theta"]
		f: (v) -> nix_tinys Math.tan v
	pi: shore.number
		value: Math.PI
		id: (shore.identifier value: "pi")
	tau: shore.number
		value: 2 * Math.PI
		id: (shore.identifier value: "tau")

shore.builtins.sin.derivatives = [
	[(shore.identifier value: "theta"), shore.builtins.cos]
]
shore.builtins.sin.integrals = [
	[(shore.identifier value: "theta"), shore.builtins.cos.neg()]
]
shore.builtins.cos.derivatives = [
	[(shore.identifier value: "theta"), shore.builtins.sin.neg()]
]
shore.builtins.cos.integrals = [
	[(shore.identifier value: "theta"), shore.builtins.sin]
]
