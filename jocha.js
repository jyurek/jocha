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
    if(!one.isEqual(two)) return false;
  } else {
    if(one != two) return false;
  }
}

Object.prototype.attributes = function(){
  var attributes = [];
  for(var p in this){ attributes.push(p); }
  return attributes;
}

Jocha = {
  mocks: []
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
		expectation = new Jocha.Expectation(functionName);
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
		expectation = this.mock.expectations.find(function(e){
		  return e.functionName == functionName && e.params.isEqual($A(args))
		});
		if (expectation) {
			expectation.invoked = true;
			return expectation.returnVal;
		}
	}
});