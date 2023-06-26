# Changelog

## 1.0.1 - 26.06.2013 - Severin Bühler

- (feat) Added `portMandatory` parameter to `parseConnectionString` function to avoid the ipv6 ambiguity problem.
- (feat) Added distinct `ParseFailureCode.AMBIGUOUS_IPV6` error in case the provided ipv6 address can't be correctly separated.

## 1.0.0 - 16.06.2013 - Severin Bühler

- (feat) first version.
