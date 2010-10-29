(function() {
  var CANOperation, Derivative, Equality, Exponent, Identifier, Integral, Number, PendingSubstitution, Product, Sum, Thing, Value, WithMarginOfError, _ref, canonization, getter_of_canonizers, log, logs, name, shore, utility, value;
  var __slice = Array.prototype.slice, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  }, __hasProp = Object.prototype.hasOwnProperty;
  log = (typeof console !== "undefined" && console !== null) ? (function() {
    return console.log.apply(console, arguments);
  }) : function() {};
  logs = function() {
    return log(String.apply(this, arguments));
  };
  shore = function() {
    var _i, _len, _ref, _result, arg, args;
    args = __slice.call(arguments, 0);
    if (args.length === 1) {
      arg = args[0];
      if (typeof arg === "number") {
        return shore.number(arg);
      } else if (typeof arg === "string") {
        if (/^[a-zA-Z][a-zA-Z0-9]*'*$/.test(arg)) {
          return shore.identifier(arg);
        } else {
          if (typeof (_ref = shore.parser) !== "undefined" && _ref !== null) {
            return shore.parser.parse(arg);
          } else {
            throw new Error("shore.parser is not available to interpret expression: " + (arg));
          }
        }
      } else {
        throw new Error("Unable to handle argument of type " + (typeof arg) + ".");
      }
    } else {
      _result = []; _ref = args;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        _result.push(shore(arg));
      }
      return _result;
    }
  };
  shore.utility = (utility = {
    nullary_proto_memo: function(id, f) {
      "memoizes a nullary function on a prototype";
      return function() {
        var key, prototype;
        return f;
        key = "proto-memory of nullary " + id;
        prototype = this.constructor.prototype;
        return !prototype.hasOwnProperty(key) ? (prototype[key] = f.apply(this)) : prototype[key];
      };
    },
    nullary_memo: function(id, f) {
      "memoizes a nullary function on an instance";
      return function() {
        var key;
        return f;
        key = "memory of nullary " + id;
        return !(key in this) ? (this[key] = f.apply(this)) : this[key];
      };
    },
    uncamel: function(string) {
      var _i, _len, _ref, _result, part, parts;
      "Converts CamelBack (not ALLCAPS) string to this_thing.";
      if ((/^[A-Z]/.test(string)) && (/[a-z]/.test(string))) {
        parts = (function() {
          _result = []; _ref = string.split(/(?=[A-Z0-9])/);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            part = _ref[_i];
            _result.push(part ? part.toLowerCase() : null);
          }
          return _result;
        })();
        return parts.join("_");
      }
    }
  });
  _ref = {
    _special_identifiers: {
      theta: ["θ", "\\theta"],
      pi: ["π", "\\pi"],
      tau: ["τ", "\\tau"],
      mu: ["μ", "\\mu"],
      sin: ["sin", "\\sin"],
      cos: ["cos", "\\cos"],
      tan: ["tan", "\\tan"],
      arcsin: ["arcsin", "\\arcsin"],
      arccos: ["arccos", "\\arccos"],
      arctan: ["arctan", "\\arctan"]
    },
    _make_provider: function(cls) {
      "For now just like new, but later will memoize and such.";
      return function() {
        var _ctor, _ref2, _result, args;
        args = __slice.call(arguments, 0);
        return (function() {
          var ctor = function(){};
          __extends(ctor, _ctor = cls);
          return typeof (_result = _ctor.apply(_ref2 = new ctor, args)) === "object" ? _result : _ref2;
        }).call(this);
      };
    },
    _make_providers: function() {
      var _i, _ref2, _result, new_name, old_name;
      "For each FooBar in this define foo_bar = this._provider FooBar.";
      _result = []; _ref2 = this;
      for (old_name in _ref2) {
        if (!__hasProp.call(_ref2, old_name)) continue;
        _i = _ref2[old_name];
        _result.push((new_name = utility.uncamel(old_name)) ? (this[new_name] = this._make_provider(this[old_name])) : null);
      }
      return _result;
    },
    _significance: function(x) {
      return x in shore._significations ? this._significations[x] : x;
    },
    _signified: function(significance, f) {
      f.significance = (shore._significance(significance));
      return f;
    },
    _canonization: function(significance, name, f) {
      return shore._signified(significance, f);
    },
    _significations: {
      minor: 0,
      moderate: 1,
      major: 2
    },
    Thing: (function() {
      Thing = function() {};
      Thing.prototype.precedence = 0;
      Thing.prototype.eq = function(other) {
        return this.type === other.type && this._eq(other);
      };
      Thing.prototype.canonize = function(enough, excess) {
        var _ref2, _ref3, next, result, significance;
        enough = shore._significance(enough);
        excess = shore._significance(excess);
        result = this;
        while (true) {
          next = result.next_canonization();
          if (!next.length) {
            break;
          }
          _ref2 = next;
          _ref3 = _ref2[0];
          significance = _ref3.significance;
          value = _ref2[1];
          if ((typeof excess !== "undefined" && excess !== null) && (significance >= excess)) {
            break;
          }
          result = value;
          if ((typeof enough !== "undefined" && enough !== null) && (significance >= enough)) {
            break;
          }
        }
        return result;
      };
      Thing.prototype.next_canonization = function() {
        var _i, _len, _ref2, _result, canonization;
        _result = []; _ref2 = this.get_canonizers();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          canonization = _ref2[_i];
          value = canonization.apply(this);
          if (value && !this.eq(value)) {
            return [canonization, value];
          }
        }
        return _result;
      };
      Thing.prototype.get_canonizers = function() {
        return this._get_canonizers();
      };
      Thing.prototype._get_canonizers = function() {
        return [];
      };
      Thing.prototype.to_tex = function(context) {
        context = (typeof context !== "undefined" && context !== null) ? context : 1;
        return this.precedence < context ? ("\\left(" + (this.to_free_tex()) + "\\right)") : this.to_free_tex();
      };
      Thing.prototype.to_string = function(context) {
        context = (typeof context !== "undefined" && context !== null) ? context : 0;
        return this.precedence < context ? ("(" + (this.to_free_string()) + ")") : this.to_free_string();
      };
      Thing.prototype.toString = function() {
        return this.to_js ? this.to_js() : ("S{" + (this.to_string()) + "}");
      };
      Thing.prototype.to_free_string = function() {
        return "SHORE PRIVATE TYPE";
      };
      Thing.prototype.to_free_tex = function() {
        return "\\text{SHORE PRIVATE TYPE}";
      };
      return Thing;
    })(),
    Value: (function() {
      Value = function() {
        return Thing.apply(this, arguments);
      };
      __extends(Value, Thing);
      Value.prototype.is_a_value = true;
      Value.prototype.plus = function(other) {
        return shore.sum([this, other]);
      };
      Value.prototype.minus = function(other) {
        return shore.sum([this, other.neg()]);
      };
      Value.prototype.times = function(other) {
        return shore.product([this, other]);
      };
      Value.prototype.over = function(other) {
        return shore.product([this, other.to_the(shore(-1))]);
      };
      Value.prototype.pos = function() {
        return this;
      };
      Value.prototype.neg = function() {
        return (shore(-1)).times(this);
      };
      Value.prototype.to_the = function(other) {
        return shore.exponent(this, other);
      };
      Value.prototype.equals = function(other) {
        return shore.equality([this, other]);
      };
      Value.prototype.integrate = function(variable) {
        return shore.integral(this, variable);
      };
      Value.prototype.differentiate = function(variable) {
        return shore.derivative(this, variable);
      };
      Value.prototype.given = function(substitution) {
        return shore.pending_substitution(this, substitution);
      };
      Value.prototype.plus_minus = function(other) {
        return shore.with_margin_of_error(this, other);
      };
      Value.prototype._then = function(other) {
        return other.is_a_value ? this.times(other) : this.given(other);
      };
      return Value;
    })(),
    Number: (function() {
      Number = function(_arg) {
        this.value = _arg;
        return this;
      };
      __extends(Number, Value);
      Number.prototype.precedence = 10;
      Number.prototype._eq = function(other) {
        return this.value === other.value;
      };
      Number.prototype.neg = function() {
        return shore.number(-this.value);
      };
      Number.prototype.to_free_tex = function() {
        return String(this.value);
      };
      Number.prototype.to_free_string = function() {
        return String(this.value);
      };
      Number.prototype.to_js = function() {
        return "S(" + (this.value) + ")";
      };
      return Number;
    })(),
    Identifier: (function() {
      Identifier = function(_arg, _arg2) {
        var _ref2;
        this.tex_value = _arg2;
        this.string_value = _arg;
        if (!(typeof (_ref2 = this.tex_value) !== "undefined" && _ref2 !== null)) {
          if (this.string_value in shore._special_identifiers) {
            _ref2 = shore._special_identifiers[this.string_value];
            this.string_value = _ref2[0];
            this.tex_value = _ref2[1];
          } else {
            this.tex_value = this.string_value;
          }
        }
        return this;
      };
      __extends(Identifier, Value);
      Identifier.prototype.precedence = 10;
      Identifier.prototype._eq = function(other) {
        return this.value === other.value;
      };
      Identifier.prototype.to_free_tex = function() {
        return this.tex_value;
      };
      Identifier.prototype.to_free_string = function() {
        return this.string_value;
      };
      Identifier.prototype.to_js = function() {
        return this.string_value !== this.tex_value ? ("S.identifier(\"" + (this.string_value) + "\", \"" + (this.tex_value) + "\")") : ("S(\"" + (this.string_value) + "\")");
      };
      Identifier.prototype.sub = function(other) {
        var string, tex;
        string = ("" + (this.string_value) + "_" + (other.to_string()));
        tex = ("{" + (this.tex_value) + "}_{" + (other.to_tex()) + "}");
        return shore.identifier(string, tex);
      };
      return Identifier;
    })(),
    CANOperation: (function() {
      CANOperation = function(_arg) {
        this.operands = _arg;
        return this;
      };
      __extends(CANOperation, Value);
      CANOperation.prototype._eq = function(other) {
        var i;
        if (this.operands.length === other.operands.length) {
          return false;
        }
        for (i = 0; (0 <= this.operands.length - 1 ? i <= this.operands.length - 1 : i >= this.operands.length - 1); (0 <= this.operands.length - 1 ? i += 1 : i -= 1)) {
          if (!(this.operands[i].eq(other.operands[i]))) {
            return false;
          }
        }
        return true;
      };
      CANOperation.prototype.to_free_tex = function() {
        var _i, _len, _ref2, _result, operand;
        return (function() {
          _result = []; _ref2 = this.operands;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol);
      };
      CANOperation.prototype.to_free_string = function() {
        var _i, _len, _ref2, _result, operand;
        return (function() {
          _result = []; _ref2 = this.operands;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            _result.push(operand.to_string(this.precedence));
          }
          return _result;
        }).call(this).join(this.string_symbol);
      };
      CANOperation.prototype.to_js = function() {
        return "S." + (this.type.toLowerCase()) + "([" + (this.operands.join(", ")) + "])";
      };
      return CANOperation;
    })(),
    Sum: (function() {
      Sum = function() {
        return CANOperation.apply(this, arguments);
      };
      __extends(Sum, CANOperation);
      Sum.prototype.precedence = 2;
      Sum.prototype.get_nullary = function() {
        return shore(0);
      };
      Sum.prototype.string_symbol = " + ";
      Sum.prototype.tex_symbol = " + ";
      Sum.prototype.to_free_text = function() {
        return Sum.__super__.to_free_text.call(this).replace(/\+ *\-/, "-");
      };
      Sum.prototype.to_free_tex = function() {
        return Sum.__super__.to_free_tex.call(this).replace(/\+ *\-/, "-");
      };
      return Sum;
    })(),
    Product: (function() {
      Product = function() {
        return CANOperation.apply(this, arguments);
      };
      __extends(Product, CANOperation);
      Product.prototype.precedence = 4;
      Product.prototype.get_nullary = function() {
        return shore(1);
      };
      Product.prototype.string_symbol = " * ";
      Product.prototype.tex_symbol = " \\cdot ";
      Product.prototype._to_free_tex = function(operands) {
        var _i, _len, _ref2, _result, operand;
        "Without checking for negative powers.";
        return operands.length > 1 && operands[0].type === "Number" && operands[1].type !== "Number" ? (operands[0].value === -1 ? operands[0].to_tex(this.precedence) : "-") + ((function() {
          _result = []; _ref2 = operands.slice(1);
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol)) : ((function() {
          _result = []; _ref2 = operands;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol));
      };
      Product.prototype.to_free_tex = function() {
        var _i, _len, _ref2, bottom, exponent, negative_exponents, positive_exponents, term, top;
        positive_exponents = [];
        negative_exponents = [];
        _ref2 = this.operands;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          term = _ref2[_i];
          if (term.type === "Exponent") {
            exponent = term.exponent;
            if (exponent.type === "Number" && exponent.value < 0) {
              negative_exponents.push(shore.exponent(term.base, exponent.neg()));
            } else {
              positive_exponents.push(term);
            }
          } else {
            positive_exponents.push(term);
          }
        }
        positive_exponents || (positive_exponents = [shore(1)]);
        top = this._to_free_tex(positive_exponents);
        if (negative_exponents.length) {
          bottom = this._to_free_tex(negative_exponents);
          return "\\tfrac{" + (top) + "}{" + (bottom) + "}";
        } else {
          return top;
        }
      };
      return Product;
    })(),
    Exponent: (function() {
      Exponent = function(_arg, _arg2) {
        this.exponent = _arg2;
        this.base = _arg;
        return this;
      };
      __extends(Exponent, Value);
      Exponent.prototype.precedence = 5;
      Exponent.prototype._eq = function(other) {
        return this.base.eq(other.base) && this.exponent.eq(other.exponent);
      };
      Exponent.prototype.to_free_tex = function() {
        return this.exponent.type === "Number" && this.exponent.value === 1 ? this.base.to_tex(this.precedence) : ("{" + (this.base.to_tex(this.precedence)) + "}^{" + (this.exponent.to_tex()) + "}");
      };
      Exponent.prototype.to_free_string = function() {
        return this.exponent.type === "Number" && this.exponent.value === 1 ? this.base.to_tex(this.precedence) : ("" + (this.base.to_string(this.precedence)) + "^" + (this.exponent.to_string()));
      };
      Exponent.prototype.to_js = function() {
        return ("S(" + (this.base.to_js()) + ", " + (this.exponent.to_js()) + ")");
      };
      return Exponent;
    })(),
    Integral: (function() {
      Integral = function(_arg, _arg2) {
        this.variable = _arg2;
        this.expression = _arg;
        return this;
      };
      __extends(Integral, Value);
      Integral.prototype.precedence = 3;
      Integral.prototype._eq = function(other) {
        return this.expression.eq(other.expression) && this.variable.eq(other.variable);
      };
      Integral.prototype.to_free_tex = function() {
        return "\\int\\left[" + (this.expression.to_tex()) + "\\right]d" + (this.variable.to_tex());
      };
      return Integral;
    })(),
    Derivative: (function() {
      Derivative = function(_arg, _arg2) {
        this.variable = _arg2;
        this.expression = _arg;
        return this;
      };
      __extends(Derivative, Value);
      Derivative.prototype.precedence = 3;
      Derivative.prototype._eq = function(other) {
        return this.expression.eq(other.expression) && this.variable.eq(other.variable);
      };
      Derivative.prototype.to_free_tex = function() {
        return "\\tfrac{d}{d" + (this.variable.to_tex()) + "}\\left[" + (this.expression.to_tex()) + "\\right]";
      };
      return Derivative;
    })(),
    WithMarginOfError: (function() {
      WithMarginOfError = function(_arg, _arg2) {
        this.margin = _arg2;
        this.value = _arg;
        return this;
      };
      __extends(WithMarginOfError, Value);
      WithMarginOfError.prototype.precedence = 1.5;
      WithMarginOfError.prototype.tex_symbol = " \\pm ";
      WithMarginOfError.prototype.string_symbol = " ± ";
      WithMarginOfError.prototype.to_free_string = function() {
        return !this.margin.eq(shore(0)) ? ("" + (this.value.to_string(this.precedence)) + " " + (this.string_symbol) + " " + (this.margin.to_string(this.precedence))) : this.value.to_string(this.precedence);
      };
      WithMarginOfError.prototype.to_free_tex = function() {
        return !this.margin.eq(shore(0)) ? ("" + (this.value.to_tex(this.precedence)) + " " + (this.tex_symbol) + " " + (this.margin.to_tex(this.precedence))) : this.value.to_tex(this.precedence);
      };
      return WithMarginOfError;
    })(),
    Equality: (function() {
      Equality = function() {
        return CANOperation.apply(this, arguments);
      };
      __extends(Equality, CANOperation);
      Equality.prototype.precedence = 1;
      Equality.prototype.is_a_value = false;
      Equality.prototype.string_symbol = " = ";
      Equality.prototype.tex_symbol = " = ";
      return Equality;
    })(),
    PendingSubstitution: (function() {
      PendingSubstitution = function(_arg, _arg2) {
        this.substitution = _arg2;
        this.expression = _arg;
        this.is_a_value = this.expression.is_a_value;
        return this;
      };
      __extends(PendingSubstitution, Value);
      PendingSubstitution.prototype.precedence = 2.5;
      PendingSubstitution.prototype.thing = "PendingSubstitution";
      PendingSubstitution.prototype._eq = function(other) {
        return this.expression.eq(other.expression) && this.substitution.eq(other.substitution);
      };
      PendingSubstitution.prototype.string_symbol = "";
      PendingSubstitution.prototype.tex_symbol = "";
      PendingSubstitution.prototype.to_free_string = function() {
        return (this.expression.to_string(this.precedence)) + this.string_symbol + (this.substitution.to_string(this.precedence));
      };
      PendingSubstitution.prototype.to_free_tex = function() {
        return (this.expression.to_tex(this.precedence)) + this.tex_symbol + (this.substitution.to_tex(this.precedence));
      };
      return PendingSubstitution;
    })()
  };
  for (name in _ref) {
    if (!__hasProp.call(_ref, name)) continue;
    value = _ref[name];
    shore[name] = value;
    if (utility.uncamel(name)) {
      shore[name].prototype.type = name;
    }
  }
  _ref = {
    CANOperation: function() {
      return CANOperation.__super__._get_canonizers.apply(this).concat([
        canonization("minor", "single argument", function() {
          if (this.operands.length === 1) {
            return this.operands[0];
          }
        }), canonization("minor", "no arguments", function() {
          if (this.operands.length === 0 && this.get_nullary) {
            return this.get_nullary();
          }
        })
      ]);
    },
    Sum: function() {
      return Sum.__super__._get_canonizers.apply(this).concat([
        canonization("major", "numbers in sum", function() {
          var _i, _len, _ref2, not_numbers, numbers, operand, sum;
          numbers = [];
          not_numbers = [];
          _ref2 = this.operands;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            if (operand.type === "Number") {
              numbers.push(operand);
            } else {
              not_numbers.push(operand);
            }
          }
          if (numbers.length > 1) {
            sum = this.get_nullary().value;
            while (numbers.length) {
              sum += numbers.pop().value;
            }
            return shore.sum([shore.number(sum)].concat(not_numbers));
          }
        })
      ]);
    },
    Equality: function() {
      return Equality.__super__._get_canonizers.apply(this).concat([
        canonization("minor", "minors in equality", function() {
          var _i, _len, _ref2, _result, o;
          return shore.equality((function() {
            _result = []; _ref2 = this.operands;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              o = _ref2[_i];
              _result.push(o.canonize("minor", "minor"));
            }
            return _result;
          }).call(this));
        }), canonization("moderate", "moderates in equality", function() {
          var _i, _len, _ref2, _result, o;
          return shore.equality((function() {
            _result = []; _ref2 = this.operands;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              o = _ref2[_i];
              _result.push(o.canonize("moderate", "moderate"));
            }
            return _result;
          }).call(this));
        }), canonization("majors", "majors in equality", function() {
          var _i, _len, _ref2, _result, o;
          return shore.equality((function() {
            _result = []; _ref2 = this.operands;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              o = _ref2[_i];
              _result.push(o.canonize("majors", "majors"));
            }
            return _result;
          }).call(this));
        })
      ]);
    }
  };
  for (name in _ref) {
    if (!__hasProp.call(_ref, name)) continue;
    getter_of_canonizers = _ref[name];
    shore[name].prototype._get_canonizers = getter_of_canonizers;
  }
  canonization = shore._canonization;
  shore._make_providers();
  if (window) {
    window.shore = shore;
    window._S = window.S;
    window.S = shore;
  }
}).call(this);
