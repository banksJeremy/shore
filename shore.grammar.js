#!/usr/bin/env node
var sys = require("sys")
puts = sys.debug

var jison  = new require("jison")

var parser = jison.Parser({
	"lex": {
		"rules": [
			[ "\\s+", "" ],
			[ "([0-9]*\\.[0-9]+|[0-9]+)", "return 'NUMBER';" ],
			[ "=", "return 'EQUALS';" ],
			[ "\\*", "return '*';" ],
			[ "\\/", "return '/';" ],
			[ "\\-", "return '-';" ],
			[ "\\+", "return '+';" ],
			[ "\\^", "return '^';" ],
			[ "\\(", "return '(';" ],
			[ "\\)", "return ')';" ],
			[ "(±|\\?)", "return 'PLUSMINUS';" ],
			[ "~", "return 'INTEGRATE';" ],
			[ "`", "return 'DIFFERENTIATE';" ],
			[ "[_\\.]", "return 'SUB';" ],
			[ "[a-zA-Z][a-zA-Z0-9]*'*", "return 'IDENTIFIER';" ],
			[ "$", "return 'EOF';" ],
		]
	},
	
	"operators": [
		[ "left", "EQUALS" ],
		[ "left", "+", "-" ],
		[ "left", "INTEGRATE", "DIFFERENTIATE" ],
		[ "left", "*", "/" ],
		[ "right", "THEN" ],
		[ "left", "^" ],
		[ "left", "PLUSMINUS" ],
		[ "left", "UMINUS", "UPLUS" ],
		[ "right", "SUB" ],
	],
	
	"bnf": {
		"expressions": [
			[ "e EOF", "return $1;" ],
			[ "EOF", "return undefined;" ],
		],
		
		"e": [
			[ "e EQUALS e", "$$ = $1.equals($3);" ],
			[ "e + e", "$$ = $1.plus($3);" ],
			[ "e - e", "$$ = $1.minus($3);" ],
			[ "e * e", "$$ = $1.times($3);" ],
			[ "e / e", "$$ = $1.over($3);" ],
			[ "e ^ e", "$$ = $1.to_the($3);" ],
			[ "e INTEGRATE e", "$$ = $1.integrate($3);" ],
			[ "e DIFFERENTIATE e", "$$ = $1.differentiate($3);" ],
			[ "e PLUSMINUS e", "$$ = $1.plus_minus($3);" ],
			[ "e SUB e", "$$ = $1.sub($3);" ],
			[ "- e", "$$ = $2.neg();", { "prec": "UMINUS" } ],
			[ "+ e", "$$ = $2.pos();", { "prec": "UPLUS" } ],
			
			[ "e e", "$$ = $1._then($2);", { "prec": "THEN" } ],
			
			[ "literal", "$$ = $1;" ],
			[ "parenthesized", "$$ = $1;" ],
		],
		
		"parenthesized": [
			[ "( e )", "$$ = $2;" ]
		],
		
		"literal": [
			[ "NUMBER", "$$ = shore.number(yytext);"],
			[ "IDENTIFIER", "$$ = shore.identifier(yytext);"],
		]
	}
})

var source = parser.generate({moduleName: "shore.parser"})

sys.print(source)