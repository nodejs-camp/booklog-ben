/**
 * Module dependencies.
 */

var express = require('../../lib/express');

// Path to our public directory

var pub = __dirname + '/public';

// setup middleware

var app = express(); // app這物件所有index.js裡面都可使用
app.use(express.static(pub));


// Optional since express defaults to CWD/views

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/booklog2');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('MongoDB: connected.');	
});

var postSchema = new mongoose.Schema({
    subject: { type: String, default: ''},
    content: String
});

app.db = {
	posts: mongoose.model('Post', postSchema)
};



app.set('views', __dirname + '/views'); // 從view folder去讀取頁面

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

var postcontent = [{
	subject: "subject",
	content: "content"
},{
	subject: "Hello",
	content: "hi"
}];

var bodyParser = require('body-parser'); //require等於import events class，因為他是外部模組(npm body-parser模組)
app.use(bodyParser.urlencoded({
	extended: true
	}));

var count = 0;

app.get('/welcome', function(req, res){ 
	res.render('index'); //從view folder讀取index.jade檔案
	
});

app.get('/post', function(req, res){
	res.render('post',{
		post: postcontent
	}); //從view folder讀取post.jade檔案
	
});

var count = 0 ;

app.get('/download', function(req, res){ //此命名風格為網頁
	var events = require('events'); // require等於import events class，因為他是外部模組
	var workflow = new events.EventEmitter(); //載入到記憶體中，類別實例化

	workflow.outcome = {  //outcome 為一物件
		success: false // tag & value
	};

	workflow.on('validate', function(){  //開始設定workflow狀態檢查
		var password = req.query.password;  //在用API打時，url需要打成這樣http://localhost:3000/download?password=123456

		if (password === '123456'){
			return workflow.emit('success'); //emitter.emit(event, [arg1], [arg2], [...])方法
			
		};
		return workflow.emit('error');
	});

	workflow.on('success', function(){
		workflow.outcome.success = true;
		workflow.outcome.redirect = {
			url: '/weclome'
		};
		workflow.emit('response');
	});

	workflow.on('error', function(){
		count ++; 
		workflow.outcome.success = false;
		workflow.emit('response');
	});

	workflow.on('response', function() {
		console.log('count'+count);
		if (count ===3) {
			res.send(workflow.outcome);
			console.log("吃屎吧");
		}else{
			res.send(workflow.outcome);
			
		};
		});
		return workflow.emit('validate');
	});


app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', '*'); //set http header 可以允許不同網域的人來讀取此網頁
  res.set('Access-Control-Allow-Methods', 'PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});


//app.all('*', function(req, res, next){ //app.all不管所有協定都去跑，*代表所有url也是
	//console.log('count'+count++);//計算瀏覽次數
	/*if (req.headers.host === 'localhost:3000') {
		console.log("Access denied"); //阻止其他人去讀下面的API
	}
	else {
		next(); //告訴express此條件成立，繼續往下比較路徑
	}*/
	
//});

//此命名風格為API，只回傳給JSON
app.get('/1/post', function(req, res){//call back function，前面行為set url執行完，再將後面匿名函數當作參數執行，req為express所給的物件
	var posts = req.app.db.posts;

	posts.find(function(err, posts) {
		res.send({posts: posts});	
	});

	/*var result = {
		titl: "Test",
		content: "Foo"
	}; //{}為JS的物件 */
	//res.send({post: posts});	
	//res.send(result);
});  

app.post('/1/post', function(req, res){//call back function，前面為set url，後面為執行function
	var posts = req.app.db.posts;

	var subject;
	var content;

	if (typeof(req.body.subject) === 'undefined') {
		subject = req.query.subject;
		content = req.query.content;

	} else {
		subject = req.body.subject;
		content = req.body.content;		
	}

	var data = {
		subject: subject,
		content: content
	};
	console.log(data);
	var post = new posts(data);
	post.save();

	res.send({ status: 'OK'})

	/*var subject;
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
	
	var card = new posts(post); //new 一個目錄posts下new一個新檔案，裡面放post內容
	card.save(); //save完mongodb會自動產生一筆id



	posts.push(post); 
	res.send({status:'ok', posts:post}); */
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
	var posts = req.app.db.posts;

	posts.findOne({_id: id}, function(err, post) {
		res.send({post: post});	
	});
	//res.send("updated a post"+id);

	/*var result = {
		titl: "Test",
		content: "put"
	}; //{}為JS的物件
	res.send(result); */
}); 

app.delete('/1/post', function(req, res){
	var posts = req.app.db.posts;

	posts.find(function(err, posts) {
		res.send({posts: posts});	
	});


	/*var result = {
		titl: "Test",
		content: "delete"
	}; //{}為JS的物件
	res.send(result);*/
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
