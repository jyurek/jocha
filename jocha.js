Jocha = {
  mocks : [],
  verifyAll : function(){ 
    this.mocks.each(function(m){ 
      assert( m.expectations.all(function(e){
        return e.invoked;
      }), "Not all expectations were met." );
    });
  },
  reset: function(){
    this.mocks = [];
  }
}

Jocha.Mock = Class.create();
Jocha.Mock.prototype = {
	initialize : function() {
		this.expectations = new Array();
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
	  var expectation = null;
	  for(var i=0; i < this.mock.expectations.length; i++)
	  {
	    var e = this.mock.expectations[i];
	    if(e.functionName == functionName && e.params.isEqual($A(args)))
	    {
	      expectation = e;
	      break;
	    }
	  }
		if (expectation) {
			expectation.invoked = true;
			return expectation.returnVal;
		} else {
		  var st = null;
		  
		  if(stackTrace){ st = stackTrace(); }
		  else{ try{ throw new Error() } catch(e) { st = e.stack } }
		  
		  throw new Jocha.FailedExpectation(functionName + " was called with the wrong arguments.", st);
		}
	}
});

if(typeof(assert) == "undefined") {
  function assert(bool, message) {
    throw new Jocha.FailedExpectation(message);
  }
}

// HELPERS

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
    return( one != two );
  }
}

Object.prototype.attributes = function(){
  var attributes = [];
  for(var p in this){ attributes.push(p); }
  return attributes;
}