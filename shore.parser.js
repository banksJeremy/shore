/* Jison generated parser */
shore.parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"e":4,"EOF":5,"EQUALS":6,"+":7,"-":8,"*":9,"/":10,"^":11,"INTEGRATE":12,"DIFFERENTIATE":13,"PLUSMINUS":14,"SUB":15,"literal":16,"parenthesized":17,"(":18,")":19,"NUMBER":20,"IDENTIFIER":21,"$accept":0,"$end":1},
terminals_: {"2":"error","5":"EOF","6":"EQUALS","7":"+","8":"-","9":"*","10":"/","11":"^","12":"INTEGRATE","13":"DIFFERENTIATE","14":"PLUSMINUS","15":"SUB","18":"(","19":")","20":"NUMBER","21":"IDENTIFIER"},
productions_: [0,[3,2],[3,1],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,2],[4,2],[4,1],[4,1],[4,2],[4,2],[17,3],[16,1],[16,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy) {

var $$ = arguments[5],$0=arguments[5].length;
switch(arguments[4]) {
case 1:return $$[$0-2+1-1];
break;
case 2:return undefined;
break;
case 3:this.$ = $$[$0-3+1-1].equals($$[$0-3+3-1]);
break;
case 4:this.$ = $$[$0-3+1-1].plus($$[$0-3+3-1]);
break;
case 5:this.$ = $$[$0-3+1-1].minus($$[$0-3+3-1]);
break;
case 6:this.$ = $$[$0-3+1-1].times($$[$0-3+3-1]);
break;
case 7:this.$ = $$[$0-3+1-1].over($$[$0-3+3-1]);
break;
case 8:this.$ = $$[$0-3+1-1].to_the($$[$0-3+3-1]);
break;
case 9:this.$ = $$[$0-3+1-1].integrate($$[$0-3+3-1]);
break;
case 10:this.$ = $$[$0-3+1-1].differentiate($$[$0-3+3-1]);
break;
case 11:this.$ = $$[$0-3+1-1].plus_minus($$[$0-3+3-1]);
break;
case 12:this.$ = $$[$0-3+1-1].sub($$[$0-3+3-1]);
break;
case 13:this.$ = $$[$0-2+2-1].neg();
break;
case 14:this.$ = $$[$0-2+2-1].pos();
break;
case 15:this.$ = $$[$0-1+1-1];
break;
case 16:this.$ = $$[$0-1+1-1];
break;
case 17:this.$ = $$[$0-2+1-1]._then($$[$0-2+2-1]);
break;
case 18:this.$ = $$[$0-2+1-1]._then($$[$0-2+2-1]);
break;
case 19:this.$ = $$[$0-3+2-1];
break;
case 20:this.$ = shore.number(yytext);
break;
case 21:this.$ = shore.identifier(yytext);
break;
}
},
table: [{"3":1,"4":2,"5":[1,3],"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"1":[3]},{"5":[1,11],"6":[1,12],"7":[1,13],"8":[1,14],"9":[1,15],"10":[1,16],"11":[1,17],"12":[1,18],"13":[1,19],"14":[1,20],"15":[1,21]},{"1":[2,2]},{"4":22,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":23,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"5":[2,15],"6":[2,15],"7":[2,15],"8":[2,15],"9":[2,15],"10":[2,15],"11":[2,15],"12":[2,15],"13":[2,15],"14":[2,15],"15":[2,15],"16":25,"17":24,"18":[1,10],"19":[2,15],"20":[1,8],"21":[1,9]},{"5":[2,16],"6":[2,16],"7":[2,16],"8":[2,16],"9":[2,16],"10":[2,16],"11":[2,16],"12":[2,16],"13":[2,16],"14":[2,16],"15":[2,16],"19":[2,16]},{"5":[2,20],"6":[2,20],"7":[2,20],"8":[2,20],"9":[2,20],"10":[2,20],"11":[2,20],"12":[2,20],"13":[2,20],"14":[2,20],"15":[2,20],"18":[2,20],"19":[2,20],"20":[2,20],"21":[2,20]},{"5":[2,21],"6":[2,21],"7":[2,21],"8":[2,21],"9":[2,21],"10":[2,21],"11":[2,21],"12":[2,21],"13":[2,21],"14":[2,21],"15":[2,21],"18":[2,21],"19":[2,21],"20":[2,21],"21":[2,21]},{"4":26,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"1":[2,1]},{"4":27,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":28,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":29,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":30,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":31,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":32,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":33,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":34,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":35,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"4":36,"7":[1,5],"8":[1,4],"16":6,"17":7,"18":[1,10],"20":[1,8],"21":[1,9]},{"5":[2,13],"6":[2,13],"7":[2,13],"8":[2,13],"9":[2,13],"10":[2,13],"11":[2,13],"12":[2,13],"13":[2,13],"14":[2,13],"15":[1,21],"19":[2,13]},{"5":[2,14],"6":[2,14],"7":[2,14],"8":[2,14],"9":[2,14],"10":[2,14],"11":[2,14],"12":[2,14],"13":[2,14],"14":[2,14],"15":[1,21],"19":[2,14]},{"5":[2,17],"6":[2,17],"7":[2,17],"8":[2,17],"9":[2,17],"10":[2,17],"11":[2,17],"12":[2,17],"13":[2,17],"14":[2,17],"15":[2,17],"19":[2,17]},{"5":[2,18],"6":[2,18],"7":[2,18],"8":[2,18],"9":[2,18],"10":[2,18],"11":[2,18],"12":[2,18],"13":[2,18],"14":[2,18],"15":[2,18],"19":[2,18]},{"6":[1,12],"7":[1,13],"8":[1,14],"9":[1,15],"10":[1,16],"11":[1,17],"12":[1,18],"13":[1,19],"14":[1,20],"15":[1,21],"19":[1,37]},{"5":[2,3],"6":[2,3],"7":[1,13],"8":[1,14],"9":[1,15],"10":[1,16],"11":[1,17],"12":[1,18],"13":[1,19],"14":[1,20],"15":[1,21],"19":[2,3]},{"5":[2,4],"6":[2,4],"7":[2,4],"8":[2,4],"9":[1,15],"10":[1,16],"11":[1,17],"12":[1,18],"13":[1,19],"14":[1,20],"15":[1,21],"19":[2,4]},{"5":[2,5],"6":[2,5],"7":[2,5],"8":[2,5],"9":[1,15],"10":[1,16],"11":[1,17],"12":[1,18],"13":[1,19],"14":[1,20],"15":[1,21],"19":[2,5]},{"5":[2,6],"6":[2,6],"7":[2,6],"8":[2,6],"9":[2,6],"10":[2,6],"11":[1,17],"12":[2,6],"13":[2,6],"14":[1,20],"15":[1,21],"19":[2,6]},{"5":[2,7],"6":[2,7],"7":[2,7],"8":[2,7],"9":[2,7],"10":[2,7],"11":[1,17],"12":[2,7],"13":[2,7],"14":[1,20],"15":[1,21],"19":[2,7]},{"5":[2,8],"6":[2,8],"7":[2,8],"8":[2,8],"9":[2,8],"10":[2,8],"11":[2,8],"12":[2,8],"13":[2,8],"14":[1,20],"15":[1,21],"19":[2,8]},{"5":[2,9],"6":[2,9],"7":[2,9],"8":[2,9],"9":[1,15],"10":[1,16],"11":[1,17],"12":[2,9],"13":[2,9],"14":[1,20],"15":[1,21],"19":[2,9]},{"5":[2,10],"6":[2,10],"7":[2,10],"8":[2,10],"9":[1,15],"10":[1,16],"11":[1,17],"12":[2,10],"13":[2,10],"14":[1,20],"15":[1,21],"19":[2,10]},{"5":[2,11],"6":[2,11],"7":[2,11],"8":[2,11],"9":[2,11],"10":[2,11],"11":[2,11],"12":[2,11],"13":[2,11],"14":[2,11],"15":[1,21],"19":[2,11]},{"5":[2,12],"6":[2,12],"7":[2,12],"8":[2,12],"9":[2,12],"10":[2,12],"11":[2,12],"12":[2,12],"13":[2,12],"14":[2,12],"15":[1,21],"19":[2,12]},{"5":[2,19],"6":[2,19],"7":[2,19],"8":[2,19],"9":[2,19],"10":[2,19],"11":[2,19],"12":[2,19],"13":[2,19],"14":[2,19],"15":[2,19],"19":[2,19]}],
defaultActions: {"3":[2,2],"11":[2,1]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        shifts = 0,
        reductions = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;

    var parseError = this.yy.parseError = typeof this.yy.parseError == 'function' ? this.yy.parseError : this.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
    }

    function checkRecover (st) {
        for (var p in table[st]) if (p == TERROR) {
            return true;
        }
        return false;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    };

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected, recovered = false;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                if (this.lexer.showPosition) {
                    parseError.call(this, 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+'\nExpecting '+expected.join(', '),
                        {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, expected: expected});
                } else {
                    parseError.call(this, 'Parse error on line '+(yylineno+1)+": Unexpected '"+(this.terminals_[symbol] || symbol)+"'",
                        {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, expected: expected});
                }
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw 'Parsing halted.'
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if (checkRecover(state)) {
                    break;
                }
                if (state == 0) {
                    throw 'Parsing halted.'
                }
                popStack(1);
                state = stack[stack.length-1];
            }
            
            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        a = action; 

        switch (a[0]) {

            case 1: // shift
                shifts++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext); // semantic values or junk only, no terminals
                stack.push(a[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                reductions++;

                len = this.productions_[a[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, a[1], vstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                }

                stack.push(this.productions_[a[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept

                this.reductionCount = reductions;
                this.shiftCount = shifts;
                return true;
        }

    }

    return true;
}};/* Jison generated lexer */
var lexer = (function(){var lexer = ({EOF:"",
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        for (var i=0;i < this.rules.length; i++) {
            match = this._input.match(this.rules[i]);
            if (match) {
                lines = match[0].match(/\n/g);
                if (lines) this.yylineno += lines.length;
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                this._more = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, i);
                if (token) return token;
                else return;
            }
        }
        if (this._input == this.EOF) {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function () {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    }});
lexer.performAction = function anonymous(yy,yy_) {

switch(arguments[2]) {
case 0:
break;
case 1:return 20;
break;
case 2:return 6;
break;
case 3:return 9;
break;
case 4:return 10;
break;
case 5:return 8;
break;
case 6:return 7;
break;
case 7:return 11;
break;
case 8:return 18;
break;
case 9:return 19;
break;
case 10:return 14;
break;
case 11:return 12;
break;
case 12:return 13;
break;
case 13:return 15;
break;
case 14:return 21;
break;
case 15:return 5;
break;
}
};
lexer.rules = [/^\s+/,/^([0-9]*\.[0-9]+|[0-9]+)/,/^=/,/^\*/,/^\//,/^\-/,/^\+/,/^\^/,/^\(/,/^\)/,/^(±|\?)/,/^~/,/^`/,/^[_\.]/,/^[a-zA-Z][a-zA-Z0-9]*'*/,/^$/];return lexer;})()
parser.lexer = lexer;
return parser;
})();
if (typeof require !== 'undefined') {
exports.parser = shore.parser;
exports.parse = function () { return shore.parser.parse.apply(shore.parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}