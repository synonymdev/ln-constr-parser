import * as regex from './regex';


describe('connectionString regex', () => {

    test('ipv4', async () => {
        const ipv4Regex = regex.ipv4Regex

        const match = ipv4Regex.exec('34.65.85.39')
        expect(match).toBeTruthy()

        const match2 = ipv4Regex.exec('34.65.85.3a')
        expect(match2).toBeFalsy()

        const match3 = ipv4Regex.exec('34.65.85.333')
        expect(match3).toBeFalsy()
    });

    test('ipv6', async () => {
        const ipv6Regex = regex.ipv6Regex
        const match = ipv6Regex.exec('2001:db8:3333:4444:5555:6666:7777:8888')
        expect(match).toBeTruthy()

        const match2 = ipv6Regex.exec('2001:db8:3333:4444:5555:6666:7777:8888z')
        expect(match2).toBeFalsy()

        const match3 = ipv6Regex.exec('2001:db8:3333:4444:5555:6666:7777:888z')
        expect(match3).toBeFalsy()

        const match4 = ipv6Regex.exec('2001:db8:3333::8888')
        expect(match4).toBeTruthy()

        const match5 = ipv6Regex.exec('2001:db8:3333:4444:5555:8888')
        expect(match5).toBeFalsy()
    });

    test('torv3', async () => {
        const torv3Regex = regex.torv3Regex
        const match = torv3Regex.exec('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(match).toBeTruthy()

        const match2 = torv3Regex.exec('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion$')
        expect(match2).toBeFalsy()

        const match3 = torv3Regex.exec('wdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqd.onion')
        expect(match3).toBeFalsy()

        const match5 = torv3Regex.exec('gwdllz5g7vky2q4gr45zguvoajzf33czreca3a3exosftx72ekppkuqdonion')
        expect(match5).toBeFalsy()
    });

    test('domainName', async () => {
        const domainRegex = regex.domainNameRegex
        const match1 = domainRegex.exec('swiss-reign.ch')
        expect(match1).toBeTruthy()

        const match2 = domainRegex.exec('sub.swiss-reign.ch')
        expect(match2).toBeTruthy()

        const match3 = domainRegex.exec('.sub.swiss-reign.ch')
        expect(match3).toBeFalsy()

        const match4 = domainRegex.exec('localhost')
        expect(match4).toBeFalsy()

        const match5 = domainRegex.exec('myreallylongnamelongerthan64charactersmyreallylongnamelongerthan64charactersmyreallylongnamelongerthan64characters')
        expect(match5).toBeFalsy()

        const match6 = domainRegex.exec('sub.swiss-reign.ch-')
        expect(match6).toBeFalsy()

        const match7 = domainRegex.exec('127.0.0.1')
        expect(match7).toBeFalsy()
    });


    test('port', async () => {
        const portRegex = regex.portRegex
        const match = portRegex.exec('120')
        expect(match).toBeTruthy()

        const match2 = portRegex.exec('1200000')
        expect(match2).toBeFalsy()

        const match3 = portRegex.exec('a')
        expect(match3).toBeFalsy()

        const match5 = portRegex.exec('-1')
        expect(match5).toBeFalsy()
    });
});


