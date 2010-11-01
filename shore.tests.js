(function() {
  var S, _i, _len, _ref, failure, passes, test, tests;
  S = require("./shore").S;
  S.parser = require("./shore.parser").parser;
  test = function(start, end) {
    var end_after, start_after;
    try {
      start_after = start.canonize();
      end_after = end.canonize("minor");
      if (!start.canonize().eq(end.canonize("minor"))) {
        return ("TEST FAILED: " + (start.to_string()) + " -> " + (end.to_string()) + " was " + (start_after.to_string()) + " -> " + (end_after.to_string()));
      }
    } catch (error) {
      return ("TEST THREW: " + (error));
    }
  };
  tests = [(test(S("1 + 1"), S("2"))), (test(S("1 + 2 + 3"), S("6"))), (test(S("2 * 2"), S("4"))), (test(S("2 * 2 * 2"), S("8"))), (test(S("2 ^ 3"), S("8"))), (test(S("a + a"), S("2a"))), (test(S("2 ~ t"), S("2t"))), (test(S("a(a=b)"), S("b")))];
  passes = 0;
  _ref = tests;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    failure = _ref[_i];
    if (typeof failure !== "undefined" && failure !== null) {
      console.log(failure);
    } else {
      passes += 1;
    }
  }
  console.log("" + (passes) + " of " + (tests.length) + " tests passed.");
}).call(this);