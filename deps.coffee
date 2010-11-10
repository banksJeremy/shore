#!/usr/bin/env coffee
###
A way to define modules where certain components are dependent on others.
###

dep = (filters..., arg) ->
	for f in filters
		arg = f arg
	
	if typeof arg is "function"
		# create a Dependency object
		# using amazing JavaScript reflection!
		arglist = (/\((.*)\)/.exec String arg)[1]
		args = arglist.split /\,\s*/g
		new dep.Dependent args, arg
	else
		# resolve module dependencies
		dep.resolve arg

dep.Dependent = class Dependent
	constructor: (@names, @f) ->

dep.resolve = (module) ->
	progressing = true
	dependents = {}
	
	for name of module
		if module[name] instanceof dep.Dependent
			dependents[name] = module[name]
	
	progressing = true
	
	while progressing
		progressing = false
		
		for name, info of dependents
			resolvable = true
			
			for dependency in info.names
				if dependency of dependents or typeof module[dependency] is "undefined"
					resolvable = false
					break
			
			continue if not resolvable
			
			progressing = true
			
			arglist = (module[arg] for arg in info.names)
			module[name] = info.f arglist...
			delete dependents[name]
	
	unresolved = (name for name of dependents)
	
	if unresolved.length
		throw new Error "Unable to resolve dependencies: #{unresolved.join ', '}."
	
	module
