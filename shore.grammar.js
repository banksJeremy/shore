#!/usr/bin/env node
var sys = require("sys")
puts = sys.debug

var jison  = new require("jison")

var parser = jison.Parser({
	"lex": {
		"rules": [
			[ "\\s+", "" ],
			[ "([0-9]*\\.[0-9]+|[0-9]+)", "return 'NUMBER';" ],
			[ "[a-zA-Z][a-zA-Z0-9]*'*", "return 'IDENTIFIER';" ],
			[ "=", "return '=';" ],
			[ "(\\^|\\*\\*)", "return '^';" ],
			[ "\\*", "return '*';" ],
			[ "\\/", "return '/';" ],
			[ "\\-", "return '-';" ],
			[ "\\+", "return '+';" ],
			[ "\\(", "return '(';" ],
			[ "\\)", "return ')';" ],
			[ "\\[", "return '[';" ],
			[ "\\]", "return ']';" ],
			[ "(±|\\?)", "return '±';" ],
			[ "~", "return '~';" ],
			[ "`", "return '`';" ],
			[ "[_\\.]", "return '_';" ],
			[ "$", "return 'EOF';" ],
		]
	},
	
	"operators": [
		[ "left", "=" ],
		[ "left", "+", "-" ],
		[ "left", "*", "/" ],
		[ "right", "THEN" ],
		[ "left", "^" ],
		[ "left", "±" ],
		[ "left", "UMINUS", "UPLUS" ],
		[ "right", "_" ],
		[ "left", "~", "`" ],
	],
	
	"bnf": {
		"expressions": [
			[ "e EOF", "return $1;" ],
			[ "EOF", "return undefined;" ],
		],
		
		"e": [
			[ "e = e", "$$ = $1.equals($3);" ],
			[ "e + e", "$$ = $1.plus($3);" ],
			[ "e - e", "$$ = $1.minus($3);" ],
			[ "e * e", "$$ = $1.times($3);" ],
			[ "e / e", "$$ = $1.over($3);" ],
			[ "e ^ e", "$$ = $1.to_the($3);" ],
			[ "e ~ e", "$$ = $1.integrate($3);" ],
			[ "e ` e", "$$ = $1.differentiate($3);" ],
			[ "e ± e", "$$ = $1.plus_minus($3);" ],
			[ "e _ e", "$$ = $1.sub($3);" ],
			[ "- e", "$$ = $2.neg();", { "prec": "UMINUS" } ],
			[ "+ e", "$$ = $2.pos();", { "prec": "UPLUS" } ],
			
			[ "e e", "$$ = $1._then($2);", { "prec": "THEN" } ],
			
			[ "literal", "$$ = $1;" ],
			[ "parenthesized", "$$ = $1;" ],
		],
		
		"parenthesized": [
			[ "( e )", "$$ = $2;" ],
			[ "[ e ]", "$$ = $2;" ],
		],
		
		"literal": [
			[ "NUMBER", "$$ = shore.number(Number(yytext));"],
			[ "IDENTIFIER", "$$ = shore.identifier(String(yytext));"],
		]
	}
})

var source = parser.generate({moduleName: "shore.parser"})

sys.print(source)
