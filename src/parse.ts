import { ParseError, ParseFailureCode } from "./ParseError"
import { domainNameRegex, ipv4Regex, ipv6Regex, portRegex, pubkeyRegex, squareBracketsAddressRegex, torv3Regex } from "./regex";

export type HostType = 'ipv6' | 'ipv4' | 'torv3' | 'domain';

export interface ParsedConnectionString {
    /**
     * Host part of the connection string. Could be an IPv4, IPv6, Tor v3 address or a domain name.
     */
    host: string, 
    /**
     * Port number of the connection string if provided. Is between 1 and 65535.
     */
    port?: number,
    /**
     * Lightning public key.
     */
    pubkey: string,
    /**
     * Host type.
     */
    hostType: HostType 
}


/**
 * Splits the address to a host and optionally a port. Throws ParseError if the address is invalid.
 * @param addressString 
 * @param opts.portMandatory Last number after colon is always port. This removes the IPv6 ambiguity because the port is always at the end.
 * @returns 
 */
export function splitHostAndPort(addressString: string, opts: Partial<{portMandatory: boolean}> = {}): {
    notValidatedHost: string,
    notValidatedPort?: string
} {
    // Easy, host is in square brackets [] and port is optionally behind a colon.
    const squareBracketMatch = squareBracketsAddressRegex.exec(addressString) 
    if (squareBracketMatch) {
        const squareBracketContent = squareBracketMatch[2]
        const squareBracketPort = squareBracketMatch[4]
        return {
            notValidatedHost: squareBracketContent || '',
            notValidatedPort: squareBracketPort
        }
    }

    // Max 1 colon. So it is not an ipv6.
    const colonCount = (addressString.split(":").length - 1)
    if (colonCount <= 1) {
        // Either tor or ipv4
        const splitted = addressString.split(":")
        return {
            notValidatedHost: splitted[0],
            notValidatedPort: splitted[1]
        }
    }

    if (opts.portMandatory) {
        // Port is provided in the address string. So we can split on the last colon.
        const splitted = addressString.split(":")
        const host = splitted.slice(0, -1).join(':')
        const port = splitted[splitted.length - 1]
        return {
            notValidatedHost: host,
            notValidatedPort: port
        }
    }

    // Ipv6 without square brackets []. Here the guessing begins.
    const isCompressed = addressString.includes('::')
    if (!isCompressed) {
        // Ipv6 consists of 8 groups plus an optional port.
        const groups = addressString.split(":")
        if (groups.length > 9 || groups.length < 8) {
            // Invalid ipv6
            throw new ParseError('Invalid host. Invalid ipv6?', ParseFailureCode.INVALID_HOST)
        }
        const host = groups.slice(0, 8).join(':')
        const port = groups[8]
        return {
            notValidatedHost: host,
            notValidatedPort: port
        }
    }

    // Ipv6 compressed
    // We can't determine the port here as it is ambigious.
    // 2001:db8::8888:9735 may as well be a IPv6 (2001:db8::8888:9735) OR a IPv6:port (2001:db8::8888 and port 9735).
    throw new ParseError('Compressed ipv6 host without square brackets []', ParseFailureCode.AMBIGUOUS_IPV6)
}

/**
 * Parses a host. Valid formats: ipv4, ipv6, torv3, domain. Throws ParseError if the host is invalid.
 * @param hostString 
 * @returns 
 */
export function parseHost(hostString: string): { host: string, hostType: HostType } {

    const ipv4Match = ipv4Regex.exec(hostString)
    if (ipv4Match) {
        return {
            host: hostString,
            hostType: 'ipv4'
        }
    }

    const ipv6Match = ipv6Regex.exec(hostString)
    if (ipv6Match) {
        return {
            host: hostString,
            hostType: 'ipv6'
        }
    }

    const torv3Match = torv3Regex.exec(hostString)
    if (torv3Match) {
        return {
            host: hostString,
            hostType: 'torv3'
        }
    }

    const domainMatch = domainNameRegex.exec(hostString)
    if (domainMatch) {
        return {
            host: hostString,
            hostType: 'domain'
        }
    }

    throw new ParseError('Invalid host.', ParseFailureCode.INVALID_HOST)
}

/**
 * Address consists of a host and an optional port. The host may be in square brackets [].
 * Examples: 127.0.0.1:9375, [::1]:9375, synonym.to:9375, 127.0.0.1.
 * Throws ParseError if the address is invalid.
 * @param addressString 
 * @param opts.portMandatory If true, throws ParseError if port is not provided.
 * @returns 
 */
export function parseAddress(addressString: string, opts: Partial<{portMandatory: boolean}> = {}): { host: string, port?: number, hostType: HostType } {
    const { notValidatedHost, notValidatedPort } = splitHostAndPort(addressString, {portMandatory: opts.portMandatory})
    const { host, hostType } = parseHost(notValidatedHost)

    const port = parsePort(notValidatedPort, {portMandatory: opts.portMandatory})

    return {
        port: port,
        host: host,
        hostType: hostType
    }
}

/**
 * Parse port number. Must be between 1 and 65535. Throws ParseError if the port is invalid.
 * @param portString 
 * @param opts.portMandatory If true, throws ParseError if port is not provided.
 * @returns 
 */
export function parsePort(portString?: string, opts: Partial<{portMandatory: boolean}> = {}): number | undefined {
    if (!portString) {
        if (opts.portMandatory) {
            throw new ParseError('Port is mandatory but is not provided.', ParseFailureCode.INVALID_PORT)
        } else {
            return undefined
        }
    }
    const portMatch = portRegex.exec(portString)
    if (!portMatch) {
        throw new ParseError('Invalid port.', ParseFailureCode.INVALID_PORT)
    }
    return Number.parseInt(portString)
}

/**
 * Parses a pubkey. Throws ParseError if the pubkey is invalid.
 * @param pubkeyString 
 * @returns 
 */
export function parsePubkey(pubkeyString: string): string {
    const pubkeyMatch = pubkeyRegex.exec(pubkeyString)
    if (!pubkeyMatch) {
        throw new ParseError('Invalid pubkey.', ParseFailureCode.INVALID_PUBKEY)
    }
    return pubkeyString
}


/**
 * Simple connection string parse. Throws ConnectionStringValidationError if the string is invalid.
 * @param connectionString Connection string to parse.
 * @param opts.portMandatory Last number after colon is always port. This removes the IPv6 ambiguity because the port is always at the end.
 * @returns 
 */
export function parseConnectionString(connectionString: string, opts: Partial<{portMandatory: boolean}> = {}): ParsedConnectionString {
    const split = connectionString.split('@')
    if (split.length !== 2) {
        throw new ParseError('@ does not split the string in two parts.', ParseFailureCode.INVALID_ATS)
    }
    const pubkeyString = split[0]

    const pubkey = parsePubkey(pubkeyString)

    const addressString = split[1]
    const address = parseAddress(addressString, {portMandatory: opts.portMandatory})

    return {
        pubkey: pubkey,
        hostType: address.hostType,
        host: address.host,
        port: address.port
    }
}