all: clean-old shore.js shore.parser.js shore.interface.js main.js main.css

test: all
	node shore.tests.js

open: all
	open main.html

# remove files older than their sources

clean-old:
	for name in shore shore.interface shore.tests main; do \
		[ -e $$name.js ] && [ $$name.js -ot $$name.coffee ] && \
		rm -v $$name.js; true; \
	done
	
	[ -e shore.parser.js ] && [ shore.parser.js -ot shore.grammar.js ] && \
		rm -v shore.parser.js; true

# requiring coffeescript...

shore.js:
	coffee -c shore.coffee

shore.interface.js:
	coffee -c shore.interface.coffee

shore.tests.js:
	coffee -c shore.tests.coffee

main.js:
	coffee -c main.coffee

# requiring node.js and jison

shore.parser.js:
	node shore.grammar.js -q > shore.parser.js

# requiring sass

main.css:
	sass -C main.sass main.css
