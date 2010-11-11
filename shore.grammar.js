#!/usr/bin/env node
var sys = require("sys")

if (process.argv[2] != "-q") {
	puts = sys.debug
} else {
	puts = function(){}
}

var jison  = new require("jison")

var parser = jison.Parser({
	"lex": {
		"rules": [
			[ "[ \t]+", "" ],
			[ "[\\n\\r]+", "return 'NEWLINE';" ],
			[ ",", "return 'COL_SEP';" ],
			[ ";", "return 'ROW_SEP';" ],
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
		[ "left", "THEN" ],
		[ "left", "^" ],
		[ "left", "±" ],
		[ "left", "~", "`" ],
		[ "left", "UMINUS" ],
		[ "right", "_" ],
	],
	
	"bnf": {
		"expressions": [
			[ "e EOF", "return $1;" ],
			[ "lines EOF", "return shore.apply(shore, $1)"],
			[ "EOF", "return undefined;" ],
		],
		
		"lines": [
			["e NEWLINE e", "$$ = [$1, $3];"],
			["lines NEWLINE e", "$1.push($3); $$ = $1;"],
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
			
			[ "e e", "$$ = $1._then($2);", { "prec": "THEN" } ],
			
			[ "( e )", "$$ = $2;" ],
			[ "matrix", "$$ = $1;" ],
			
			[ "NUMBER", "$$ = shore(Number(yytext));"],
			[ "IDENTIFIER", "$$ = shore(String(yytext));"],
		],
		
		"matrix_row": [
			[ "e COL_SEP e", "$$ = [$1, $3] "],
			[ "matrix_row COL_SEP e", "$1.push($3); $$ = $1;"],
		],
		
		"matrix_cols": [
			[ "matrix_row ROW_SEP matrix_row", "$$ = [$1, $3];" ],
			[ "e ROW_SEP matrix_row", "$$ = [[$1], $3];" ],
			[ "matrix_row ROW_SEP e", "$$ = [$1, [$3]];" ],
			[ "e ROW_SEP e", "$$ = [[$1], [$3]];" ],
		],
		
		"matrix": [
			[ "[ matrix_cols ]", "$$ = shore($2);" ],
			[ "[ matrix_row ]", "$$ = shore([$2]);" ],
			[ "[ e ]", "$$ = shore([[$2]]);" ],
		],
	}
})

var source = parser.generate({moduleName: "shore.parser"})

sys.print("if (shore === undefined) { var shore = require ? require('./shore').shore : {} }")
sys.print("if (this.exports) { exports.shore = shore }")
sys.print(source)
