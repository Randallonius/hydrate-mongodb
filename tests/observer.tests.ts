import {assert} from "chai";
import * as helpers from "./helpers";
import * as model from "./fixtures/model";
import {Observer} from "../src/observer";
import {ObjectIdGenerator} from "../src/config/objectIdGenerator";

describe.skip('Observer', () => {

    it('will call the specified callback if a watched objects change', (done) => {

        var called = 0;
        var observer = new Observer(() => {
            called++;
        });

        var obj: any = {
            name: "Bob"
        };

        observer.watch(obj);
        obj.name = "Joe";

        setTimeout(() => {
            assert.equal(called, 1, "Callback was not called");
            done();
        }, 0);
    });

    it('will call the specified callback if a watched array change in size', (done) => {

        var called = 0;
        var observer = new Observer(() => {
            called++;
        });

        var list: any[] = [];

        observer.watch(list);
        list.push("test");

        setTimeout(() => {
            assert.equal(called, 1, "Callback was not called");
            done();
        }, 0);
    });

    it('will call the specified callback if a watched array has a changed value', (done) => {

        var called = 0;
        var observer = new Observer(() => {
            called++;
        });

        var list: any[] = [ "test" ];

        observer.watch(list);
        list[0] = "a";

        setTimeout(() => {
            assert.equal(called, 1, "Callback was not called");
            done();
        }, 0);
    });

    it('stops watching the object after the object changes', (done) => {

        var called = 0;
        var observer = new Observer(() => {
            called++;
        });

        var obj: any = {
            name: "Bob"
        }

        observer.watch(obj);
        obj.name = "Joe";

        setTimeout(() => {
            assert.equal(called, 1, "Callback was not called");

            obj.name = "Jack";

            setTimeout(() => {
                assert.equal(called, 1, "Observer did not stop watching the object after the first change");
                done();
            }, 0);
        }, 0);
    });

    it('ignores change if reference is updated to equivalent entity', (done) => {

        helpers.createFactory("model", (err, factory) => {
            if(err) return done(err);

            var session = factory.createSession();

            var called = 0;
            var observer = new Observer(() => {
                called++;
            });

            var generator = new ObjectIdGenerator();
            var id = generator.generate();
            var ref = session.getReference(model.Person, id);

            var obj: any = {
                parent: ref
            }
            observer.watch(obj);

            obj.parent = {
                _id: id
            }

            setTimeout(() => {
                assert.equal(called, 0, "Callback should not have been called.");
                done();
            }, 0);
        });
    });

    it('does not ignore change if reference is updated to a non-equivalent entity', (done) => {

        helpers.createFactory("model", (err, factory) => {
            if(err) return done(err);

            var session = factory.createSession();

            var called = 0;
            var observer = new Observer(() => {
                called++;
            });

            var generator = new ObjectIdGenerator();
            var id = generator.generate();
            var ref = session.getReference(model.Person, id);

            var obj: any = {
                parent: ref
            }
            observer.watch(obj);

            obj.parent = {
                _id: generator.generate()
            }

            setTimeout(() => {
                assert.equal(called, 1, "Callback was not called");
                done();
            }, 0);
        });
    });

});