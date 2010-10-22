#!/usr/bin/env node
require("sys").print((new require("jison").Parser({
	"lex": {
		"rules": [
			[ "[ \\t]+", "/* ignore horizontal whitespace */" ],
			[ "[\n\r]+", "/* vertical too, for now */" ],
			[ "([0-9]*\.[0-9]+|[0-9]+)\\b", "return 'NUMBER';" ],
			[ "=", "return 'EQUALS';" ],
			[ "\\*", "return '*';" ],
			[ "\\/", "return '/';" ],
			[ "\\-", "return '-';" ],
			[ "\\+", "return '+';" ],
			[ "\\^", "return '^';" ],
			[ "\\(", "return '(';" ],
			[ "\\)", "return ')';" ],
			[ "(±|\\?)", "return 'PLUSMINUS';" ],
			[ "[_\.]", "return 'SUB';" ],
			[ "[a-zA-Z][a-zA-Z0-9]*", "return 'IDENTIFIER';" ],
			[ "$", "return 'EOF';" ],
		]
	},
	
	"operators": [
		[ "left", "EQUALS" ],
		[ "left", "+", "-" ],
		[ "left", "*", "/" ],
		[ "left", "^" ],
		[ "left", "PLUSMINUS" ],
		[ "left", "UMINUS", "UPLUS" ],
		[ "left", "SUB" ],
	],
	
	"bnf": {
		"expressions": [[ "e EOF", "return $1;" ]],
		
		"e": [
			[ "e EQUALS e", "$$ = ($1).equals($3);" ],
			[ "e + e", "$$ = ($1).plus($3);" ],
			[ "e - e", "$$ = ($1).minus($3);" ],
			[ "e * e", "$$ = ($1).times($3);" ],
			[ "e / e", "$$ = ($1).over($3);" ],
			[ "e ^ e", "$$ = ($1).to_the($3);" ],
			[ "e PLUSMINUS e", "$$ = ($1).plus_minus($3);" ],
			[ "IDENTIFIER SUB e", "$$ = ($1).sub($3);" ],
			[ "- e", "$$ = ($2).neg();", { "prec": "UMINUS" } ],
			[ "+ e", "$$ = ($2).pos();", { "prec": "UPLUS" } ],
			[ "( e ) ", "$$ = $2;" ],
			[ "NUMBER", "$$ = new Shore.Number(yytext);"],
			[ "IDENTIFIER", "$$ = new Shore.Identifier(yytext);"],
		]
	}
})).generate())
