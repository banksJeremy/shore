(function() {
  var CANOperation, Derivative, Equality, Exponent, Identifier, Integral, Number, PendingSubstitution, Product, Sum, Thing, Value, shore;
  var __slice = Array.prototype.slice, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  window.shore = (shore = {
    Thing: (function() {
      Thing = function() {
        var args, just_construct, self;
        args = __slice.call(arguments, 0);
        "We'll define .init on subclasses and they'll work with or without new.";
        just_construct = args && args[0] === " _CONSTRUCT";
        if (!(this instanceof arguments.callee)) {
          self = new arguments.callee(" _CONSTRUCT");
          console.log(arguments.callee);
        } else {
          self = this;
        }
        if (!just_construct) {
          self.init.apply(self, args);
        }
        return self;
        return this;
      };
      Thing.prototype.toString = function() {
        return "" + (this.type) + "{" + (this.to_string()) + "}";
      };
      Thing.prototype.precedence = 0;
      Thing.prototype.init = function() {};
      Thing.prototype.to_free_string = function() {
        return "[Value]";
      };
      Thing.prototype.to_free_tex = function() {
        return "\\text{[Value]}";
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
        return this.to_string();
      };
      return Thing;
    })(),
    Value: (function() {
      Value = function() {
        return Thing.apply(this, arguments);
      };
      __extends(Value, Thing);
      Value.prototype.plus = function(other) {
        return shore.Sum([this, other]);
      };
      Value.prototype.minus = function(other) {
        return shore.Sum([this, other.neg()]);
      };
      Value.prototype.times = function(other) {
        return shore.Product([this, other]);
      };
      Value.prototype.over = function(other) {
        return shore.Product([this, other.to_the(shore.NEGATIVE_ONE)]);
      };
      Value.prototype.pos = function() {
        return this;
      };
      Value.prototype.to_the = function(other) {
        return shore.Exponent(this, other);
      };
      Value.prototype.equals = function(other) {
        return shore.Equality(this, other);
      };
      Value.prototype.integrate = function(variable) {
        return shore.Integral(this, variable);
      };
      Value.prototype.differentiate = function(variable) {
        return shore.Derivative(this, variable);
      };
      Value.prototype.given = function(substitution) {
        return shore.PendingSubstitution(this, substitution);
      };
      return Value;
    })(),
    Number: (function() {
      Number = function() {
        return Value.apply(this, arguments);
      };
      __extends(Number, Value);
      Number.prototype.precedence = 10;
      Number.prototype.init = function(_arg) {
        this.value = _arg;
      };
      Number.prototype.neg = function() {
        return shore.Number - this.value;
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
      Identifier = function() {
        return Value.apply(this, arguments);
      };
      __extends(Identifier, Value);
      Identifier.prototype.precedence = 10;
      Identifier.prototype.init = function(_arg, _arg2) {
        this.tex_value = _arg2;
        this.string_value = _arg;
        return this.tex_value = (typeof this.tex_value !== "undefined" && this.tex_value !== null) ? this.tex_value : this.string_value;
      };
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
        return shore.Identifier(string, tex);
      };
      return Identifier;
    })(),
    CANOperation: (function() {
      CANOperation = function() {
        return Value.apply(this, arguments);
      };
      __extends(CANOperation, Value);
      CANOperation.prototype.init = function(_arg) {
        this.operands = _arg;
      };
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
          if (typeof term === "Exponent") {
            exponent = term.exponent;
            if (exponent.type === "Number" && exponent.value < 0) {
              negative_exponents.push(new Exponent(term.base, exponent.neg()));
            } else {
              positive_exponents.push(term);
            }
          } else {
            positive_exponents.push(term);
          }
        }
        positive_exponents || (positive_exponents = [new shore.Number(1)]);
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
      Exponent = function() {
        return Value.apply(this, arguments);
      };
      __extends(Exponent, Value);
      Exponent.prototype.precedence = 5;
      Exponent.prototype.init = function(_arg, _arg2) {
        this.exponent = _arg2;
        this.base = _arg;
      };
      Exponent.prototype.to_free_tex = function() {
        return this.exponent.type === "Number" && this.exponent.value === 1 ? this.base.to_tex(this.precedence) : ("{" + (this.base.to_tex(this.precedence)) + "}^{" + (this.exponent.to_tex()) + "}");
      };
      Exponent.prototype.to_free_string = function() {
        return this.exponent.type === "Number" && this.exponent.value === 1 ? this.base.to_tex(this.precedence) : ("" + (this.base.to_string(this.precedence)) + "^" + (this.exponent.to_string()));
      };
      return Exponent;
    })(),
    Integral: (function() {
      Integral = function() {
        return Value.apply(this, arguments);
      };
      __extends(Integral, Value);
      Integral.prototype.precedence = 3;
      Integral.prototype.init = function(_arg, _arg2) {
        this.variable = _arg2;
        this.expression = _arg;
      };
      Integral.prototype.to_free_tex = function() {
        return "\\int\\left[" + (this.expression.to_tex()) + "\\right]d" + (this.variable.to_tex());
      };
      return Integral;
    })(),
    Derivative: (function() {
      Derivative = function() {
        return Value.apply(this, arguments);
      };
      __extends(Derivative, Value);
      Derivative.prototype.precedence = 3;
      Derivative.prototype.init = function(_arg, _arg2) {
        this.variable = _arg2;
        this.expression = _arg;
      };
      Derivative.prototype.to_free_tex = function() {
        return "\\tfrac{d}{d" + (this.variable.to_tex()) + "}\\left[" + (this.expression.to_tex()) + "\\right]";
      };
      return Derivative;
    })(),
    Equality: (function() {
      Equality = function() {
        return Thing.apply(this, arguments);
      };
      __extends(Equality, Thing);
      Equality.prototype.precedence = 10;
      Equality.prototype.init = function() {
        var _arg;
        _arg = __slice.call(arguments, 0);
        this.terms = _arg;
      };
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
        var _ctor, _ctor2, _ref, _ref2, _result, _result2;
        return other.type === Equality ? (function() {
          var ctor = function(){};
          __extends(ctor, _ctor2 = shore.Equality);
          return typeof (_result2 = _ctor2.apply(_ref2 = new ctor, this.terms.concat(other.terms))) === "object" ? _result2 : _ref2;
        }).call(this) : (function() {
          var ctor = function(){};
          __extends(ctor, _ctor = shore.Equality);
          return typeof (_result = _ctor.apply(_ref = new ctor, this.terms.concat([other]))) === "object" ? _result : _ref;
        }).call(this);
      };
      return Equality;
    })(),
    PendingSubstitution: (function() {
      PendingSubstitution = function() {
        return Value.apply(this, arguments);
      };
      __extends(PendingSubstitution, Value);
      PendingSubstitution.prototype.precedence = 16;
      PendingSubstitution.prototype.thing = "PendingSubstitution";
      PendingSubstitution.prototype.init = function(_arg, _arg2) {
        this.substitution = _arg2;
        this.expression = _arg;
      };
      PendingSubstitution.prototype.to_free_string = function() {
        return (this.expression.to_string(0)) + " given " + (this.substitution.to_string(15));
      };
      PendingSubstitution.prototype.to_free_tex = function() {
        return (this.expression.to_tex(0)) + " \\;\\text{given}\\; " + (this.substitution.to_tex(15));
      };
      return PendingSubstitution;
    })()
  });
  shore.ZERO = new shore.Number(0);
  shore.ONE = new shore.Number(1);
  shore.NEGATIVE_ONE = new shore.Number() - 1;
}).call(this);
