all: CLEAN parser.js shore.js main.js

open: all
	open index.html

CLEAN:
	rm -f shore.js parser.js main.js

main.js:
	./main.coffee # main.js - requires coffeescript

shore.js:
	./shore.coffee # shore.js - requires coffeescript

parser.js:
	./shore.grammar.js -q > shore.parser.js # - requires node.js, jison
