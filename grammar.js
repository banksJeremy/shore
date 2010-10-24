#!/usr/bin/env node
var sys = require("sys")
sys.print((new require("jison").Parser({
	"lex": {
		"rules": [
			[ "\\s+", "" ],
			[ "∆*([0-9]*\\.[0-9]+|[0-9]+)'*\\b", "return 'NUMBER';" ],
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
			[ "\\bgiven\\b", "return 'GIVEN';" ],
			[ "[a-zA-Z][a-zA-Z0-9]*'*", "return 'IDENTIFIER';" ],
			[ "$", "return 'EOF';" ],
		]
	},
	
	"operators": [
		[ "left", "EQUALS" ],
		[ "left", "GIVEN" ],
		[ "left", "+", "-" ],
		[ "left", "INTEGRATE", "DIFFERENTIATE" ],
		[ "left", "*", "/" ],
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
			[ "e EQUALS e", "$$ = ($1).equals($3);" ],
			[ "e + e", "$$ = ($1).plus($3);" ],
			[ "e - e", "$$ = ($1).minus($3);" ],
			[ "e * e", "$$ = ($1).times($3);" ],
			[ "e GIVEN e", "$$ = ($1).given($3);" ],
			[ "e / e", "$$ = ($1).over($3);" ],
			[ "e ^ e", "$$ = ($1).to_the($3);" ],
			[ "e INTEGRATE e", "$$ = ($1).integrate($3);" ],
			[ "e DIFFERENTIATE e", "$$ = ($1).differentiate($3);" ],
			[ "e PLUSMINUS e", "$$ = ($1).plus_minus($3);" ],
			[ "e SUB e", "$$ = ($1).sub($3);" ],
			[ "- e", "$$ = ($2).neg();", { "prec": "UMINUS" } ],
			[ "+ e", "$$ = ($2).pos();", { "prec": "UPLUS" } ],
			[ "( e ) ", "$$ = ($2);" ],
			[ "NUMBER", "$$ = new shore.Number(yytext);"],
			[ "IDENTIFIER", "$$ = new shore.Identifier(yytext);"]
		]
	}
})).generate({moduleName: "parser"}))
