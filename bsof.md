# BSOF: Binary Structured Object Format

BSOF is a structured binary representation for data of various types.

## Types

Type tags are stored with a variable-size string of bytes. The end of the string can be found by finding the first byte with a leading `0` bit (`00`-`7f`). This gives 7 bits of data per byte in the tag. If tag is a single byte starting with two `0` bits, it's one of 64 well-known types, and otherwise, it's a custom type.

### Well-known types

- `00` to `3f`: Short string (size of string is last 5 bits)