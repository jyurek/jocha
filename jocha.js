// Thanks http://www.svendtofte.com/code/usefull_prototypes/
Array.prototype.isEqual = function(arr) {
		if (this.length != arr.length) return false;
		for (var i = 0; i < arr.length; i++) {
				if (this[i].isEqual) { //likely nested array
						if (!this[i].isEqual(arr[i])) return false;
						else continue;
				}
				if (this[i] != arr[i]) return false;
		}
		return true;
}

Mock = Class.create();
Mock.prototype = {
	initialize : function() {
		this.expectations = new Array();
	}
}
Expectation = Class.create();
Expectation.prototype = {
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
		if (!this.mock)
			this.mock = new Mock();
		expectation = new Expectation(functionName);
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
		expectation = this.mock.expectations.find(function(e){return e.functionName == functionName && e.params.isEqual($A(args))});
		if (expectation) {
			expectation.invoked = true;
			return expectation.returnVal;
		}
	}
});