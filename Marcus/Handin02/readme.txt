Handin02 - The Love Song isn't Dead, it's Evolving

Run
Open index.html with VS Code Live Server, or run this command in this folder:
  python -m http.server 8000
Then visit http://localhost:8000. Do not open the page using file://:
the browser needs HTTP to load the CSV. Internet access is needed for
the existing D3 CDN and Google Fonts.

Explore
All categories and 1958-2023 are selected initially. The dropdown filters
the actual category data. Both slider endpoints are inclusive; the bundled
slider updates after a 500 ms pause. Coincident handles show one year.
Hover inside the plot for the nearest year's exact counts and guideline.
The tooltip's total always includes all categories, including Non-love Songs.

Data and design
Counts represent CSV song entries grouped by calendar debut year, not
weeks in the Top 10. Blank categories become Non-love Songs. Missing
year/category counts are zero. Each row is counted once.
The centered/wiggle streamgraph is an intentional choice instead of the
assignment wireframes' zero-baseline chart. Band thickness encodes counts;
vertical offsets are not counts. The vertical scale is fixed across filters.
A single-year band is a display of that year's values, not extra observations.

Submission
The Marcus copy of Handin2.docx requires a ZIP of the full solution code.
Include index.html, this readme.txt, css, js and data with their relative
paths intact. No video is required by this copy of the assignment.
Do not include session tooling, browser profiles or test artifacts.
No build step, npm packages, staging, commits or pushing are required.
