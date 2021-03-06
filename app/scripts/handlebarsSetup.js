Handlebars.registerHelper("x", function (expression, options) {
  var fn = function(){}, result;

  // in a try block in case the expression have invalid javascript
  try {
    // create a new function using Function.apply, notice the capital F in Function
    fn = Function.apply(
      this,
      [
        'window', // or add more '_this, window, a, b' you can add more params if you have references for them when you call fn(window, a, b, c);
        'return ' + expression + ';' // edit that if you know what you're doing
      ]
    );
  } catch (e) {
    console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
  }

  // then let's execute this new function, and pass it window, like we promised
  // so you can actually use window in your expression
  // i.e expression ==> 'window.config.userLimit + 10 - 5 + 2 - user.count' //
  // or whatever
  try {
    // if you have created the function with more params
    // that would like fn(window, a, b, c)
    result = fn.call(this, window);
  } catch (e) {
    console.warn('[warning] {{x ' + expression + '}} runtime error', e);
  }
  // return the output of that result, or undefined if some error occured
  return result;
});

Handlebars.registerHelper("xif", function (expression, options) {
    return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('shortenFirstString', function(passedArray) {
   var passedString = passedArray[0];
   if(passedString!=null && passedString.length>60){
      var theString = passedString.substring(0,60)+"[...]";
      return new Handlebars.SafeString(theString)
   }
   return passedString;
});

Handlebars.registerHelper('stringify', function(elem) {
  return JSON.stringify(elem);
});
Handlebars.registerHelper('classForImpact', function(impact) {
   if (impact == 'critical'){
      return 'danger';
   } else if(this.impact == 'serious'){
      return 'warning';
   } else if(this.impact == null){
    return 'success';
   }

   return 'info';
});


Handlebars.registerPartial("relatedNodes", document.getElementById('relatedNodes-partial').innerHTML);