define(function (require) {
  var Promise = require('bluebird');
  var _ = require('intern/dojo/node!lodash');
  var expect = require('intern/dojo/node!expect.js');

  const testPipeline = {
    processors: [{
      processor_id: 'processor1',
      type_id: 'convert',
      source_field: 'foo',
      type: 'integer'
    }],
    input: { foo: '1234' }
  };

  return function (bdd, scenarioManager, request) {
    bdd.describe('simulate - convert processor', () => {

      bdd.it('should return 400 for an invalid payload', () => {
        return Promise.all([
          // Convert processor requires targetField property
          request.post('/kibana/ingest/simulate')
          .send({
            input: {},
            processors: [{
              processor_id: 'processor1',
              type_id: 'convert',
              value: 'integer',
              source_field: 42
            }]
          })
          .expect(400)
        ]);
      });

      bdd.it('should return 200 for a valid simulate request', () => {
        return request.post('/kibana/ingest/simulate')
          .send(testPipeline)
          .expect(200);
      });

      bdd.it('should return a simulated output with the correct result for the given processor', function () {
        return request.post('/kibana/ingest/simulate')
          .send(testPipeline)
          .expect(200)
          .then(function (response) {
            expect(response.body[0].output.foo).to.be(1234);
          });
      });

      bdd.it('should enforce snake case', () => {
        return request.post('/kibana/ingest/simulate')
        .send({
          processors: [{
            processorId: 'processor1',
            typeId: 'convert',
            sourceField: 'foo',
            type: 'string'
          }],
          input: {}
        })
        .expect(400);
      });

    });
  };
});
