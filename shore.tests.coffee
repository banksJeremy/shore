#!/usr/bin/env coffee -c
S = require("./shore").S
S.parser = require("./shore.parser").parser

test = (start, end) ->
	# a test that start.canonize() = (end.canonize "minor")
	try
		start_after = start.canonize()
		end_after = end.canonize "minor"
		
		if not start.canonize().eq(end.canonize "minor")
			return "TEST FAILED: #{start.to_string()} -> #{end.to_string()} was #{start_after.to_string()} -> #{end_after.to_string()}"
	catch error
		return "TEST THREW: #{error}"

tests = [
	(test (S "1 + 1"), (S "2"))
	(test (S "1 * 1"), (S "1"))
]

passes = 0

for failure in tests
	if failure?
		console.log failure
	else
		passes += 1

console.log "#{passes} of #{tests.length} tests passed."
