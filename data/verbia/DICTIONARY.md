# Verbia dictionary

Verbia's playable lexicon is generated from SCOWL (Spell Checker Oriented Word Lists), using the normal English, American, British, and British-variant `words` categories through size level 70.

The build intentionally excludes SCOWL's separate proper-name, abbreviation, uppercase, contraction, Roman-numeral, and specialist-jargon categories. Words shorter than three letters or longer than seven letters are also omitted because current Verbia boards use three to seven letters.

For a family-safe game experience, entries in SCOWL's supplied `profane` and `offensive` lists are excluded. `ETA` is additionally excluded under the game's no-abbreviations policy.

The generated browser asset is `lexicon.js`. SCOWL's complete redistribution notice is included in `SCOWL-LICENSE.txt`.

Source: https://github.com/embernet/scowl_wordlist

This is a strict game dictionary, not a claim that every edition of every dictionary contains exactly the same words. Future additions should be verified against a reputable dictionary and added through the source-generation process rather than patched into individual boards.
