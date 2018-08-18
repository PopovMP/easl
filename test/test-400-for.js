"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('for loop', function () {
    it('for loop 1', function () {
        assert.strictEqual(easl.evaluate(`  
              {let m 0}

              {for (i m) (< i 3) (+ i 1)
                  {set! m i} }

               m                                        `), 2);
    });

    it('for loop 2', function () {
        assert.strictEqual(easl.evaluate(`
                {let m 0}

                {for (i 10) (<= i (* 5 20)) (+ i 5)
                    {set! m i} }

                m                                      `), 100);
    });

    it('for loop break', function () {
        assert.strictEqual(easl.evaluate(`
                {let m 0}

                {for (i 0) (< i 100) (+ i 1)
                    {if (= i 10)
                        break}
                    {set! m (+ m 1)} }

                m                                      `), 10);
    });

    it('for loop continue', function () {
        assert.strictEqual(easl.evaluate(`
                {let m 0}

                {for (i 0) (< i 100) (+ i 1)
                    {if (= (% i 2) 1)
                        continue}
                    {set! m (+ m 1)} }
                m                                      `), 50);
    });
});
