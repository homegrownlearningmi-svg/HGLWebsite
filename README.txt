HOMEGROWN LEARNING - DEDICATED EVENT REQUEST PAGE

FILES TO UPLOAD
- index.html
- request-event.html
- assets/pricing.pdf

WHAT CHANGED ON THE HOMEPAGE
- Every event-request button now opens request-event.html.
- School and church links preselect the matching organization type.
- The original event form was removed from the homepage.
- The Google Calendar consultation remains on the homepage.
- The pricing FAQ now points to the dedicated request page.

NEW REQUEST PAGE
- Keeps all fields from the old event form.
- Adds visit-length choices:
  1.5 hours - $175
  3 hours - $335
  5 hours - $500
- Adds 30-minute and 60-minute lesson-plan information.
- Adds included-animal selection.
- Adds up to two additional animals.
- Adds chicken-hatching and brooder options.
- Calculates an estimated starting total.
- Sends the full selection summary through the existing Apps Script handler.

NO APPS SCRIPT CHANGE IS REQUIRED
The new page combines all pricing and animal selections into the existing
"message" field before sending. The current email and spreadsheet logging
therefore continue to work.

ANIMAL IMAGE PLACEHOLDERS
Add these later under assets/illustrations/:

animal-chicken.png
animal-rabbit.png
animal-duck.png
animal-chick.png
animal-bunny.png
animal-turkey.png
animal-goat.png
animal-sheep.png
animal-piglet.png
animal-lamb.png
animal-baby-goat.png
animal-incubator.png
animal-brooder.png

The page automatically shows the image when the matching file exists and keeps
a labeled placeholder when it does not.
