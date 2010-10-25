all: CLEAN parser.js math.js main.js

open: all
	open index.html

CLEAN:
	rm -f math.js parser.js main.js

main.js:
	./main.coffee # main.js - requires coffeescript

math.js:
	./math.coffee # math.js - requires coffeescript

parser.js:
	./grammar.js > parser.js # - requires node.js, jison
