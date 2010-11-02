(function() {
  var S, Test, TestResult, _i, _len, _ref, passes, result, test, tests;
  S = require("./shore").S;
  S.parser = require("./shore.parser").parser;
  Test = function(_arg, _arg2) {
    this.output = _arg2;
    this.input = _arg;
    return this;
  };
  Test.prototype.toString = function() {
    return "" + (this.input) + " => " + (this.output);
  };
  Test.prototype.run = function() {
    var input, output;
    try {
      input = (S(this.input)).canonize("major");
      output = (S(this.output)).canonize("minor");
      return input.eq(output) ? new TestResult(this, true, "" + (input.to_string()) + " == " + (output.to_string())) : new TestResult(this, false, "" + (input.to_string()) + " != " + (output.to_string()));
    } catch (error) {
      return new TestResult(this, false, "Exception: " + (error));
    }
  };
  TestResult = function(_arg, _arg2, _arg3) {
    this.message = _arg3;
    this.passed = _arg2;
    this.test = _arg;
    return this;
  };
  TestResult.prototype.toString = function() {
    var prefix;
    prefix = this.passed ? " -- " : "FAIL";
    return "" + (prefix) + " " + (this.test) + " " + ((function() {
      if (!this.passed) {
        return '\n---> ' + this.message;
      }
    }).call(this) || '');
  };
  tests = [(new Test("1 + 1", "2")), (new Test("1 + 2 + 3", "6")), (new Test("2 * 2", "4")), (new Test("2 * 2 * 2", "8")), (new Test("2 ^ 3", "8")), (new Test("a + a + a + b + b", "3a + 2b")), (new Test("2 ~ t", "2t")), (new Test("a(a=b)", "b"))];
  passes = 0;
  _ref = tests;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    test = _ref[_i];
    console.log(String(result = test.run()));
    if (result.passed) {
      passes += 1;
    }
  }
  console.log();
  console.log("" + (passes) + " of " + (tests.length) + " tests passed.");
}).call(this);
