(function() {
  var CANOperation, Derivative, Equality, Exponent, Identifier, Integral, Number, PendingSubstitution, Product, Sum, Thing, Value, _ref, canonization, name, shore, utility, value;
  var __slice = Array.prototype.slice, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  }, __hasProp = Object.prototype.hasOwnProperty;
  shore = function() {
    var _i, _len, _ref, _result, arg, args;
    args = __slice.call(arguments, 0);
    if (args.length === 1) {
      arg = args[0];
      if (typeof arg === "number") {
        return shore.number(arg);
      }
      if (typeof arg === "string") {
        return shore.identifier(arg);
      }
      throw new Error("Shore does not know what to do with " + (arg) + ".");
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
        var _i, _len, key, prototype;
        key = "proto-memory of nullary " + id;
        prototype = this.constructor.prototype;
        return !(function(){ for (var _i=0, _len=prototype.length; _i<_len; _i++) { if (prototype[_i] === key) return true; } return false; }).call(this) ? (prototype[key] = f.apply(this)) : prototype[key];
      };
    },
    nullary_memo: function(id, f) {
      "memoizes a nullary function on an instance";
      return function() {
        var _i, _len, key;
        key = "memory of nullary " + id;
        return !(function(){ for (var _i=0, _len=this.length; _i<_len; _i++) { if (this[_i] === key) return true; } return false; }).call(this) ? (this[key] = f.apply(this)) : this[key];
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
      var _i, _len, _ref2;
      return (function(){ for (var _i=0, _len=(_ref2 = shore._significations).length; _i<_len; _i++) { if (_ref2[_i] === x) return true; } return false; }).call(this) ? this._significations[x] : x;
    },
    _signified: function(significance, f) {
      f.significance = (shore._significance(significance));
      return f;
    },
    _canonization: function(significance, name, f) {
      return shore._signified(significance, utility.nullary_memo("canonization (" + (name) + ")", f));
    },
    _significations: {
      minor: 0,
      moderate: 1,
      major: 2
    },
    Thing: (function() {
      Thing = function() {};
      Thing.prototype.type = "Thing";
      Thing.prototype.precedence = 0;
      Thing.prototype.eq = function(other) {
        return this.type === other.type && this._eq(other);
      };
      Thing.prototype.canonize = function(enough, excess) {
        var _ref2, _ref3, next, result, significance;
        enough = shore._significance(enough || 0);
        excess = shore._significance(excess || 0);
        result = this;
        while (true) {
          next = result.next_canonization();
          if (!next) {
            break;
          }
          _ref2 = next;
          _ref3 = _ref2[0];
          significance = _ref3.significance;
          value = _ref2[1];
          if (significance >= excess) {
            break;
          }
          result = value;
          if (significance >= enough) {
            break;
          }
        }
        return result;
      };
      Thing.prototype.next_canonization = function() {
        var _i, _len, _ref2, _result, canonization;
        _result = []; _ref2 = this.get_canonizations();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          canonization = _ref2[_i];
          value = canonization.apply(this);
          if (value && !this.eq(value)) {
            return [canonization, value];
          }
        }
        return _result;
      };
      Thing.prototype.get_canonizations = (utility.nullary_proto_memo("get_canonizations", function() {
        return this._get_canonizations();
      }));
      Thing.prototype._get_canonizations = function() {
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
        return this.to_js ? this.to_js() : ("#shore{" + (this.to_string()) + "}");
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
        return shore.product([this, other.to_the(shore(-1))]);
      };
      Value.prototype.pos = function() {
        return this;
      };
      Value.prototype.neg = function() {
        return (shore(0)).minus(this);
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
        this.tex_value = _arg2;
        this.string_value = _arg;
        this.tex_value = (typeof this.tex_value !== "undefined" && this.tex_value !== null) ? this.tex_value : this.string_value;
        return this;
      };
      __extends(Identifier, Value);
      Identifier.prototype.type = "Identifier";
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
        return "S(\"" + (this.value) + "\")";
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
      CANOperation.prototype._eq = function(other) {
        var _ref2, i;
        if (this.operands.length !== other.operands.length) {
          return false;
        }
        _ref2 = this.operands.length;
        for (i = 0; (0 <= _ref2 ? i <= _ref2 : i >= _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
          if (!(this.operands[i].eq(other.operands[i]))) {
            return false;
          }
        }
        return true;
      };
      CANOperation.prototype._get_canonizations = function() {
        return CANOperation.__super__._get_canonizations.call(this).concat([
          canonization("minor", "single argument", function() {
            if (this.operands.length === 1) {
              return this.operands[0];
            }
          })
        ]);
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
        var _i, _len, _ref2, _result, bottom, exponent, negative_exponents, operand, positive_exponents, term, top;
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
        top = ((function() {
          _result = []; _ref2 = positive_exponents;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol));
        if (negative_exponents.length) {
          bottom = ((function() {
            _result = []; _ref2 = negative_exponents;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              operand = _ref2[_i];
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
        console.log(arguments);
        return this;
      };
      __extends(Exponent, Value);
      Exponent.prototype.type = "Exponent";
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
      Derivative.prototype.type = "Derivative";
      Derivative.prototype.precedence = 3;
      Derivative.prototype._eq = function(other) {
        return this.expression.eq(other.expression) && this.exponent.eq(other.variable);
      };
      Derivative.prototype.to_free_tex = function() {
        return "\\tfrac{d}{d" + (this.variable.to_tex()) + "}\\left[" + (this.expression.to_tex()) + "\\right]";
      };
      return Derivative;
    })(),
    Equality: (function() {
      Equality = function() {
        return CANOperation.apply(this, arguments);
      };
      __extends(Equality, CANOperation);
      Equality.prototype.precedence = 1;
      Equality.prototype.type = "Equality";
      Equality.prototype.string_symbol = " = ";
      Equality.prototype.tex_symbol = " = ";
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
      PendingSubstitution.prototype._eq = function(other) {
        return this.expression.eq(other.expression) && this.substitution.eq(other.substitution);
      };
      PendingSubstitution.prototype.to_free_string = function() {
        return (this.expression.to_string(0)) + " given " + (this.substitution.to_string(15));
      };
      PendingSubstitution.prototype.to_free_tex = function() {
        return (this.expression.to_tex(0)) + " \\;\\text{given}\\; " + (this.substitution.to_tex(15));
      };
      return PendingSubstitution;
    })()
  };
  for (name in _ref) {
    if (!__hasProp.call(_ref, name)) continue;
    value = _ref[name];
    shore[name] = value;
  }
  canonization = shore._canonization;
  shore._make_providers();
  if (window) {
    window.shore = shore;
    window._S = window.S;
    window.S = shore;
  }
}).call(this);
