all: clean parser.js shore.js main.js

open: all
	open main.html

test: all
	./shore.tests.coffee
	node shore.tests.js

clean:
	rm -f shore.js shore.parser.js main.js

main.js:
	./main.coffee # main.js - requires coffeescript

shore.js:
	./shore.coffee # shore.js - requires coffeescript

parser.js:
	./shore.grammar.js -q > shore.parser.js # - requires node.js, jison
