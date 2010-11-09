BUILD_DIR = built

core-parts = shore-1-base.coffee shore-2-not-types.coffee \
             shore-3-types.coffee shore-4-builtins.coffee \
             shore-5-canonizations.coffee

all: clean-old $(BUILD_DIR)/shore.js $(BUILD_DIR)/shore.parser.js \
     $(BUILD_DIR)/shore.ui.js $(BUILD_DIR)/shore.tests.js \
     $(BUILD_DIR)/style.css $(BUILD_DIR)/main.js

open: all
	open main.html

test: all
	node $(BUILD_DIR)/shore.tests.js

clean:
	rm -rf $(BUILD_DIR)

# remove files older than their sources

clean-old:
	# TODO: make this less crap or stop using bloody makefiles
	[ -e $(BUILD_DIR)/shore.js ] && \
	([ $(BUILD_DIR)/shore.js -ot shore-1-base.coffee ] || \
	 [ $(BUILD_DIR)/shore.js -ot shore-2-not-types.coffee ] || \
	 [ $(BUILD_DIR)/shore.js -ot shore-3-types.coffee ] || \
	 [ $(BUILD_DIR)/shore.js -ot shore-4-builtins.coffee ] || \
	 [ $(BUILD_DIR)/shore.js -ot shore-5-canonizations.coffee ]) && \
		rm -v $(BUILD_DIR)/shore.js; true;
	
	for name in shore.ui shore.tests main; do \
		[ -e $(BUILD_DIR)/$$name.js ] && \
		[ $(BUILD_DIR)/$$name.js -ot $$name.coffee ] && \
			rm -v $(BUILD_DIR)/$$name.js; true; \
	done
	
	[ -e $(BUILD_DIR)/shore.parser.js ] && \
	[ $(BUILD_DIR)/shore.parser.js -ot shore.grammar.js ] && \
		rm -v $(BUILD_DIR)/shore.parser.js; true
	
	[ -e $(BUILD_DIR)/style.css ] && \
	([ $(BUILD_DIR)/style.css -ot style.sass ] || \
	 [ $(BUILD_DIR)/style.css -ot useful.sass ]) && \
		rm -v $(BUILD_DIR)/style.css; true

# requiring coffeescript...

$(BUILD_DIR)/shore.js:
	cat $(core-parts) | coffee --stdio -c > $(BUILD_DIR)/shore.js

$(BUILD_DIR)/shore.ui.js:
	coffee -c -o $(BUILD_DIR) shore.ui.coffee

$(BUILD_DIR)/shore.tests.js:
	coffee -c -o $(BUILD_DIR) shore.tests.coffee

$(BUILD_DIR)/main.js:
	coffee -c -o $(BUILD_DIR) main.coffee

# requiring node.js and jison

$(BUILD_DIR)/shore.parser.js:
	node shore.grammar.js -q > $(BUILD_DIR)/shore.parser.js

# requiring sass

$(BUILD_DIR)/style.css:
	sass -C style.sass $(BUILD_DIR)/style.css
