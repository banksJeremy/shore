shore.builtins =
	sin: shore.external_numeric_function
		identifier: shore.identifier (value: "sin", tex_value: "\\sin")
		arguments: [shore.identifier value: "theta"]
		f: Math.sin
	cos: shore.external_numeric_function
		identifier: shore.identifier (value: "cos", tex_value: "\\cos")
		arguments: [shore.identifier value: "theta"]
		f: Math.cos
	tan: shore.external_numeric_function
		identifier: shore.identifier (value: "tan", tex_value: "\\tan")
		arguments: [shore.identifier value: "theta"]
		f: Math.tan

shore.builtins.sin.derivatives = [
	[shore "theta", shore.builtins.cos]
]
shore.builtins.sin.integrals = [
	[shore "theta", shore.builtins.cos.neg()]
]
shore.builtins.cos.derivatives = [
	[shore "theta", shore.builtins.sin.neg()]
]
shore.builtins.cos.integrals = [
	[shore "theta", shore.builtins.sin]
]
