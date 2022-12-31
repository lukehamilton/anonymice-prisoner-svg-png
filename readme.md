# Convert Anonymice Prisoner SVG to PNG

To convert `input.svg` to `output.png`

 `npm run convert-prisoner`

 *Can also pass in a string if reading svg from an api not filesystem.*

 Issue with directly converting with `sharp` is the prisoner svg has 3 child `<images>`. 
 
 The first and last are the foreground and background images and are `base64` strings representing pngs. 
 
 The middle is the mouse and is a `base64` string representing an `svg`. Sharp can't convert from base64 svg strings to png. 
 
 We need to decode the `base64` mouse string and build a new prisoner svg with the contents of the mouse svg and the original first and last `<image>` tags and then use that as the input to sharp's `png` command.

## Improvements
- Current script just assumes the structure of the prisoner svg
- Refactor script to work with any svg
- This likely requires recursively going through the base64 svg tree to create the new strings as needed. 

