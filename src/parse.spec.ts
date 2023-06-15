import { ParseError, ParseFailureCode } from './ParseError';
import {parseConnectionString, splitHostAndPort, parseHost, parseAddress, parsePort, parsePubkey} from './parse';


describe('parse', () => {
    test('splitHostAndPort without []', async () => {
        const {notValidatedHost: host1, notValidatedPort: port1} = splitHostAndPort('127.0.0.1:300')
        expect(host1).toEqual('127.0.0.1')
        expect(port1).toEqual('300')

        const {notValidatedHost: host2, notValidatedPort: port2} = splitHostAndPort('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion:300')
        expect(host2).toEqual('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(port2).toEqual('300')
    });

    test('splitHostAndPort with []', async () => {
        const {notValidatedHost: host1, notValidatedPort: port1} = splitHostAndPort('[127.0.0.1]:300')
        expect(host1).toEqual('127.0.0.1')
        expect(port1).toEqual('300')

        const {notValidatedHost: host2, notValidatedPort: port2} = splitHostAndPort('[2001:db8:3333:4444:5555:6666:7777:8888]:300')
        expect(host2).toEqual('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(port2).toEqual('300')

        const {notValidatedHost: host3, notValidatedPort: port3} = splitHostAndPort('[gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion]:300')
        expect(host3).toEqual('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(port3).toEqual('300')
    });

    test('splitHostAndPort ipv6 without []', async () => {
        const {notValidatedHost: host1, notValidatedPort: port1} = splitHostAndPort('2001:db8:3333:4444:5555:6666:7777:8888:300')
        expect(host1).toEqual('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(port1).toEqual('300')

        const {notValidatedHost: host2, notValidatedPort: port2} = splitHostAndPort('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(host2).toEqual('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(port2).toBeUndefined()

        try {
            splitHostAndPort('2001:db8:3333:4444:5555::8888')
            expect(true).toEqual(false)
        } catch (e: any) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_IPV6)
        }
    });

    test('parseHost', async () => {
        const {host: host1, hostType: type1} = parseHost('127.0.0.1')
        expect(host1).toEqual('127.0.0.1')
        expect(type1).toEqual('ipv4')

        const {host: host2, hostType: type2} = parseHost('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(host2).toEqual('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(type2).toEqual('ipv6')

        const {host: host3, hostType: type3} = parseHost('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(host3).toEqual('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(type3).toEqual('torv3')

        const {host: host4, hostType: type4} = parseHost('swiss-reign.ch')
        expect(host4).toEqual('swiss-reign.ch')
        expect(type4).toEqual('domain')

        try {
            parseHost('127.0.0.1:')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_HOST)
        }
        try {
            parseHost('127.0.0.1:-1')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_HOST)
        }

        try {
            parseHost(undefined as any)
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_HOST)
        }
    });

    test('parseAddress', async () => {
        const {host: host1, hostType: type1, port: port1} = parseAddress('127.0.0.1:300')
        expect(host1).toEqual('127.0.0.1')
        expect(type1).toEqual('ipv4')
        expect(port1).toEqual(300)

        const {host: host2, hostType: type2, port: port2} = parseAddress('2001:db8:3333:4444:5555:6666:7777:8888:300')
        expect(host2).toEqual('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(type2).toEqual('ipv6')
        expect(port2).toEqual(300)
    });

    test('parsePort', async () => {
        expect(parsePort('300')).toEqual(300)
        expect(parsePort(undefined)).toEqual(undefined)
        expect(parsePort('65535')).toEqual(65535)

        try {
            parsePort('0')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_PORT)
        }

        try {
            parsePort('65536')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_PORT)
        }

        try {
            parsePort('-1')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_PORT)
        }
    });

    test('parsePubkey', async () => {
        expect(parsePubkey('0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f')).toEqual('0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f')
        expect(parsePubkey('0300000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f')).toEqual('0300000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f')

        try {
            parsePubkey('0300000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_PUBKEY)
        }

        try {
            parsePubkey('0300000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5fa')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_PUBKEY)
        }

        try {
            parsePubkey('0100000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5a')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_PUBKEY)
        }
    });

    test('parseConnectionString', async () => {
        const {host: host1, pubkey: pubkey1, port: port1} = parseConnectionString('0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f@127.0.0.1:9000')
        expect(host1).toEqual('127.0.0.1')
        expect(pubkey1).toEqual('0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f')
        expect(port1).toEqual(9000)

        try {
            parseConnectionString('0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f127.0.0.1:9000')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_ATS)
        }

        try {
            parseConnectionString('0200000000a3e@ff613189ca6c4070c89206ad658e286751eca1f29262948247a5f@127.0.0.1:9000')
            expect(true).toEqual(false)
        } catch (e) {
            if (!(e instanceof ParseError)) {
                throw e
            }
            expect(e.code).toEqual(ParseFailureCode.INVALID_ATS)
        }

        expect(() => parseConnectionString('@')).toThrow(ParseError)
        expect(() => parseConnectionString('0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f@')).toThrow(ParseError)

    });

});


