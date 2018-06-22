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

var iterate = function(tags,cssRules,level){
	tags.forEach(value => {
		
		console.log("-".repeat(level),value.name);
		if(value.attribs){
			
			let id = value.attribs.id;
			if(id){
				id = '#'+id;
				const data = cssRules.find(value=>{
					return value.selectors.includes(id);
				});
				
				//if(data)
					console.log(' '.repeat(level+1),
						id,
						'[',
						data.declarations
						.map(dec=> dec.property+':'+dec.value)
						.reduce((a,b) => a+';'+ b),
						']');
				/*data.declarations.forEach(dec=>{
					console.log(' '.repeat(level+1),id,'[',dec.property,':',dec.value,']');
				});*/
				
			}
			
			let classes = value.attribs.class;
			if(classes){
				classes
				.split(' ')
				.forEach(cla=>{
					cla = '.'+cla;
					const data = cssRules.find(value=>{
						return value.selectors.includes(cla);
					});
					
					if(data)
					data.declarations.forEach(dec=>{
						console.log(' '.repeat(level+1),cla,'[',dec.property,':',dec.value,']');
					});
				});
			}
			
			
			//console.log(" ".repeat(level),id, classes);
		}
		
		
		if(value.children &&value.children.length>0)
			iterate(value.children.filter(tagFilter),
		cssRules,++level);
	});
}

var parsing = function(rawHtml, rawcss){
	var handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error)
        console.log(error);
    else
        console.log('no error');
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
	
	iterate(htmlTags, cssRules,0);
};

readFiles(files, function (errors, data) {
	parsing(data[0],data[1]);
});

