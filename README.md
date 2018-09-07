# Pixel Synth
A very rough prototype for a simple web-based video synthesizer - there is much to be optimized with performance. There are 3 primary channels, red, green and blue, each which are given a wave table (an array) for indexing values. These channels are then drawn from top left to bottom right each frame, before their waves are "shifted" and they are drawn all over again. They can also receive modulation from other channels, creating interesting feedback loops.

### [Demo here](http://pix-synth.herokuapp.com)
[interesting GIFs from synth](https://twitter.com/macint0shpie/status/1005293877761335296)

## General Plan:
1. Create basic functioning, interactive synthesizer :rocket:
2. Characterize function performance and optimize :rocket:
3. Refactor code for better organization :construction:
4. Overhaul UI :construction:
