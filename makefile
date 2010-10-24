all: CLEAN script.js parser.js

open: all
	open index.html

CLEAN:
	rm -f script.js parser.js

script.js:
	./script.coffee

parser.js:
	./_grammar.js > parser.js
