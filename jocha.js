Jocha = {
  mocks : [],
  verifyAll : function()
  { 
    this.mocks.each(function(m){ 
      var unmet = m.expectations.findAll(function(e){
        return !e.invoked;
      }).compact();
    
      var unmet_string = "Not all expectations were met:\n";
      unmet.each(function(e,i){
        unmet_string += (i+1) + ": " + e.functionName + "(" + e.params.map(Object.inspect) + ")\n";
      });
      
      assert(unmet.size() == 0, unmet_string);
    });
  },
  reset: function()
  {
    this.mocks = [];
  }
}

Jocha.Mock = Class.create();
Jocha.Mock.prototype = {
	initialize : function() {
		this.expectations = new Array();
	},
	getAllExpectationsNamed: function(name){
	  return this.expectations.findAll( function(e){
	    return e.functionName == name;
	  });
	}
}

Jocha.Expectation = Class.create();
Jocha.Expectation.prototype = {
	initialize : function(functionName) {
		this.functionName = functionName;
		this.params = [];
		this.invoked = false;
		this.return_val = "";
	},
	withParams : function() {
		this.params = $A(arguments);
		return this;
	},
	andReturns : function(returnVal) {
		this.returnVal = returnVal;
		return this;
	}
}

Jocha.FailedExpectation = Class.create();
Jocha.FailedExpectation.prototype = {
  initialize: function(message, stack) {
    this.message = message;
    this.stackTrace = stack || null;
    this.assertion = true;
  }
}

Object.extend(Object.prototype, {
	expects : function(functionName) {
		this[functionName] = function() {
			return this.methodMocked(functionName, arguments);
		};
		if (!this.mock) {
			this.mock = new Jocha.Mock();
			Jocha.mocks.push(this.mock);
	  }
		var expectation = new Jocha.Expectation(functionName);
		this.mock.expectations.push(expectation);
		return expectation;
	},		    
	verify : function() {
		if (this.mock.expectations.all(function(e){return e.invoked}))
			return true;
		else
			return false;
	},
	methodMocked : function(functionName, args) {
	  var expectation = this.mock.expectations.find( function(e){
	    return e.functionName == functionName && e.params.isEqual($A(args))
	  });
		if (expectation)
		{
			expectation.invoked = true;
			return expectation.returnVal;
		}
		else
		{
		  var st = null;
		  
		  if(stackTrace){ st = stackTrace(); }
		  else{ try{ throw new Error() } catch(e) { st = e.stack } }
		  
		  var expected = this.mock.getAllExpectationsNamed(functionName);
		  var message = functionName + " was called with the wrong arguments. Expected one of the following:\n";
		  expected.each(function(e, i){
		    message += (i+1) + ": " + e.params + "\n";
		  })
		  message += "But was called with:\n" + $A(args);
		  
		  throw new Jocha.FailedExpectation(message, st);
		}
	}
});

if(typeof(assert) == "undefined") {
  function assert(bool, message) {
    throw new Jocha.FailedExpectation(message);
  }
}

// HELPERS

Object.prototype.toString = function() {
  return "#<Object:{" + $H(this).map(function(pair) {
    return pair.map(Object.inspect).join(': ');
  }).join(', ') + '}>';
}

Function.prototype.inspect = function() {
  return "#<Function: " + this.toSource.replace(/\{.*\}/, "{...}") + " >";
}

// Thanks http://www.svendtofte.com/code/usefull_prototypes/
Array.prototype.isEqual = function(other) {
  if (this.length != other.length) return false;
  for (var p = 0; p < other.length; p++) {
    if(Object.equal( this[p], other[p] )) return false;
  }
  return true;
}

Object.prototype.isEqual = function(other) {
  if(this.attributes().length != other.attributes().length) return false;
  for(var p in this){
    if(Object.equal( this[p], other[p] )) return false;
  }
  return true;
}

Object.equal = function(one, two){
  if(typeof(one) == "object" && one != null && one.isEqual){
    return( one.isEqual(two) );
  } else {
    return( one == two );
  }
}

Object.prototype.attributes = function(){
  var attributes = [];
  for(var p in this){ attributes.push(p); }
  return attributes;
}