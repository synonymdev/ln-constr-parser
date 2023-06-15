import * as regex from './regex';

jest.setTimeout(60*1000)





describe('connectionString regex', () => {

    test('ipv4', async () => {
        const ipv4Regex = regex.ipv4Regex

        const match = ipv4Regex.exec('34.65.85.39')
        expect(match?.groups?.ipv4).toEqual('34.65.85.39')

        const match2 = ipv4Regex.exec('34.65.85.3a')
        expect(match2?.groups?.ipv4).toBeUndefined()

        const match3 = ipv4Regex.exec('34.65.85.333')
        expect(match3?.groups?.ipv4).toBeUndefined()
    });

    test('ipv6', async () => {
        const ipv6Regex = regex.ipv6Regex
        const match = ipv6Regex.exec('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(match?.groups?.ipv6).toEqual('2001:db8:3333:4444:5555:6666:7777:8888')

        const match2 = ipv6Regex.exec('2001:db8:3333:4444:5555:6666:7777:8888z')
        expect(match2?.groups?.ipv6).toBeUndefined()

        const match3 = ipv6Regex.exec('2001:db8:3333:4444:5555:6666:7777:888z')
        expect(match3?.groups?.ipv6).toBeUndefined()

        const match4 = ipv6Regex.exec('2001:db8:3333::8888')
        expect(match4!.groups!.ipv6).toEqual('2001:db8:3333::8888')

        const match5 = ipv6Regex.exec('2001:db8:3333:4444:5555:8888')
        expect(match5?.groups?.ipv6).toBeUndefined()
    });

    test('torv3', async () => {
        const torv3Regex = regex.torv3Regex
        const match = torv3Regex.exec('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(match?.groups?.torv3).toEqual('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')

        const match2 = torv3Regex.exec('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion$')
        expect(match2?.groups?.torv3).toBeUndefined()

        const match3 = torv3Regex.exec('wdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(match3?.groups?.torv3).toBeUndefined()

        const match5 = torv3Regex.exec('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqdonion')
        expect(match5?.groups?.torv3).toBeUndefined()
    });

    test('domainName', async () => {
        const domainRegex = regex.domainNameRegex
        const match1 = domainRegex.exec('swiss-reign.ch')
        expect(match1?.groups?.domain).toEqual('swiss-reign.ch')

        const match2 = domainRegex.exec('sub.swiss-reign.ch')
        expect(match2?.groups?.domain).toEqual('sub.swiss-reign.ch')

        const match3 = domainRegex.exec('.sub.swiss-reign.ch')
        expect(match3?.groups?.domain).toBeUndefined()

        const match4 = domainRegex.exec('localhost')
        expect(match4?.groups?.domain).toBeUndefined()

        const match5 = domainRegex.exec('myreallylongnamelongerthan64charactersmyreallylongnamelongerthan64charactersmyreallylongnamelongerthan64characters')
        expect(match5?.groups?.domain).toBeUndefined()

        const match6 = domainRegex.exec('sub.swiss-reign.ch-')
        expect(match6?.groups?.domain).toBeUndefined()

        const match7 = domainRegex.exec('127.0.0.1')
        expect(match7?.groups?.domain).toBeUndefined()
    });


    test('port', async () => {
        const portRegex = regex.portRegex
        const match = portRegex.exec('120')
        expect(match?.groups?.port).toEqual('120')

        const match2 = portRegex.exec('1200000')
        expect(match2?.groups?.port).toBeUndefined()

        const match3 = portRegex.exec('a')
        expect(match3?.groups?.port).toBeUndefined()

        const match5 = portRegex.exec('-1')
        expect(match5?.groups?.port).toBeUndefined()
    });
});


