export enum ParseFailureCode {
    /**
     * Host part is invalid.
     * Host can be either an IPv4, IPv6, Tor v3 address or a domain name.
     */
    INVALID_HOST = 'invalidHost',
    /**
     * Ipv6 is invalid.
     */
    INVALID_IPV6 = 'invalidIpv6',
    /**
     * Port is invalid. Must be between 1 and 65535.
     */
    INVALID_PORT = 'invalidPort',
    /**
     * Lightning pubkey is invalid.
     */
    INVALID_PUBKEY = 'invalidPubkey',
    /**
     * @ is missing or too many @ present.
     */
    INVALID_ATS = 'invalidAts',
}

export class ParseError extends Error {
    constructor(message: string, public code: ParseFailureCode) {
        super(message)
        this.name = 'ParseError'
    }
}