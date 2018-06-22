var htmlparser = require("htmlparser");
var css = require('css');
var fs = require('fs');
var files = [
   'sample.html',
   'sample.css'
];

var tagFilter = function(value){
	return value.type == 'tag';
};

var ruleFilter = function(value){
	return value.type == 'rule';
};

var readFiles = function(paths, cb) {
    var result = [], errors = [], l = paths.length;
    paths.forEach(function (path, k) {

        fs.readFile(path,'utf8', function (err, data) {
            --l;
            err && (errors[k] = err);
            !err && (result[k] = data);
            !l && cb (errors.length? errors : undefined, result);
        });

    });
}

var iterate = function(htmlTags, cssRules, level){
	const s = '  ';
	htmlTags.forEach(tag => {
		
		console.log(s.repeat(level),tag.name);
		if(tag.attribs){
			
			let id = tag.attribs.id;
			if(id){
				id = '#'+id;
				const matchedId = cssRules.find(value=>{
					return value.selectors.includes(id);
				});
				
				if(matchedId){
					var styles = matchedId.declarations
										.map(dec=> dec.property+':'+dec.value)
										.reduce((a,b) => a+'; '+ b);
						
					console.log(s.repeat(level+1),id,'[',styles,']');
				}
				
			}
			
			let classes = tag.attribs.class;
			if(classes){
				classes
				.split(' ')
				.forEach(cls=>{
					cls = '.'+cls;
					const matchedClass = cssRules.find(value=>{
						return value.selectors.includes(cls);
					});
					
					if(matchedClass){
						var styles = matchedClass.declarations
											.map(dec=> dec.property+':'+dec.value)
											.reduce((a,b) => a+'; '+ b);
						console.log(s.repeat(level+1),cls,'[',styles,']');
					}
				});
			}
		}
		
		if(tag.children &&tag.children.length>0)
			iterate(tag.children.filter(tagFilter),cssRules,++level);
	});
}

var parsing = function(rawHtml, rawcss){
	var handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error)
        console.log(error);
	},
		{ 
		verbose: false, 
		ignoreWhitespace: true,
		enforceEmptyTags: true
		}
	);
	
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(rawHtml);
	
	var htmlTags = handler.dom.filter(tagFilter);
	
	var cssRules = css.parse(rawcss)
					.stylesheet
					.rules
					.filter(ruleFilter);
	
	iterate(htmlTags, cssRules, 0);
};

readFiles(files, function (errors, data) {
	parsing(data[0],data[1]);
});

