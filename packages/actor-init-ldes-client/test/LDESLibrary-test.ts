import { newEngine } from '@treecg/actor-init-ldes-client';
import { OutputRepresentation } from '../lib/EventStream';
import {DataFactory} from "n3";
import namedNode = DataFactory.namedNode;
const server = require('./examples/server');

describe('LDESClient as a lib', () => {
    const url = "https://semiceu.github.io/LinkedDataEventStreams/example.ttl";
    const LDESClient = newEngine();

    test('Test LDES client in as a stream in paused mode', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options)

        stream.once('readable', () => {
            const data = stream.read();
            expect(data).toBeDefined();
            done();
        });
    });

    test('Test LDES client in as a stream in flow mode', (done) => {
        const options = {
            mimeType: "text/turtle",
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options)

        stream.once('data', (data) => {
            expect(data).toBeDefined();
            stream.destroy();
        }).on('close', done);
    });

    test('Stream should emit quads when configured that way', (done) => {
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true
        };

        const stream = LDESClient.createReadStream(url, options);
        stream.once('data', (member) => {
            expect(member.quads).toBeInstanceOf(Array);
            stream.destroy();
        }).on('close', done);
    });

    test('Stream should emit Object when configured with Object', (done) => {
        const options = {
            representation: OutputRepresentation.Object,
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);
        stream.once('data', (member) => {
            expect(member.object).toBeInstanceOf(Object);
            stream.destroy();
        }).on('close', done);
    });

    test('The stream should end when done', (done) => {
        const options = {
            representation: OutputRepresentation.Object,
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);
        const data: any = [];

        stream.on("data", (member) => {
            data.push(member);
        }).on('end', () => {
            expect(data.length).toBeGreaterThan(0);
            done();
        });
    });

    test('Stream should emit metadata', (done) => {
        const options = {
            representation: OutputRepresentation.Object,
            disableSynchronization: true
        };
        const stream = LDESClient.createReadStream(url, options);
        stream.once('data', () => { });
        stream.once('metadata', (metadata) => {
            expect(metadata).toBeInstanceOf(Object);
        });
        stream.on('end', done);
    });

    test('Should disable framing with representation \'Object\'', (done) => {
        const ldes = 'https://brechtvdv.github.io/demo-data/example.ttl';
        const options = {
            representation: OutputRepresentation.Object,
            disableFraming: true,
        };
        const stream = LDESClient.createReadStream(ldes, options);

        stream.once('data', (data) => {
            const result = data.object;
            // member has a versionOf property
            const members = result.filter((r: any) => r["http://purl.org/dc/terms/isVersionOf"]);
            const test = members[0]['http://purl.org/dc/terms/isVersionOf'][0]['@id'];
            // Without framing, subjects have a separate entry
            // There should be an entry for the non-versioned object
            expect((result.filter((r: any) => r["@id"] === test)).length).toEqual(1);
            stream.destroy();
        }).on('close', done);
    });

    test('multiple references between same subject and object with different predicates should be returned as quads', (done) => {
        const url = 'http://localhost:3000/examples?fileName=multiple-references-between-subject-and-object-with-different-predicates-example.jsonld'
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true,
            loggingLevel: 'debug',
        };

        let members: any[] = [];
        const stream = LDESClient.createReadStream(url, options);
        stream.on('data', (member) => {
            expect(member.quads).toBeInstanceOf(Array);
            members.push(member);
        }).on('close', () => {
            const member = members[0];
            expect(member.id.value).toEqual('http://data.lblod.info/id/public-service-snapshot/6e9334cb-272c-443d-8b0a-1b02149a5126');
            expect(member.quads.length).toEqual(11);
            done();
        });
    });

    test('multiple members with complex structure', (done) => {
        const url = 'http://localhost:3000/examples?fileName=multiple-members-with-complex-structure.jsonld'
        const options = {
            representation: OutputRepresentation.Quads,
            disableSynchronization: true,
            loggingLevel: 'trace',
        };

        let members: any[] = [];
        const stream = LDESClient.createReadStream(url, options);
        stream.on('data', (member) => {
            members.push(member);
        }).on('close', () => {
            expect(members.length).toEqual(6);
            const member0 = members[0];
            expect(member0.id.value).toEqual('http://data.lblod.info/id/public-service-snapshot/6e9334cb-272c-443d-8b0a-1b02149a5127');
            expect(member0.quads.length).toEqual(202);

            const member1 = members[1];
            expect(member1.id.value).toEqual('http://data.lblod.info/id/public-service-snapshot/a62cee64-9086-4864-9be9-1f72798a8c72');
            expect(member1.quads.length).toEqual(12);

            const member2 = members[2];
            expect(member2.id.value).toEqual('http://data.lblod.info/id/public-service-snapshot/f9aceb0a-5225-4b0c-be55-e14a2954347a');
            expect(member2.quads.length).toEqual(12);

            const member3 = members[3];
            expect(member3.id.value).toEqual('http://data.lblod.info/id/public-service-snapshot/6e9334cb-272c-443d-8b0a-1b02149a5127q');
            expect(member3.quads.length).toEqual(202);

            const member4 = members[4];
            expect(member4.id.value).toEqual('http://data.lblod.info/id/public-service-snapshot/a62cee64-9086-4864-9be9-1f72798a8c72d');
            expect(member4.quads.length).toEqual(12);

            const member5 = members[5];
            expect(member5.id.value).toEqual('http://data.lblod.info/id/public-service-snapshot/f9aceb0a-5225-4b0c-be55-e14a2954347af');
            expect(member5.quads.length).toEqual(12);


            done();
        });
    });

    afterAll(() => {
        server.close(); // Ensure the server is closed after tests
    });

});
