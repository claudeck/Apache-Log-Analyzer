// mocha --reporter dot --require should .\test\services\utils.js

var Utils = require('../../services/utils');

describe('Test Utils', function(){
  
  describe('.parseApacheTime', function(){
    it('should parse success', function(){
      Utils.parseApacheTime('13/Dec/2011:00:00:22 -0800')
        .should.equal(new Date(2011, 11, 13, 0, 0, 22));
    });
  });

  describe('Invoke .parse', function(){
    it('shoule be success', function(){
      Utils.parse('13/Dec/2011:00:00:22 -0800', 'dd/MMM/yyyy:HH:mm:ss ')
        .should.equal(new Date(2011, 11, 13, 0, 0, 22));
    });
  });

});