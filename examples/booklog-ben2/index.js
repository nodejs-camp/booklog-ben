/**
 * Module dependencies.
 */

var express = require('../../lib/express');

// Path to our public directory

var pub = __dirname + '/public';

// setup middleware

var app = express();
app.use(express.static(pub));

// Optional since express defaults to CWD/views

app.set('views', __dirname + '/views');

// Set our default template engine to "jade"
// which prevents the need for extensions
// (although you can still mix and match)
app.set('view engine', 'jade');

function User(name, email) {
  this.name = name;
  this.email = email;
}

// Dummy users
var users = [
    new User('tj', 'tj@vision-media.ca')
  , new User('ciaran', 'ciaranj@gmail.com')
  , new User('aaron', 'aaron.heckmann+github@gmail.com')
];


app.get('/', function(req, res){
  res.render('users', { users: users });
});

var posts = [];
var count = 0;

/*app.all('*', function(req, res, next){ //app.all不管所有協定都去跑，*代表所有url也是
	console.log('count'+count++);//計算瀏覽次數
	if (req.headers.host === 'localhost:3000') {
		console.log("Access denied"); //阻止其他人去讀下面的API
	}
	else {
		next(); //告訴express此條件成立，繼續往下比較路徑
	}
	
});*/

app.get('/welcome', function(req, res){
	res.render('index');
});



app.get('/download', function(req,res){
	var events = require('events');
	var workflow = new events.EventEmitter();

	workflow.outcome = {
		success : false
	}

	workflow.on('validate', function(){
		var password = req.query.password;
		if (password=== '123456'){
			return workflow.emit('success');
		}
		return workflow.emit('error');
	});

	workflow.on('success', function(){
		workflow.outcome.success = true;
		workflow.outcome.redirect={
			url : '/welcome'
		};
		workflow.emit('response');
	});
	workflow.on('error', function(){
		count++;
		workflow.outcome.success=false;
		workflow.emit('response');
	});
	workflow.on('response', function(){
		if(count===3){
			res.send(workflow.outcome);
		}else{
			res.send(workflow.outcome);
		};
	});
	return workflow.emit('validate');
});

app.get('/1/post', function(req,res){
	var result ={
		title : "gogo",
		content: "oyoy"
	};
	res.send(result);
});

app.post('/1/post', function(req, res){
	var subject;
	var content;
	//if (typeof(req.body)==='undefined'){
		subject = req.params.subject;
		content = req.params.content;
	//};
	var post = {
		subject : subject,
		content : content
	}
	res.send({status:'ok',post:post});

});

/*app.post('/1/post', function(req, res){ // app.post為rest post 方法
	var result = {
		titl: "Test",
		content: "post"
	}; //{}為JS的物件
	res.send(result);
});  */

app.put('/1/post/:postId', function(req, res){ //uri :後面代的為參數
	var id = req.params.postId;
	res.send("updated a post"+id);

	/*var result = {
		titl: "Test",
		content: "put"
	}; //{}為JS的物件
	res.send(result); */
}); 

app.delete('/1/post', function(req, res){
	var result = {
		titl: "Test",
		content: "delete"
	}; //{}為JS的物件
	res.send(result);
}); 
// change this to a better error handler in your code
// sending stacktrace to users in production is not good
app.use(function(err, req, res, next) {
  res.send(err.stack);
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
