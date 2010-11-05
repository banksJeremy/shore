BUILD_DIR = built

all: clean-old $(BUILD_DIR)/shore.js $(BUILD_DIR)/shore.parser.js \
     $(BUILD_DIR)/shore.ui.js $(BUILD_DIR)/shore.tests.js \
     $(BUILD_DIR)/main.css $(BUILD_DIR)/main.js

open: all
	open main.html

test: all
	node $(BUILD_DIR)/shore.tests.js

clean:
	rm -rf build

# remove files older than their sources

clean-old:
	for name in shore shore.ui shore.tests main; do \
		[ -e $(BUILD_DIR)/$$name.js ] && \
		[ $(BUILD_DIR)/$$name.js -ot $$name.coffee ] && \
			rm -v $(BUILD_DIR)/$$name.js; true; \
	done
	
	[ -e $(BUILD_DIR)/shore.parser.js ] && \
	[ $(BUILD_DIR)/shore.parser.js -ot shore.grammar.js ] && \
		rm -v $(BUILD_DIR)/shore.parser.js; true

# requiring coffeescript...

$(BUILD_DIR)/shore.js:
	coffee -c -o $(BUILD_DIR) shore.coffee

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

$(BUILD_DIR)/main.css:
	sass -C main.sass $(BUILD_DIR)/main.css
