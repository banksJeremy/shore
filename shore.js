(function() {
  var CANOperation, Derivative, Equality, Exponent, Identifier, Integral, Matrix, Number, PendingSubstitution, Product, Sum, System, Thing, Value, WithMarginOfError, __definers_of_canonizers, __not_types, __types, _i, _len, _ref, _ref2, canonization, def, definer, definition, former_S, former_shore, name, root, shore, sss, type, utility;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  /*
  Shore Math Module
  http://jeremybanks.github.com/shore/

  Copyright Jeremy Banks <jeremy@jeremybanks.com>
  Released under the MIT License
  */
  root = this;
  former_S = root.S;
  former_shore = root.shore;
  shore = (root.S = (root.shore = function() {
    var _i, _len, _ref, _result, arg, args;
    args = __slice.call(arguments, 0);
    if (args.length === 1) {
      arg = args[0];
      if (arg.is_shore_thing) {
        return arg;
      } else if (typeof arg === "object" && arg.constructor === Array) {
        if (arg.length && typeof arg[0] === "object" && arg[0].constructor === Array) {
          return shore.matrix({
            values: utility.call_in(arg, shore)
          });
        } else {
          throw new Error("Unable to handle argument of 1D array.");
        }
      } else if (typeof arg === "number") {
        return shore.number({
          value: arg
        });
      } else if (typeof arg === "string") {
        if (/^[a-zA-Z][a-zA-Z0-9]*'*$/.test(arg)) {
          return shore.identifier({
            value: arg
          });
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
    } else if (args.length) {
      return shore.system({
        equations: (function() {
          _result = []; _ref = args;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            arg = _ref[_i];
            _result.push(shore(arg));
          }
          return _result;
        })()
      });
    } else {
      return shore;
    }
  }));
  utility = (shore.utility = (shore.U = {
    uncamel: function(string) {
      var _i, _len, _ref, _result, part, parts;
      if ((/^[A-Z]/.test(string)) && (/[a-z]/.test(string))) {
        parts = (function() {
          _result = []; _ref = string.split(/(?=[A-Z0-9]+)/);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            part = _ref[_i];
            _result.push(part ? part.toLowerCase() : null);
          }
          return _result;
        })();
        return parts.join("_");
      }
    },
    hash: function(object) {
      var _i, _len, _ref, _result, k, key, o, sorted_keys;
      if (typeof (_ref = object.__hashed__) !== "undefined" && _ref !== null) {
        return object.__hashed__;
      } else if (typeof (_ref = object.__hash__) !== "undefined" && _ref !== null) {
        return (object.__hashed__ = ("OH{" + (object.__hash__()) + "}"));
      } else {
        if (utility.is_array(object)) {
          return "L{" + ((function() {
            _result = []; _ref = object;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              o = _ref[_i];
              _result.push(utility.hash(o));
            }
            return _result;
          })().join("|")) + "}";
        } else if (typeof object === "object") {
          (sorted_keys = (function() {
            _result = []; _ref = object;
            for (key in _ref) {
              if (!__hasProp.call(_ref, key)) continue;
              _i = _ref[key];
              _result.push(key);
            }
            return _result;
          })()).sort();
          return "O{" + ((function() {
            _result = []; _ref = sorted_keys;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              k = _ref[_i];
              _result.push(utility.hash(k + ":" + utility.hash(object[k])));
            }
            return _result;
          })().join("|")) + "}";
        } else {
          return String(object);
        }
      }
    },
    memoize: function(f, memory, hasher) {
      var memoized;
      hasher = (typeof hasher !== "undefined" && hasher !== null) ? hasher : utility.hash;
      memory = (typeof memory !== "undefined" && memory !== null) ? memory : {};
      memoized = function() {
        var arguments, key;
        arguments = __slice.call(arguments, 0);
        "The memoized copy of a function.";
        key = memoized.hasher([this].concat(arguments));
        return key in memory ? memoized.memory[key] : (memoized.memory[key] = f.apply(this, arguments));
      };
      memoized.memory = memory;
      memoized.hasher = hasher;
      return memoized;
    },
    sss: function(s) {
      return s.split(" ");
    },
    make_providers: function(module) {
      var _i, _ref, _result, new_name, old_name;
      _result = []; _ref = module;
      for (old_name in _ref) {
        if (!__hasProp.call(_ref, old_name)) continue;
        _i = _ref[old_name];
        _result.push((new_name = utility.uncamel(old_name)) ? (module[new_name] = (module[old_name].prototype.provider = module._make_provider(module[old_name]))) : null);
      }
      return _result;
    },
    extend: function(destination) {
      var _i, _j, _len, _ref, _ref2, _result, _result2, property, source, sources;
      sources = __slice.call(arguments, 1);
      _result = []; _ref = sources;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        source = _ref[_i];
        _result.push((function() {
          _result2 = []; _ref2 = source;
          for (property in _ref2) {
            if (!__hasProp.call(_ref2, property)) continue;
            _j = _ref2[property];
            _result2.push(destination[property] = source[property]);
          }
          return _result2;
        })());
      }
      return _result;
    },
    is_array: function(object) {
      return typeof object === "object" && object.constructor === Array;
    },
    is_object: function(object) {
      return typeof object === "object" && object.constructor === Object;
    },
    is_string: function(object) {
      return typeof object === "string";
    },
    call_in: function(object, f) {
      var _i, _len, _ref, _result, extra_arguments, key, result, value;
      extra_arguments = __slice.call(arguments, 2);
      if (utility.is_array(object)) {
        _result = []; _ref = object;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          value = _ref[_i];
          _result.push(utility.call_in.apply(utility, [value, f].concat(extra_arguments)));
        }
        return _result;
      } else if (utility.is_object(object)) {
        result = {};
        _ref = object;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          value = _ref[key];
          result[key] = utility.call_in.apply(utility, [value, f].concat(extra_arguments));
        }
        return result;
      } else if (typeof object === "object") {
        return f.apply(this, [object].concat(extra_arguments));
      } else {
        return object;
      }
    }
  }));
  __not_types = {
    __hashed__: "!!SHORE!!",
    former_S: former_S,
    former_shore: former_shore,
    no_conflict: function(deep) {
      root.S = this.former_S;
      if (deep) {
        root.shore = this.former_shore;
      }
      return this;
    },
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
      return utility.memoize(function() {
        var _ctor, _ref, _result, args;
        args = __slice.call(arguments, 0);
        return (function() {
          var ctor = function(){};
          __extends(ctor, _ctor = cls);
          return typeof (_result = _ctor.apply(_ref = new ctor, args)) === "object" ? _result : _ref;
        }).call(this);
      });
    },
    _significance: function(x) {
      return x in shore._significances ? this._significances[x] : x;
    },
    _signified: function(significance, f) {
      f.significance = (shore._significance(significance));
      return f;
    },
    canonization: function(significance, name, f) {
      return shore._signified(significance, utility.memoize(f));
    },
    _significances: {
      minor: 0,
      moderate: 1,
      major: 2
    },
    canonize: function(object) {
      var arguments, f;
      arguments = __slice.call(arguments, 1);
      f = function(object) {
        arguments = __slice.call(arguments, 1);
        return object.is_shore_thing ? object.canonize.apply(object, arguments) : object;
      };
      return utility.call_in.apply(utility, [object, f].concat(arguments));
    },
    substitute: function(within, original, replacement) {
      var f;
      f = function(object, original, replacement) {
        return object.is_shore_thing ? (object.is(original) ? replacement : object.provider(shore.substitute(object.comps, original, replacement))) : object;
      };
      return utility.call_in(within, f, original, replacement);
    },
    is: function(a, b) {
      var _i, _ref, index, key;
      if (utility.is_object(a)) {
        if (!utility.is_object(b)) {
          return false;
        }
        _ref = a;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          _i = _ref[key];
          if (!(key in b)) {
            return false;
          }
        }
        _ref = b;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          _i = _ref[key];
          if (!(key in a)) {
            return false;
          }
        }
        _ref = a;
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          _i = _ref[key];
          if (!shore.is(a[key], b[key])) {
            return false;
          }
        }
        return true;
      } else if (utility.is_array(a)) {
        if (!utility.is_array(b)) {
          return false;
        }
        if (a.length !== b.length) {
          return false;
        }
        _ref = a;
        for (index in _ref) {
          if (!__hasProp.call(_ref, index)) continue;
          _i = _ref[index];
          if (!shore.is(a[index], b[index])) {
            return false;
          }
        }
        return true;
      } else {
        if (((typeof a === "undefined" || a === null) ? undefined : a.type) !== ((typeof b === "undefined" || b === null) ? undefined : b.type)) {
          return false;
        }
        return a.is_shore_thing ? a.is(b) : a === b;
      }
    }
  };
  utility.extend(shore, __not_types);
  sss = utility.sss;
  __types = {
    Thing: (function() {
      Thing = function(_arg) {
        var _i, _len, _ref, _ref2, name;
        this.comps = _arg;
        _ref = this.req_comps;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          if (!(typeof (_ref2 = this.comps[name]) !== "undefined" && _ref2 !== null)) {
            throw new Error("" + ((typeof (_ref2 = this.name) !== "undefined" && _ref2 !== null) ? _ref2 : this.constructor) + " object requires value for " + (name));
          }
        }
        return this;
      };
      Thing.prototype.is_shore_thing = true;
      Thing.prototype.precedence = 0;
      Thing.prototype.req_comps = [];
      Thing.prototype.is = function(other) {
        return this.type === ((typeof other === "undefined" || other === null) ? undefined : other.type) && shore.is(this.comps, other.comps);
      };
      Thing.prototype.__hash__ = function() {
        return this.name + ":" + utility.hash(this.comps);
      };
      Thing.prototype.canonize = function(limit, enough) {
        var _ref, _ref2, next, result, significance, value;
        limit = shore._significance(limit);
        enough = shore._significance(enough);
        result = this;
        while (true) {
          next = result.next_canonization();
          if (!next.length) {
            break;
          }
          _ref = next;
          _ref2 = _ref[0];
          significance = _ref2.significance;
          value = _ref[1];
          if ((typeof limit !== "undefined" && limit !== null) && significance > limit) {
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
        var _i, _len, _ref, _result, canonization, value;
        _result = []; _ref = this.canonizers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          canonization = _ref[_i];
          value = canonization.apply(this);
          if (value && !this.is(value)) {
            return [canonization, value];
          }
        }
        return _result;
      };
      Thing.prototype.to_tex = function(context) {
        var args;
        args = __slice.call(arguments, 1);
        context = (typeof context !== "undefined" && context !== null) ? context : 1;
        return this.precedence < context ? ("\\left(" + (this.to_free_tex.apply(this, args)) + "\\right)") : this.to_free_tex.apply(this, args);
      };
      Thing.prototype.to_string = function(context) {
        var args;
        args = __slice.call(arguments, 1);
        context = (typeof context !== "undefined" && context !== null) ? context : 0;
        return this.precedence < context ? ("(" + (this.to_free_string.apply(this, args)) + ")") : this.to_free_string.apply(this, args);
      };
      Thing.prototype.to_free_string = function() {
        return "(shore." + (this.type) + " value)";
      };
      Thing.prototype.to_free_tex = function() {
        return "\\text{(shore." + (this.type) + " value)}";
      };
      Thing.prototype.to_cs = function() {
        return "(shore." + (this.name.toLowerCase()) + " " + (this.comps) + ")";
      };
      Thing.prototype.toString = function() {
        return this.to_cs();
      };
      Thing.prototype._then = function(other) {
        return other.is_a_value ? this.times(other) : this.given(other);
      };
      Thing.prototype.given = function(substitution) {
        return shore.pending_substitution({
          expression: this,
          substitution: substitution
        });
      };
      return Thing;
    })(),
    Value: (function() {
      Value = function() {
        return Thing.apply(this, arguments);
      };
      __extends(Value, Thing);
      Value.prototype.known_constant = false;
      Value.prototype.is_a_value = true;
      Value.prototype.plus = function(other) {
        return shore.sum({
          operands: [this, other]
        });
      };
      Value.prototype.minus = function(other) {
        return shore.sum({
          operands: [this, other.neg()]
        });
      };
      Value.prototype.times = function(other) {
        return shore.product({
          operands: [this, other]
        });
      };
      Value.prototype.over = function(other) {
        return shore.product({
          operands: [this, other.to_the(shore(-1))]
        });
      };
      Value.prototype.pos = function() {
        return this;
      };
      Value.prototype.neg = function() {
        return (shore(-1)).times(this);
      };
      Value.prototype.to_the = function(other) {
        return shore.exponent({
          base: this,
          exponent: other
        });
      };
      Value.prototype.equals = function(other) {
        return shore.equality({
          operands: [this, other]
        });
      };
      Value.prototype.integrate = function(variable) {
        return shore.integral({
          expression: this,
          variable: variable
        });
      };
      Value.prototype.differentiate = function(variable) {
        return shore.derivative({
          expression: this,
          variable: variable
        });
      };
      Value.prototype.plus_minus = function(other) {
        return shore.with_margin_of_error({
          value: this,
          margin: other
        });
      };
      return Value;
    })(),
    Number: (function() {
      Number = function() {
        return Value.apply(this, arguments);
      };
      __extends(Number, Value);
      Number.prototype.known_constant = true;
      Number.prototype.precedence = 10;
      Number.prototype.req_comps = sss("value");
      Number.prototype.neg = function() {
        return shore.number({
          value: -this.comps.value
        });
      };
      Number.prototype.to_free_tex = function() {
        return String(this.comps.value);
      };
      Number.prototype.to_free_string = function() {
        return String(this.comps.value);
      };
      return Number;
    })(),
    Identifier: (function() {
      Identifier = function(comps) {
        var _ref, tex_value, value;
        _ref = comps;
        tex_value = _ref.tex_value;
        value = _ref.value;
        if (!(typeof tex_value !== "undefined" && tex_value !== null)) {
          if (value in shore._special_identifiers) {
            _ref = shore._special_identifiers[value];
            value = _ref[0];
            tex_value = _ref[1];
          } else {
            tex_value = value;
          }
        }
        Identifier.__super__.constructor.call(this, {
          tex_value: tex_value,
          value: value
        });
        return this;
      };
      __extends(Identifier, Value);
      Identifier.prototype.precedence = 10;
      Identifier.prototype.req_comps = sss("value tex_value");
      Identifier.prototype.to_free_tex = function() {
        return this.comps.tex_value;
      };
      Identifier.prototype.to_free_string = function() {
        return this.comps.value;
      };
      Identifier.prototype.sub = function(other) {
        var string, tex;
        string = ("" + (this.comps.value) + "_" + (other.to_string()));
        tex = ("{" + (this.comps.tex_value) + "}_{" + (other.to_tex()) + "}");
        return shore.identifier({
          value: string,
          tex_value: tex
        });
      };
      return Identifier;
    })(),
    CANOperation: (function() {
      CANOperation = function() {
        return Value.apply(this, arguments);
      };
      __extends(CANOperation, Value);
      CANOperation.prototype.req_comps = sss("operands");
      CANOperation.prototype.to_free_tex = function(symbol) {
        var _i, _len, _ref, _result, operand;
        symbol = (typeof symbol !== "undefined" && symbol !== null) ? symbol : this.tex_symbol;
        return (function() {
          _result = []; _ref = this.comps.operands;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(symbol);
      };
      CANOperation.prototype.to_free_string = function(symbol) {
        var _i, _len, _ref, _result, operand;
        symbol = (typeof symbol !== "undefined" && symbol !== null) ? symbol : this.string_symbol;
        return (function() {
          _result = []; _ref = this.comps.operands;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_string(this.precedence));
          }
          return _result;
        }).call(this).join(symbol);
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
        var _i, _len, _ref, _result, operand;
        "Without checking for negative powers.";
        return operands.length > 1 && operands[0].type === shore.Number && operands[1].type !== shore.Number ? (operands[0].comps.value !== -1 ? operands[0].to_tex(this.precedence) : "-") + ((function() {
          _result = []; _ref = operands.slice(1);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol)) : ((function() {
          _result = []; _ref = operands;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_tex(this.precedence));
          }
          return _result;
        }).call(this).join(this.tex_symbol));
      };
      Product.prototype.to_free_tex = function() {
        var _i, _len, _ref, bottom, exponent, negative_exponents, positive_exponents, term, top;
        positive_exponents = [];
        negative_exponents = [];
        _ref = this.comps.operands;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          term = _ref[_i];
          if (term.type === shore.Exponent) {
            exponent = term.comps.exponent;
            if (exponent.type === shore.Number && exponent.comps.value < 0) {
              negative_exponents.push(shore.exponent({
                base: term.comps.base,
                exponent: exponent.neg()
              }));
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
      Product.prototype.to_free_string = function() {
        var _i, _len, _ref, _result, operand;
        return (function() {
          _result = []; _ref = this.comps.operands;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            operand = _ref[_i];
            _result.push(operand.to_string(20));
          }
          return _result;
        }).call(this).join("");
      };
      return Product;
    })(),
    Exponent: (function() {
      Exponent = function() {
        return Value.apply(this, arguments);
      };
      __extends(Exponent, Value);
      Exponent.prototype.precedence = 5;
      Exponent.prototype.req_comps = sss("base exponent");
      Exponent.prototype.to_free_tex = function() {
        return this.comps.exponent.type === shore.Number && this.comps.exponent.comps.value === 1 ? this.comps.base.to_tex(this.precedence) : ("{" + (this.comps.base.to_tex(this.precedence)) + "}^{" + (this.comps.exponent.to_tex()) + "}");
      };
      Exponent.prototype.to_free_string = function() {
        return this.comps.exponent.type === shore.Number && this.comps.exponent.comps.value === 1 ? this.comps.base.to_string(this.precedence) : ("" + (this.comps.base.to_string(this.precedence)) + "^" + (this.comps.exponent.to_string()));
      };
      return Exponent;
    })(),
    Integral: (function() {
      Integral = function() {
        return Value.apply(this, arguments);
      };
      __extends(Integral, Value);
      Integral.prototype.precedence = 3;
      Integral.prototype.req_comps = sss("variable expression");
      Integral.prototype.to_free_tex = function() {
        return "\\int\\left[" + (this.comps.expression.to_tex()) + "\\right]d" + (this.comps.variable.to_tex());
      };
      Integral.prototype.to_free_string = function() {
        return "int{[" + (this.comps.expression.to_string()) + "]d" + (this.comps.variable.to_string()) + "}";
      };
      return Integral;
    })(),
    Derivative: (function() {
      Derivative = function() {
        return Value.apply(this, arguments);
      };
      __extends(Derivative, Value);
      Derivative.prototype.precedence = 3;
      Derivative.prototype.req_comps = sss("variable expression");
      Derivative.prototype.to_free_tex = function() {
        return "\\tfrac{d}{d" + (this.comps.variable.to_tex()) + "}\\left[" + (this.comps.expression.to_tex()) + "\\right]";
      };
      Derivative.prototype.to_free_string = function() {
        return "d/d" + (this.comps.variable.to_string()) + "[" + (this.comps.expression.to_string()) + "]";
      };
      return Derivative;
    })(),
    WithMarginOfError: (function() {
      WithMarginOfError = function() {
        return Value.apply(this, arguments);
      };
      __extends(WithMarginOfError, Value);
      WithMarginOfError.prototype.precedence = 1.5;
      WithMarginOfError.prototype.tex_symbol = " \\pm ";
      WithMarginOfError.prototype.string_symbol = " ± ";
      WithMarginOfError.prototype.to_free_string = function() {
        return !this.margin.is(shore(0)) ? ("" + (this.comps.value.to_string(this.precedence)) + "\
				 " + (this.string_symbol) + "\
				 " + (this.comps.margin.to_string(this.precedence))) : this.comps.value.to_string(this.precedence);
      };
      WithMarginOfError.prototype.to_free_tex = function() {
        return !this.margin.is(shore(0)) ? ("" + (this.comps.value.to_tex(this.precedence)) + "\
				 " + (this.tex_symbol) + "\
				 " + (this.comps.margin.to_tex(this.precedence))) : this.comps.value.to_tex(this.precedence);
      };
      return WithMarginOfError;
    })(),
    Matrix: (function() {
      Matrix = function() {
        return Value.apply(this, arguments);
      };
      __extends(Matrix, Value);
      Matrix.prototype.req_comps = sss("values");
      Matrix.prototype.to_free_tex = function() {
        var _i, _j, _len, _len2, _ref, _ref2, _result, _result2, row, v;
        return "\\begin{matrix}\
			" + ((function() {
          _result = []; _ref = this.comps.values;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            row = _ref[_i];
            _result.push((function() {
              _result2 = []; _ref2 = row;
              for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                v = _ref2[_j];
                _result2.push(v.to_tex());
              }
              return _result2;
            })().join('&'));
          }
          return _result;
        }).call(this).join(' \\\\\n')) + "\
			\\end{matrix}";
      };
      return Matrix;
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
      PendingSubstitution = function(comps) {
        this.is_a_value = comps.expression.is_a_value;
        PendingSubstitution.__super__.constructor.call(this, comps);
        return this;
      };
      __extends(PendingSubstitution, Thing);
      PendingSubstitution.prototype.precedence = 2.5;
      PendingSubstitution.prototype.req_comps = sss("expression substitution");
      PendingSubstitution.prototype.string_symbol = "";
      PendingSubstitution.prototype.tex_symbol = "";
      PendingSubstitution.prototype.to_free_string = function() {
        return (this.comps.expression.to_string(this.precedence)) + this.string_symbol + (this.comps.substitution.to_string(this.precedence));
      };
      PendingSubstitution.prototype.to_free_tex = function() {
        return (this.comps.expression.to_tex(this.precedence)) + this.tex_symbol + (this.comps.substitution.to_tex(this.precedence));
      };
      return PendingSubstitution;
    })(),
    System: (function() {
      System = function() {
        return Thing.apply(this, arguments);
      };
      __extends(System, Thing);
      System.prototype.precedence = 1000;
      System.prototype.req_comps = sss("equations");
      System.prototype.to_free_string = function() {
        var _i, _len, _ref, _result, eq;
        return (function() {
          _result = []; _ref = this.comps.equations;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            eq = _ref[_i];
            _result.push(eq.to_string);
          }
          return _result;
        }).call(this).join("\n");
      };
      System.prototype.to_free_tex = function() {
        var _i, _len, _ref, _result, eq;
        return (function() {
          _result = []; _ref = this.comps.equations;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            eq = _ref[_i];
            _result.push(eq.to_tex(0, "&="));
          }
          return _result;
        }).call(this).join(" \\\\\n");
      };
      return System;
    })()
  };
  _ref = __types;
  for (name in _ref) {
    if (!__hasProp.call(_ref, name)) continue;
    type = _ref[name];
    type.prototype.type = type;
    type.prototype.name = name;
  }
  utility.extend(shore, __types);
  utility.make_providers(shore);
  def = function() {
    var args;
    args = __slice.call(arguments, 0);
    return args;
  };
  canonization = shore.canonization;
  __definers_of_canonizers = [
    def("Thing", function() {
      var _i, _j, _ref2, _result, significance;
      _result = []; _ref2 = shore._significances;
      for (_j in _ref2) {
        if (!__hasProp.call(_ref2, _j)) continue;
        (function() {
          var significance = _j;
          var _i = _ref2[_j];
          return _result.push(canonization(significance, "components " + (significance), function() {
            return this.provider(shore.canonize(this.comps, significance, significance));
          }));
        })();
      }
      return _result;
    }), def("CANOperation", function() {
      return this.__super__.canonizers.concat([
        canonization("minor", "single argument", function() {
          if (this.comps.operands.length === 1) {
            return this.comps.operands[0];
          }
        }), canonization("minor", "no arguments", function() {
          if (this.comps.operands.length === 0 && this.get_nullary) {
            return this.get_nullary();
          }
        }), canonization("minor", "commutativity", function() {
          var _i, _j, _len, _len2, _ref2, _ref3, can_expand, new_operands, operand, suboperand;
          can_expand = false;
          _ref2 = this.comps.operands;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            if (this.type === operand.type) {
              can_expand = true;
              break;
            }
          }
          if (can_expand) {
            new_operands = [];
            _ref2 = this.comps.operands;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              operand = _ref2[_i];
              if (this.type === operand.type) {
                _ref3 = operand.comps.operands;
                for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
                  suboperand = _ref3[_j];
                  new_operands.push(suboperand);
                }
              } else {
                new_operands.push(operand);
              }
            }
            return this.provider({
              operands: new_operands
            });
          }
        }), canonization("major", "remove redundant nullaries", function() {
          return null;
        })
      ]);
    }), def("Sum", function() {
      return this.__super__.canonizers.concat([
        canonization("major", "numbers in sum", function() {
          var _i, _len, _ref2, not_numbers, numbers, operand, sum;
          numbers = [];
          not_numbers = [];
          _ref2 = this.comps.operands;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            if (operand.type === shore.Number) {
              numbers.push(operand);
            } else {
              not_numbers.push(operand);
            }
          }
          if (numbers.length > 1) {
            sum = this.get_nullary().comps.value;
            while (numbers.length) {
              sum += numbers.pop().comps.value;
            }
            return this.provider({
              operands: [
                shore.number({
                  value: sum
                })
              ].concat(not_numbers)
            });
          }
        })
      ]);
    }), def("Product", function() {
      return this.__super__.canonizers.concat([
        canonization("major", "numbers in product", function() {
          var _i, _len, _ref2, not_numbers, numbers, operand, product;
          numbers = [];
          not_numbers = [];
          _ref2 = this.comps.operands;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            operand = _ref2[_i];
            if (operand.type === shore.Number) {
              numbers.push(operand);
            } else {
              not_numbers.push(operand);
            }
          }
          if (numbers.length > 1) {
            product = this.get_nullary().comps.value;
            while (numbers.length) {
              product *= numbers.pop().comps.value;
            }
            return this.provider({
              operands: [
                shore.number({
                  value: product
                })
              ].concat(not_numbers)
            });
          }
        })
      ]);
    }), def("Exponent", function() {
      return this.__super__.canonizers.concat([
        canonization("minor", "eliminate power of one", function() {
          return this.comps.exponent.is(shore(1)) ? this.comps.base : null;
        }), canonization("major", "exponent of numbers", function() {
          var x;
          if ((this.comps.base.type === this.comps.exponent.type) && (this.comps.exponent.type === shore.Number)) {
            x = Math.pow(this.comps.base.comps.value, this.comps.exponent.comps.value);
            return shore.number({
              value: x
            });
          }
        })
      ]);
    }), def("Integral", function() {
      return this.__super__.canonizers.concat([
        canonization("major", "integration over constant", function() {
          return this.comps.variable.known_constant ? shore(0) : null;
        }), canonization("major", "integration of constant", function() {
          return this.comps.expression.known_constant ? this.comps.expression.times(this.comps.variable) : null;
        }), canonization("moderate", "rule of sums", function() {
          var _i, _len, _ref2, _result, term;
          return this.comps.expression.type === shore.Sum ? shore.sum({
            operands: (function() {
              _result = []; _ref2 = this.comps.expression.comps.operands;
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                term = _ref2[_i];
                _result.push(shore.integral({
                  variable: this.comps.variable,
                  expression: term
                }));
              }
              return _result;
            }).call(this)
          }) : null;
        }), canonization("moderate", "constant coefficient", function() {
          var coefficient, terms;
          if (this.comps.expression.type === shore.Product) {
            terms = this.comps.expression.comps.operands;
            coefficient = terms[0];
            return coefficient.known_constant ? coefficient.times(shore.integral({
              variable: this.comps.variable,
              expression: shore.product({
                operands: terms.slice(1, terms.length)
              })
            })) : null;
          }
        }), canonization("major", "integration over self", function() {
          return this.comps.expression.is(this.comps.variable) ? this.comps.expression.to_the(shore(2)).over(shore(2)) : null;
        }), canonization("major", "power rule", function() {
          var _ref2, base, exponent, new_exponent;
          if (this.comps.expression.type === shore.Exponent) {
            _ref2 = this.comps.expression.comps;
            base = _ref2.base;
            exponent = _ref2.exponent;
            new_exponent = exponent.plus(shore(1));
            return base.is(this.comps.variable) ? base.to_the(exponent.minus(new_exponent)).over(new_exponent) : null;
          }
        })
      ]);
    }), def("Derivative", function() {
      return this.__super__.canonizers.concat([
        canonization("moderate", "differentiation over self", function() {
          return this.comps.variable.is(this.comps.expression) ? shore(1) : null;
        }), canonization("moderate", "differentiation over constant", function() {
          return this.comps.variable.known_constant ? shore(0) : null;
        }), canonization("moderate", "differentiation of constant", function() {
          return this.comps.expression.known_constant ? shore(0) : null;
        }), canonization("moderate", "rule of sums", function() {
          var _i, _len, _ref2, _result, term;
          return this.comps.expression.type === shore.Sum ? shore.sum({
            operands: (function() {
              _result = []; _ref2 = this.comps.expression.comps.operands;
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                term = _ref2[_i];
                _result.push(shore.derivative({
                  variable: this.comps.variable,
                  expression: term
                }));
              }
              return _result;
            }).call(this)
          }) : null;
        }), canonization("major", "constant coefficient", function() {
          var coefficient, terms;
          if (this.comps.expression.type === shore.Product) {
            terms = this.comps.expression.comps.operands;
            coefficient = terms[0];
            return coefficient.known_constant ? coefficient.times(shore.derivative({
              variable: this.comps.variable,
              expression: shore.product({
                operands: terms.slice(1, terms.length)
              })
            })) : null;
          }
        }), canonization("major", "power rule", function() {
          var _ref2, base, exponent;
          if (this.comps.expression.type === shore.Exponent) {
            _ref2 = this.comps.expression.comps;
            base = _ref2.base;
            exponent = _ref2.exponent;
            return base.is(this.comps.variable) ? exponent.times(base).to_the(exponent.minus(shore(1))) : null;
          }
        })
      ]);
    }), def("PendingSubstitution", function() {
      return this.__super__.canonizers.concat([
        canonization("major", "substitute", function() {
          var _ref2, original, replacement;
          _ref2 = this.comps.substitution.comps.operands;
          original = _ref2[0];
          replacement = _ref2[1];
          return shore.substitute(this.comps.expression, original, replacement);
        })
      ]);
    })
  ];
  _ref = __definers_of_canonizers;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    definition = _ref[_i];
    _ref2 = definition;
    name = _ref2[0];
    definer = _ref2[1];
    shore[name].prototype.canonizers = definer.apply(shore[name]);
  }
}).call(this);
