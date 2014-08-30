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

//app.all('*', function(req, res, next){ //app.all不管所有協定都去跑，*代表所有url也是
	console.log('count'+count++);//計算瀏覽次數
	/*if (req.headers.host === 'localhost:3000') {
		console.log("Access denied"); //阻止其他人去讀下面的API
	}
	else {
		next(); //告訴express此條件成立，繼續往下比較路徑
	}*/
	
//});


app.get('/1/post', function(req, res){//call back function，前面為set uri，後面為執行function
	var result = {
		titl: "Test",
		content: "Foo"
	}; //{}為JS的物件
	res.send(result);
});  

app.post('/1/post', function(req, res){//call back function，前面為set uri，後面為執行function
	var subject;
	var content;
	
	if (typeof(req.body) === 'undefined') { //型態與字串要相等
		subject = req.query.subject; //讀request body 裡面 key為subject的值
		content = req.query.content; //讀request body 裡面 key為content的值
	};
	console.log(req.body);
	var post = {
		subject: subject,
		content: content
	};
	posts.push(post); 
	res.send({status:'ok', posts:post}); 
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
