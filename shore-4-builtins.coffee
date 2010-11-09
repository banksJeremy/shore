shore.builtins =
	sin: shore.external_numeric_function
		identifier: shore.identifier (value: "sin", tex_value: "\\sin")
		arguments: [shore.identifier value: "theta"]
		f: (v) -> Math.sin v % (2 * Math.PI)
	cos: shore.external_numeric_function
		identifier: shore.identifier (value: "cos", tex_value: "\\cos")
		arguments: [shore.identifier value: "theta"]
		f: (v) -> Math.cos v % (2 * Math.PI)
	tan: shore.external_numeric_function
		identifier: shore.identifier (value: "tan", tex_value: "\\tan")
		arguments: [shore.identifier value: "theta"]
		f: (v) -> Math.tan v % (2 * Math.PI)
	pi: shore.number
		value: Math.PI
		id: (shore.identifier value: "pi")

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
