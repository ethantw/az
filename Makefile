all ::
	lsc -c *ls

run ::
	lsc -cw *ls | static-here

wc ::
	@echo -n Lines:
	@grep -v '# \|^$$' *.ls *.html ../*css | wc -l
