#!/usr/bin/env coffee -c
S = require("./shore").S
S.parser = require("./shore.parser").parser

class Test
	constructor: (@input, @output) ->
	toString: -> "#{@input} => #{@output}"
	run: ->
		try
			input = (S @input).canonize()
			output = (S @output).canonize()
			
			if input.is output
				new TestResult this, true, "#{input.to_string()} is #{output.to_string()}"
			else
				new TestResult this, false, "#{input.to_string()} isn't #{output.to_string()}"
		catch error
			new TestResult this, false, "Exception: #{error}"

class TestResult
	constructor: (@test, @passed, @message) ->
	toString: ->
		prefix = if @passed then " -- " else "FAIL"
		"#{prefix} #{@test} #{('\n---> '+@message if not @passed) or ''}"


tests = [
	(new Test "1 + 1", "2")
	(new Test "1 + 2 + 3", "6")
	(new Test "2 * 2", "4")
	(new Test "2 * 2 * 2", "8")
	(new Test "2 ^ 3", "8")
	(new Test "a + a + a + b + b", "3a + 2b")
	(new Test "1x", "x")
	(new Test "2x - x", "x")
	(new Test "2 ~ t", "2t")
	(new Test "a(a=b)", "b")
	(new Test "x`x", "1")
	(new Test "(2x)`x", "2")
	(new Test "(x^2)`x", "2x")
	(new Test "c + b + a", "a + b + c")
	(new Test "a * a * b", "a^2 * b")
	(new Test "(x^3 + 3x^2 + 9)`x", "3x^2 + 6x")
	(new Test "(a + b) ~ x", "(a ~ x) + (b ~ x)")
]

passes = 0

for test in tests
	console.error String(result = test.run())
	passes += 1 if result.passed

console.error()
console.log "[#{passes}/#{tests.length} Tests Pass]"
