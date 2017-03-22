var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function Promise(fn) {
    // store state which can be PENDING, FULFILLED or REJECTED
    var state = PENDING;

    // store value or error once FULFILLED or REJECTED
    var value = null;

    // store sucess & failure handlers attached by calling .then or .done
    var handlers = [];

    function fulfill(result) {
        console.log(result);
        state = FULFILLED;
        value = result;
        for(var i=0;i<handlers.length;i++){
            console.log(handlers[i])
            handlers[i].onFulfilled(result);
        }
    }

    function reject(error) {
        state = REJECTED;
        value = error;
        // for(var i=0;i<handlers.length;i++){
        //     handlers[i](result);
        // }
    }

    function resolve(result) {
        try {
            var then = getThen(result);
            if (then) {
                doResolve(then.bind(result), resolve, reject)
                return
            }
            fulfill(result);
        } catch (e) {
            reject(e);
        }
    }
    doResolve(fn, resolve, reject);

    function handle(handler) {
        if (state === PENDING) {
            handlers.push(handler);
        } else {
            if (state === FULFILLED &&
                typeof handler.onFulfilled === 'function') {
                handler.onFulfilled(value);
            }
            if (state === REJECTED &&
                typeof handler.onRejected === 'function') {
                handler.onRejected(value);
            }
        }
    }

    this.done = function(onFulfilled, onRejected) {
        // ensure we are always asynchronous
        setTimeout(function() {
            handle({
                onFulfilled: onFulfilled,
                onRejected: onRejected
            });
        }, 0);
    }

    this.then = function(onFulfilled, onRejected) {
        var self = this;
        return new Promise(function(resolve, reject) {
            return self.done(function(result) {
                if (typeof onFulfilled === 'function') {
                    try {
                        return resolve(onFulfilled(result));
                    } catch (ex) {
                        return reject(ex);
                    }
                } else {
                    return resolve(result);
                }
            }, function(error) {
                if (typeof onRejected === 'function') {
                    try {
                        return resolve(onRejected(error));
                    } catch (ex) {
                        return reject(ex);
                    }
                } else {
                    return reject(error);
                }
            });
        });
    }
}
/**
 * Check if a value is a Promise and, if it is,
 * return the `then` method of that promise.
 *
 * @param {Promise|Any} value
 * @return {Function|Null}
 */
function getThen(value) {
    var t = typeof value;
    if (value && (t === 'object' || t === 'function')) {
        var then = value.then;
        if (typeof then === 'function') {
            return then;
        }
    }
    return null;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 *
 * @param {Function} fn A resolver function that may not be trusted
 * @param {Function} onFulfilled
 * @param {Function} onRejected
 */
function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
        fn(function(value) {
            console.log(value);
            if (done) return
            done = true
            onFulfilled(value)
        }, function(reason) {
            if (done) return
            done = true
            onRejected(reason)
        })
    } catch (ex) {
        if (done) return
        done = true
        onRejected(ex)
    }
}


function async(value) {
    var pms = new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(value);;
        }, 1000);
    });
    return pms;
}
async(1).then(function(result) {
    console.log('the result is ', result); //the result is 2 
    return result;
})
console.log('同步');