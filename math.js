(function() {
  var CANOperation, Derivative, Equality, Exponent, Identifier, Integral, Number, PendingSubstitution, Product, Sum, Thing, Value, shore;
  var __slice = Array.prototype.slice, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  }, __hasProp = Object.prototype.hasOwnProperty;
  window.shore = (shore = {
    _provider: function(cls) {
      "For now just like new, but later will memoize and such.";
      return function() {
        var _ctor, _ref, _result, args;
        args = __slice.call(arguments, 0);
        return (function() {
          var ctor = function(){};
          __extends(ctor, _ctor = cls);
          return typeof (_result = _ctor.apply(_ref = new ctor, args)) === "object" ? _result : _ref;
        }).call(this);
      };
    },
    _uncamel: function(string) {
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
    },
    _add_providers_to: function(module) {
      var _i, _ref, _result, new_name, old_name;
      "For each FooBar in module define foo_bar = module._provider FooBar.";
      console.log("adding to");
      _result = []; _ref = module;
      for (old_name in _ref) {
        if (!__hasProp.call(_ref, old_name)) continue;
        _i = _ref[old_name];
        _result.push((new_name = shore._uncamel(old_name)) ? (module[new_name] = module._provider(module[old_name])) : null);
      }
      return _result;
    },
    Thing: (function() {
      Thing = function() {};
      Thing.prototype.type = "Thing";
      Thing.prototype.precedence = 0;
      Thing.prototype.to_tex = function(context) {
        context = (typeof context !== "undefined" && context !== null) ? context : 1;
        return this.precedence < context ? ("\\left(" + (this.to_free_tex()) + "\\right)") : this.to_free_tex();
      };
      Thing.prototype.to_string = function(context) {
        context = (typeof context !== "undefined" && context !== null) ? context : 0;
        return this.precedence < context ? ("(" + (this.to_free_string()) + ")") : this.to_free_string();
      };
      Thing.prototype.toString = function() {
        return "" + (this.type) + "{" + (this.to_string()) + "}";
      };
      return Thing;
    })(),
    Value: (function() {
      Value = function() {
        return Thing.apply(this, arguments);
      };
      __extends(Value, Thing);
      Value.prototype.type = "Value";
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
        return shore.product([this, other.to_the(shore.NEGATIVE_ONE)]);
      };
      Value.prototype.pos = function() {
        return this;
      };
      Value.prototype.neg = function() {
        return shore.ZERO.minus(this);
      };
      Value.prototype.to_the = function(other) {
        return shore.exponent(this, other);
      };
      Value.prototype.equals = function(other) {
        return shore.equality(this, other);
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
      return Value;
    })(),
    Number: (function() {
      Number = function(_arg) {
        this.value = _arg;
        return this;
      };
      __extends(Number, Value);
      Number.prototype.type = "Number";
      Number.prototype.precedence = 10;
      Number.prototype.neg = function() {
        return shore.number(-this.value);
      };
      Number.prototype.to_free_tex = function() {
        return String(this.value);
      };
      Number.prototype.to_free_string = function() {
        return String(this.value);
      };
      return Number;
    })(),
    Identifier: (function() {
      Identifier = function(_arg, _arg2) {
        this.tex_value = _arg2;
        this.string_value = _arg;
        this.tex_value = (typeof this.tex_value !== "undefined" && this.tex_value !== null) ? this.tex_value : this.string_value;
        return this;
      };
      __extends(Identifier, Value);
      Identifier.prototype.type = "Identifier";
      Identifier.prototype.precedence = 10;
      Identifier.prototype.to_free_tex = function() {
        return this.tex_value;
      };
      Identifier.prototype.to_free_string = function() {
        return this.string_value;
      };
      Identifier.prototype.sub = function(other) {
        var string, tex;
        string = ("{" + (this.string_value) + "}_" + (other.to_string()));
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
      CANOperation.prototype.type = "CANOperation";
      CANOperation.prototype.to_free_tex = function() {
        var _i, _len, _ref, _result, operand;
        return (function() {
          _result = []; _ref = this.operands;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol);
      };
      CANOperation.prototype.to_free_string = function() {
        var _i, _len, _ref, _result, operand;
        return (function() {
          _result = []; _ref = this.operands;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_string(this.precedence));
          }
          return _result;
        }).call(this).join(this.string_symbol);
      };
      return CANOperation;
    })(),
    Sum: (function() {
      Sum = function() {
        return CANOperation.apply(this, arguments);
      };
      __extends(Sum, CANOperation);
      Sum.prototype.type = "Sum";
      Sum.prototype.precedence = 2;
      Sum.prototype.string_symbol = " + ";
      Sum.prototype.tex_symbol = " + ";
      return Sum;
    })(),
    Product: (function() {
      Product = function() {
        return CANOperation.apply(this, arguments);
      };
      __extends(Product, CANOperation);
      Product.prototype.type = "Product";
      Product.prototype.precedence = 4;
      Product.prototype.string_symbol = " f ";
      Product.prototype.tex_symbol = " \\cdot ";
      Product.prototype.to_free_tex = function() {
        var _i, _len, _ref, _result, bottom, exponent, negative_exponents, operand, positive_exponents, term, top;
        positive_exponents = [];
        negative_exponents = [];
        _ref = this.operands;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          term = _ref[_i];
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
        positive_exponents || (positive_exponents = [shore.ONE]);
        top = ((function() {
          _result = []; _ref = positive_exponents;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol));
        if (negative_exponents.length) {
          bottom = ((function() {
            _result = []; _ref = negative_exponents;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              operand = _ref[_i];
              _result.push(operand.to_tex(this.precedence));
            }
            return _result;
          }).call(this).join(this.tex_symbol));
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
      Exponent.prototype.type = "Exponent";
      Exponent.prototype.precedence = 5;
      Exponent.prototype.to_free_tex = function() {
        return this.exponent.type === "Number" && this.exponent.value === 1 ? this.base.to_tex(this.precedence) : ("{" + (this.base.to_tex(this.precedence)) + "}^{" + (this.exponent.to_tex()) + "}");
      };
      Exponent.prototype.to_free_string = function() {
        return this.exponent.type === "Number" && this.exponent.value === 1 ? this.base.to_tex(this.precedence) : ("" + (this.base.to_string(this.precedence)) + "^" + (this.exponent.to_string()));
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
      Integral.prototype.type = "Integral";
      Integral.prototype.precedence = 3;
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
      Derivative.prototype.type = "Derivative";
      Derivative.prototype.precedence = 3;
      Derivative.prototype.to_free_tex = function() {
        return "\\tfrac{d}{d" + (this.variable.to_tex()) + "}\\left[" + (this.expression.to_tex()) + "\\right]";
      };
      return Derivative;
    })(),
    Equality: (function() {
      Equality = function() {
        var _arg;
        _arg = __slice.call(arguments, 0);
        this.terms = _arg;
        return this;
      };
      __extends(Equality, Thing);
      Equality.prototype.precedence = 10;
      Equality.prototype.type = "Equality";
      Equality.prototype.string_symbol = " = ";
      Equality.prototype.tex_symbol = " = ";
      Equality.prototype.to_free_tex = function() {
        var _i, _len, _ref, _result, term;
        return (function() {
          _result = []; _ref = this.terms;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            term = _ref[_i];
            _result.push(term.to_tex());
          }
          return _result;
        }).call(this).join(this.tex_symbol);
      };
      Equality.prototype.to_free_string = function() {
        var _i, _len, _ref, _result, term;
        return (function() {
          _result = []; _ref = this.terms;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            term = _ref[_i];
            _result.push(term.to_string());
          }
          return _result;
        }).call(this).join(this.string_symbol);
      };
      Equality.prototype.equals = function(other) {
        return other.type === Equality ? shore.equality.apply(shore, this.terms.concat(other.terms)) : shore.equality.apply(shore, this.terms.concat([other]));
      };
      return Equality;
    })(),
    PendingSubstitution: (function() {
      PendingSubstitution = function(_arg, _arg2) {
        this.substitution = _arg2;
        this.expression = _arg;
        return this;
      };
      __extends(PendingSubstitution, Value);
      PendingSubstitution.prototype.precedence = 16;
      PendingSubstitution.prototype.thing = "PendingSubstitution";
      PendingSubstitution.prototype.to_free_string = function() {
        return (this.expression.to_string(0)) + " given " + (this.substitution.to_string(15));
      };
      PendingSubstitution.prototype.to_free_tex = function() {
        return (this.expression.to_tex(0)) + " \\;\\text{given}\\; " + (this.substitution.to_tex(15));
      };
      return PendingSubstitution;
    })()
  });
  shore._add_providers_to(shore);
  shore.ZERO = shore.number(0);
  shore.ONE = shore.number(1);
  shore.NEGATIVE_ONE = shore.number(-1);
  shore.X = shore.identifier("x");
  shore.Y = shore.identifier("y");
  shore.Z = shore.identifier("z");
}).call(this);
