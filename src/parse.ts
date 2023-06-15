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



export function splitHostAndPort(addressString: string): {
    notValidatedHost: string,
    notValidatedPort?: string
} {
    // Easy, host is in square brackets [] and port is optionally behind a colon.
    const squareBracketMatch = squareBracketsAddressRegex.exec(addressString)
    const squareBracketContent = squareBracketMatch?.groups?.content
    const squareBracketPort = squareBracketMatch?.groups?.port
    if (squareBracketMatch) {
        return {
            notValidatedHost: squareBracketContent || '',
            notValidatedPort: squareBracketPort
        }
    }

    // No square brackets.
    const colonCount = (addressString.split(":").length - 1)
    if (colonCount <= 1) {
        // Either tor or ipv4
        const splitted = addressString.split(":")
        return {
            notValidatedHost: splitted[0],
            notValidatedPort: splitted[1]
        }
    }

    // Ipv6. Here the guessing begins.
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
    // We can't determin the port here. We just assume everything is the ip.
    throw new ParseError('Compressed ipv6 host without square brackets []', ParseFailureCode.INVALID_IPV6)
}

export function parseHost(hostString: string): { host: string, hostType: HostType } {

    const validatedIpv4 = ipv4Regex.exec(hostString)?.groups?.ipv4
    if (validatedIpv4) {
        return {
            host: validatedIpv4,
            hostType: 'ipv4'
        }
    }

    const validatedIpv6 = ipv6Regex.exec(hostString)?.groups?.ipv6
    if (validatedIpv6) {
        return {
            host: validatedIpv6,
            hostType: 'ipv6'
        }
    }

    const validatedTorv3 = torv3Regex.exec(hostString)?.groups?.torv3
    if (validatedTorv3) {
        return {
            host: validatedTorv3,
            hostType: 'torv3'
        }
    }

    const validatedDomain = domainNameRegex.exec(hostString)?.groups?.domain
    if (validatedDomain) {
        return {
            host: validatedDomain,
            hostType: 'domain'
        }
    }

    throw new ParseError('Invalid host.', ParseFailureCode.INVALID_HOST)
}

export function parseAddress(addressString: string): { host: string, port?: number, hostType: HostType } {
    const { notValidatedHost, notValidatedPort } = splitHostAndPort(addressString)
    const { host, hostType } = parseHost(notValidatedHost)

    const port = parsePort(notValidatedPort)

    return {
        port: port,
        host: host,
        hostType: hostType
    }
}

export function parsePort(portString?: string): number | undefined {
    if (!portString) {
        return undefined
    }
    const validatedPort = portRegex.exec(portString)?.groups?.port
    if (!validatedPort) {
        throw new ParseError('Invalid port.', ParseFailureCode.INVALID_PORT)
    }
    return Number.parseInt(validatedPort)
}

export function parsePubkey(pubkeyString: string): string {
    const nodeIdMatch = pubkeyRegex.exec(pubkeyString)
    const validatedPubkey = nodeIdMatch?.groups?.pubkey;
    if (!validatedPubkey) {
        throw new ParseError('Invalid pubkey.', ParseFailureCode.INVALID_PUBKEY)
    }
    return validatedPubkey
}


/**
 * Simple connection string parse. Throws ConnectionStringValidationError if the string is invalid.
 * @param connectionString Connection string to parse.
 * @returns 
 */
export function parseConnectionString(connectionString: string): ParsedConnectionString {
    const split = connectionString.split('@')
    if (split.length !== 2) {
        throw new ParseError('@ does not split the string in two parts.', ParseFailureCode.INVALID_ATS)
    }
    const pubkeyString = split[0]

    const pubkey = parsePubkey(pubkeyString)

    const addressString = split[1]
    const address = parseAddress(addressString)

    return {
        pubkey: pubkey,
        hostType: address.hostType,
        host: address.host,
        port: address.port
    }
}