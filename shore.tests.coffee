#!/usr/bin/env coffee -c
S = require("./shore").S
S.parser = require("./shore.parser").parser

class Test
	constructor: (@input, @output) ->
	toString: -> "#{@input} => #{@output}"
	run: ->
		try
			input = (S @input).canonize "major"
			output = (S @output).canonize "minor"
			
			if input .eq output
				new TestResult this, true, "#{input.to_string()} == #{output.to_string()}"
			else
				new TestResult this, false, "#{input.to_string()} != #{output.to_string()}"
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
	(new Test "2 ~ t", "2t")
	(new Test "a(a=b)", "b")
]

passes = 0

for test in tests
	console.log String(result = test.run())
	passes += 1 if result.passed

console.log()
console.log "#{passes} of #{tests.length} tests passed."
