# ln-constr-parser

[![NPM version](https://img.shields.io/npm/v/@synonymdev/ln-constr-parser?color=%23FFAE00&style=flat-square)](https://www.npmjs.com/package/@synonymdev/ln-constr-parser)

Convenient, dependency-free Lightning connection string parser for front- and backend.

## Usage

```typescript
import {parseConnectionString} from '@synonymdev/ln-constr-parser';

const connectionString = '0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f@127.0.0.1:9735';
const {host, hostType, port, pubKey} = parseConnectionString(connectionString);

console.log(host); // 127.0.0.1
console.log(hostType); // ipv4. Depending on the address provided, it could also be ipv6, torv3 or domain.
console.log(port); // 9735
console.log(pubKey); // 0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f
```

The `port` is optional. You can make the port mandatory so the parser will throw an error. This also avoids the
ipv6 ambiguity problem (see below).

```typescript
parseConnectionString(connectionString, {portMandatory: true})
```

### Parse Errors

In case of an invalid connection string, the parser will throw a detailed error of what is wrong.

```typescript
import {parseConnectionString, ParseFailureCode, ParseError} from '@synonymdev/ln-constr-parser';

try {
    const connectionString = 'pubkey@host:port';
    parseConnectionString(connectionString);
} catch (e) {
    if (e instanceof ParseError) {
        console.log('Parse failed. Reason:', e.code)
        if (e.code === ParseFailureCode.INVALID_HOST) {
            console.log('Host value is invalid.')
        } else if (e.codee === ParseFailureCode.INVALID_IPV6) {
            console.log('IPv6 host is invalid.')
        } else if (e.codee === ParseFailureCode.AMBIGUOUS_IPV6) {
            console.log('IPv6 host is ambiguous. Use square brackets [] like pubkey@[ipv6]:port.')
        } else if (e.code === ParseFailureCode.INVALID_PORT) {
            console.log('Invalid port.')
        } else if (e.code === ParseFailureCode.INVALID_PUBKEY) {
            console.log('Invalid lightning pubkey.')
        } else if (e.code === ParseFailureCode.INVALID_ATS) {
            console.log('The connection string must contain one single @ symbol.')
        }
    }
}
```

## Supported Address Formats

The library supports all commonly used address formats in the form of 
- `pubkey@host:port`
- `pubkey@host`
- `pubkey@[host]:port`
- `pubkey@[host]`

**ipv4**
- Regular `pubkey@127.0.0.1:port`.
- No port `pubkey@127.0.0.1`.
- Square brackets `pubkey@[127.0.0.1]:port`.
- Square brackets no port `pubkey@[127.0.0.1]`.

**ipv6**
- Square brackets `pubkey@[2001:db8:3333:4444:5555:6666:7777:8888]:port`.
- Square brackets compressed `pubkey@[2001:db8::8888]:port`.
- Square brackets no port `pubkey@[2001:db8:3333:4444:5555:6666:7777:8888]`.
- Square brackets compressed no port `pubkey@[2001:db8::8888]`.
- Regular uncompressed `pubkey@2001:db8:3333:4444:5555:6666:7777:8888:port`.
- No port uncompressed `pubkey@2001:db8:3333:4444:5555:6666:7777:8888`.

> **⚠️ Ambiguity problem** If you don't make the port mandatory, it is adviced to use square brackets `[]` with IPv6. It is impossible to separate a compressed IPv6 from the port. Example:
> `2001:db8::8888:9735` may as well be a IPv6 (`2001:db8::8888:9735`) OR a IPv6:port (`2001:db8::8888` and port `9735`).
> The library will do its best to parse it correctly but will throw an error in case of ambiguity.

**torv3**
- Regular `pubkey@giexynrrloc2fewstcybenljdksidtglfydecbellzkl63din6w73eid.onion:port`.
- No port `pubkey@giexynrrloc2fewstcybenljdksidtglfydecbellzkl63din6w73eid.onion`.
- Square brackets `pubkey@[giexynrrloc2fewstcybenljdksidtglfydecbellzkl63din6w73eid.onion]:port`.
- Square brackets no port `pubkey@[giexynrrloc2fewstcybenljdksidtglfydecbellzkl63din6w73eid.onion]`.

**domain**
- Regular `pubkey@synonym.to:port`.
- No port `pubkey@synonym.to`.
- Square brackets `pubkey@[synonym.to]:port`.
- Square brackets no port `pubkey@[synonym.to]`.




## Parse Subcomponents

The library also provides functions to parse the individual components of a connection string.

```typescript
import {parseAddress, parseHost, parsePort, parsePubkey} from '@synonymdev/ln-constr-parser';

const {host, hostType, port} = parseAddress('127.0.0.1:9000')
const {host, hostType} = parseHost('127.0.0.1')
const port = parsePort('900')
const pubkey = parsePubkey('0200000000a3eff613189ca6c4070c89206ad658e286751eca1f29262948247a5f')
```


---

May the ⚡ be with you.